/**
 * SecurityController
 *
 * @description :: Server-side logic for managing securities
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {

  register_and_generate_files: function (req, res) {

    var fs = require('fs')
    var wrench = require('wrench') // -> https://github.com/ryanmcgrath/wrench-js
    var s = security_service // See api/services/security_service.js
    var server = {
      status: 'pending' // Pre-create the server taht we will store with status = pending
    }

    if (!('body' in req)) return res.redirect('back') // If post data misses


    // Define what variables are necessary to configure a server
    var necessary_variables = [
      'host',
      'sudo_user',
      'mail_smtp',
      'mail_user',
      'mail_password',
      'machine_name',
      'company_name',
      'admin_mail',
    ]

    // Check that necessary variables are set in post data
    for (var index in necessary_variables) {
      var variable_name = necessary_variables[index]

      if (!(variable_name in req.body) || req.body[variable_name].length === 0) {

        // If variable is missing, redirect the req with a flash error
        req.flash('error', 'All required variables must be defined')
        return res.redirect('back')
        break
      }
    }


    // Set host_port to 22 if not defined - default ssh port
    if ('host_port' in req.body && req.body.host_port.length > 0) {
      server.host_port = req.body.host_port
    } else {
      server.host_port = '22'
    }


    // Completing the pre-created server object with post data
    // Note that because we are using schema less database, we can create any attribute with any value
    for (var attr in req.body) {
      var value = req.body[attr]
      if (value.length > 0) server[attr] = value
    }


    // For easier comprehension of configuration input, we only use comma to separate information like tcp_in, tcp_out or allowed ips
    // But in csf.conf we need semi-colon separation
    if ('port_knocing' in req.body && req.body.port_knocking.length > 0) {
      server.port_knocking = req.body.port_knocking.replace(',', ';')
    }

    // Check that the server not already exists -> we use host:host_port as a primary key
    // eg. 192.168.0.1:22

    Server.find({host: server.host, host_port: server.host_port}).then(function (servers) {
      // If a server is found, redirect req with a flash error
      if (servers.length > 0) {
        req.flash('error', 'server already exists')
        return res.redirect('back')
      }

      // Then create the server with pre-created server object
      Server.create(server).then(function (server) {

        var output_dir = 'linux_config/output/' + server.host + ':' + server.host_port

        // Create server directory if it does not exists
        wrench.mkdirSyncRecursive(output_dir)


        // Copy template config in server directory
        wrench.copyDirSyncRecursive('linux_config/templates', output_dir, {
          forceDelete: true // Necessary when we reinstall a server (clear db + creation of the same server host:host_port
        });


        var module_order = require('../../linux_config/config/module_order')

        for(var index in module_order){
          var module = module_order[index]
          var template_builder = require('../../linux_config/config/' + module + '/template_builder')

          template_builder(server, output_dir, misc_services.replaceInFile)
        }


        /*
        OLD CODE TO REPLACE IN TEMPLATES
        // Replace variables in each file in server output directory
        s.ssh(server, output_dir)
        s.csf(server, output_dir)
        s.fail2ban(server, output_dir)
        s.nullmailer(server, output_dir)
        s.psad(server, output_dir)
        s.clamav(server, output_dir)

        if (server.lamp && server.lamp === 'on') {
          s.lamp(server, output_dir)
        }
        */

        // redirect to the server page
        res.redirect('/server/' + server.id)


      }).catch(function (err) {
        req.flash('error', 'an error occurs during server creation : ' + err)
        return res.redirect('back')
      })
    })
  },


  install: function (req, res) {

    // -----------------------------------------------
    // ------------- DEFINE FUNCTIONS ----------------
    // -----------------------------------------------


    // In this action we are only working with websockets so you won't find any res.redirect but only broadcast to exception channel
    function init_loger(server) {

      // Create server logs directory if not exists
      wrench.mkdirSyncRecursive('logs/' + server_dir)

      // Used by the log_service
      var log_path = 'logs/' + server_dir + '/install.log'
      var log_error = 'logs/' + server_dir + '/error.log'

      // See api/services/log_service.js
      var wsStream = log_service.create_log(log_path)
      var wsStreamError = log_service.create_log(log_error)


      // loger is used to log ssh output - stored in Tunnel Object in highest level scope
      return {
        out: function (stdout, close_stream) {
          // third argument is for websocket use
          log_service.file_log(wsStream, stdout, 'install', close_stream)
        },

        err: function (stdout, close_stream) {
          // third argument is for websocket use
          log_service.file_log(wsStreamError, stdout, 'error', close_stream)
        }
      }
    }

    // -------------------------
    // Tunnel class
    // -------------------------

    function init_Tunnel(server) {
      return function () {
        this.config = {
          host: server.host,
          port: server.host_port,
          user: 'root',
          pass: server.root_password
        }

        this.loger = init_loger(server)

        // -----------------
        // SCP function
        // -----------------

        this.scp = function (source, destination) {

          var scp2 = require('scp2') // -> https://github.com/spmjs/node-scp2
          var loger = this.loger
          var config = this.config

          return function (callback) {

            // The try is for access sync
            try {
              fs.accessSync(source)

              console.log('copying "'+source+'" to "'+ destination+'"')

              scp2.scp(source, {
                host: config.host,
                port: config.port,
                username: 'root',
                password: config.pass,
                path: destination
              }, function (err) {

                loger.out(source + ' copied on remote')
                callback(err)

              })
            } catch (e) {

              loger.out('File does not exists : ' + source)
              callback()
            }
          }
        }

        // -----------------
        // SSH function
        // -----------------

        this.ssh = function (array_of_commands) {

          var loger = this.loger
          var config = this.config

          return function (callback) {

            var ssh = new simple_ssh(config)

            for (var index in array_of_commands) {

              // On last command we give an exit parameter to simple-ssh to resolve the promise
              if (parseInt(index) === array_of_commands.length - 1) {
                loger.exit = function (code) {
                  callback()
                }
              }

              ssh.exec(array_of_commands[index], loger)
            }

            ssh.start()
          }
        }
      }
    }


    // -----------------------------------
    // "before" and "after" script builder
    // -----------------------------------

    function build_script(before_or_after) {

      var array_of_functions = []

      // Transfer all before scripts
      for (var index in module_order) {

        var type = module_order[index]

        // If the install type should not be installed on the server

        if (server[type] !== 'on') continue

        // Create folders in /tmp/ for each type of config with SSH
        array_of_functions.push(
          new Tunnel().ssh([
            'mkdir -p /tmp/' + type + '/' + before_or_after + ';' //flag -p is for making dirs recursively
          ])
        )

        // Transfer the before.sh script for each type of config with SCP
        array_of_functions.push(
          new Tunnel().scp(
            'linux_config/config/' + type + '/' + before_or_after + '/' + before_or_after + '.sh',
            '/tmp/' + type + '/' + before_or_after
          )
        )


        // Create the string for arguments for before.sh script
        var arguments = ''

        try {
          // Get the config for the before scripts
          var config = require('../../linux_config/config/' + type + '/' + before_or_after + '/config')

          for (var j in config.arguments) {

            // If the asked arguments is not in the post data or in the data stored in the database, we throw an error as the install cannot run smooth
            if (!server[config.arguments[j]]) throw new Error('Missing parameter in POST data or in database record : ' + config.arguments[j])

            // All arguments value are stored in server object (the POSTed data like password or secret information is stored in the server object at the beginning of the action)
            arguments += server[config.arguments[j]] + ' ' // Add the space character at the end if there is several arguments
          }
        } catch (e) {

          new Tunnel().loger.out('linux_config/config/' + type + '/' + before_or_after + '/config.js does not exists')
        }


        // Execute the before script with SSH
        array_of_functions.push(
          new Tunnel().ssh([
            'chmod +x /tmp/' + type + '/' + before_or_after + '/' + before_or_after + '.sh;',
            'bash /tmp/' + type + '/' + before_or_after + '/' + before_or_after + '.sh ' + arguments + ';'
          ])
        )
      }

      // This array will be executed by async.waterfall
      return array_of_functions
    }


    // -----------------------------------------------
    // ---------------- SCRIPT START -----------------
    // -----------------------------------------------

    // Just used to make a separation in the console
    if (sails.config.debug) console.log('-------------------------')

    // Check that post data is set and root_password and server_id are set
    if (!('body' in req)
      || !('root_password' in req.body)
      || !('server_id' in req.body)
      || req.body.root_password.length === 0
      || req.body.server_id.length === 0) {

      sails.sockets.broadcast('errors', 'exception', 'There is an error in posted data')
    }

    var wrench = require('wrench') // -> https://github.com/ryanmcgrath/wrench-js
    var simple_ssh = require('simple-ssh') // -> https://github.com/MCluck90/simple-ssh
    var Promise = require('promise') // -> https://github.com/then/promise
    var fs = require('fs')
    var async = require('async')
    var silent = misc_services.silent_fail

    // Used to determine which script to execute in first in :
    // function build_script
    var module_order = require('../../linux_config/config/module_order')

    // We need to store those variable at the higher scope level because they are modified and/or accessed in different scope level
    // They are all set once we found the server in database
    var Tunnel, server, server_dir, out

    // Subscribe the req to necessary channels
    sails.sockets.join(req.socket, 'log')
    sails.sockets.join(req.socket, 'errors')


    // Lets find the server to get config parameters as they are not transmitted by post data
    // See sails ORM documentation -> https://github.com/balderdashy/waterline
    Server.findOne(req.body.server_id)

      .then(function (server_returned) {

        // If we did not find server -> broadcast an exception - Should not arrive unless somebody change req.body.server_id
        if (!server_returned) {
          sails.sockets.broadcast('errors', 'exception', 'no server found')
          throw new Error('server does not exists')

        } else {
          // Store all variables in highest scope
          server = server_returned

          // We store the server directory in the highest scope
          server_dir = server.host + ':' + server.host_port

          // We will need to access to req.body through server variable as req.body contains passwords and we need them for scripts
          for (var variable in req.body) {
            server[variable] = req.body[variable]
          }

          // Build the Tunnel class with server parameters
          Tunnel = init_Tunnel(server)

          // We store a loger.out in the highest scope for readability
          out = new Tunnel().loger.out
        }


        // -------------------------------------------
        // "BEFORE" - BASH SCRIPT TRANSFER & EXECUTION
        // -------------------------------------------

      }).then(function () {

        return new Promise(function (resolve, reject) {

          out('Transferring before.sh scripts to the server')

          var array_of_functions = build_script('before')

          async.parallelLimit(array_of_functions, 1, function (err) {
            if (err) reject(err)

            out('before.sh scripts have been transferred to the server')

            resolve()
          })
        })


        //-----------------------------
        // CONFIGURATION FILES TRANSFER
        //-----------------------------

      }).then(function () {

        out('Starting transfer config files to the server')

        return new Promise(function (resolve, reject) {
          var array_of_functions = []

          // Copy all the config files to the server - see the readme for a description or api/services/files_service.js
          for (var index in module_order) {

            var type = module_order[index]

            // If the module is not activated we don't send files
            if(server[type] !== 'on') continue

            // Silent is a function for silent failing instead of throwing an error because we don't want to go to the catch block
            silent(function () {
              // Relative path from api/controllers/SecurityController.js
              var files_to_transfer = require('../../linux_config/config/' + type + '/files_to_transfer')

              files_to_transfer.map(function (file) {

                array_of_functions.push(new Tunnel().scp(
                  'linux_config/output/' + server_dir + '/' + type + '/' + file.source,
                  file.destination
                ))
              })
            })
          }

          async.parallelLimit(array_of_functions, 5, function (err) {
            if (err) reject(err)

            out('config files have been transferred to the server')
            resolve()
          })
        })


        // -------------------------------------------
        // "AFTER" - BASH SCRIPT TRANSFER & EXECUTION
        // -------------------------------------------

      }).then(function () {

        return new Promise(function (resolve, reject) {

          var array_of_functions = build_script('after')

          try{
            async.parallelLimit(array_of_functions, 1, function (err) {
              if (err) reject(err)
              resolve()
            })
          }catch(e){
            reject(e)
          }
        })


        // -----------------------------------------
        // "FINISH" - SERVER CLEANING AND SEND EMAIL
        // -----------------------------------------

      }).then(function () {

        return new Promise(function (resolve) {

          new Tunnel().ssh([
            'rm -rf /tmp/*', // Delete all temporary files used to install the server
            'echo "everything OK"|mail -s "Installation for server ' + server.machine_name + '.' + server.company_name + ' is done !" "root"',
            'echo "Installation is done, server will now reboot"',
            'reboot'
          ])(resolve)
        })

        // Update server status in database
      }).then(function () {

        return Server.update(server.id, {status: 'installed', host_port: server.ssh_port || 22})

      }).then(function () {


        // Send message to client that install is over
        new Tunnel().loger.out('installation finished', true)
        new Tunnel().loger.err('installation finished (no more errors)', true)

      }).catch(function (err) {

        // If we are debuging, print error in the console
        if (sails.config.debug) console.log(err)

        sails.sockets.broadcast('errors', 'exception', 'Error : ' + err)
      })

  }
}
;

