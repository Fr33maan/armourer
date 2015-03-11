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
    if('port_knocing' in req.body && req.body.port_knocking.length > 0){
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

        var output_dir = 'linux_config/output/security/' + server.host + ':' + server.host_port

        // Create server directory if it does not exists
        wrench.mkdirSyncRecursive(output_dir)


        // Copy template config in server directory
        wrench.copyDirSyncRecursive('linux_config/templates/security', output_dir, {
          forceDelete: true // Necessary when we reinstall a server (clear db + creation of the same server host:host_port
        });


        // Replace variables in each file in server output directory
        s.ssh(server, output_dir)
        s.csf(server, output_dir)
        s.fail2ban(server, output_dir)
        s.nullmailer(server, output_dir)
        s.psad(server, output_dir)
        s.clamav(server, output_dir)


        // redirect to the server page
        res.redirect('/server/' + server.id)


      }).catch(function (err) {
        req.flash('error', 'an error occurs during server creation : ' + err)
        return res.redirect('back')
      })
    })
  },


  install: function (req, res) {

    // In this action we are only working with websockets so you won't find any res.redirect but only broadcast to exception channel

    // Check that post data is set and root_password, sudouser_password and server_id are set
    if (!('body' in req)
      || !('root_password' in req.body)
      || !('server_id' in req.body)
      || req.body.root_password.length === 0
      || req.body.server_id.length === 0) {

      sails.sockets.broadcast('errors', 'exception', 'There is an error in posted data')
    }

    var wrench = require('wrench') // -> https://github.com/ryanmcgrath/wrench-js
    var SSH = require('simple-ssh') // -> https://github.com/MCluck90/simple-ssh
    var Promise = require('promise') // -> https://github.com/then/promise
    var fs = require('fs')
    var async = require('async')

    // Just for readability
    var root_password = req.body.root_password


    // We need to store those variable at the higher scope level because they are modified and accessed in different scope level
    var server, loger, server_dir

    // Subscribe the req to necessary channels
    sails.sockets.join(req.socket, 'log')
    sails.sockets.join(req.socket, 'errors')


    // Lets find the server to get config parameters as they are not transmitted by post data
    // See sails ORM documentation -> https://github.com/balderdashy/waterline
    Server.findOne(req.body.server_id)

      .then(function (server_returned) {

        // Store the server in high level scope
        server = server_returned

        // If we did not find server -> broadcast an exception - Should not arrive unless somebody change req.body.server_id
        if (!server) sails.sockets.broadcast('errors', 'exception', 'no server found')

        // Now we can determine where are the config files
        server_dir = server.host + ':' + server.host_port

        // Create server logs directory if not exists
        wrench.mkdirSyncRecursive('logs/' + server_dir)

        // Used by the log_service
        var log_path = 'logs/' + server_dir + '/install.log'
        var log_error = 'logs/' + server_dir + '/error.log'

        // See api/services/log_service.js
        var wsStream = log_service.create_log(log_path)
        var wsStreamError = log_service.create_log(log_error)


        // loger is used to log ssh output - stored in high level scope
        loger = {
          out: function (stdout, close_stream) {
            // third argument is for websocket use
            log_service.file_log(wsStream, stdout, 'install', close_stream)
          },

          err: function (stdout, close_stream) {
            // third argument is for websocket use
            log_service.file_log(wsStreamError, stdout, 'error', close_stream)
          }
        }


        // See scp_service - used to copy files on the server through ssh
        // Needs the same info than ssh (host, host_port, root_password, loger)
        // Will copy the main install script located here -> linux_config/output/(host:host_port)/install.sh
        return scp_service.scpPromise('linux_config/output/security/' + server_dir + '/install.sh', '/tmp/', server.host, server.host_port, root_password, loger.out)


      }).then(function () {

        return new Promise(function (resolve, reject) {

          // make the install script executable
          // We must instanciate a new ssh session each time or precedent commands will be executed another time
          new SSH({
            host: server.host,
            port: server.host_port,
            user: 'root',
            pass: root_password
          })
            .exec('cd /tmp; chmod +x install.sh;', loger)

            // Lunch the script - install.sh script take two arguments : sudo_username in 1st argument and sudo_password in 2nd argument
            // We use arguments so we never store sudo_password

            // We reconfigure the loger with an exit parameter that allow to wait for the end of the script before passing to the next .then()
            .exec('cd /tmp; ./install.sh ' + server.sudo_user, {
              out: loger.out,
              err: loger.err,
              exit: function (code, stdout, stderr) {
                resolve()
              }
            })
            .start()
        })

      }).then(function () {


        return new Promise(function(resolve, reject){
          var arr = []

          // Copy all the config files to the server - see the readme for a description or config/filesToTransfert.js
          sails.config.filesToTransfert.security.map(function (file) {

            // See api/services/scp_service.js
            arr.push(scp_service.scpFunction('linux_config/output/security/' + server_dir + '/' + file.source, file.destination, server.host, server.host_port, root_password, loger.out))
          })

          async.parallelLimit(arr, 9, function(err){
            if(err) reject(err)
            resolve()
          })
        })

      }).then(function () {

        return new Promise(function (resolve, reject) {

          // We must instanciate a new ssh session each time or precedent commands will be executed another time
          new SSH({
            host: server.host,
            port: server.host_port,
            user: 'root',
            pass: root_password
          })

            // Remove the install script
            .exec('rm /tmp/install.sh', loger)

            // Chmod daily cron jobs
            .exec('chmod +x /etc/cron.daily/psad_update.sh;', loger)
            .exec('chmod +x /etc/cron.daily/clamscan.sh;', loger)

            .exec('echo "Now reseting rkhunter baseline";',loger)

            // reset rkhunter baseline
            .exec('rkhunter --propupd;', loger)


            .exec('echo "everything OK"|mail -s "Installation for server '+ server.machine_name +'.'+ server.company_name +' is done !" "root";', loger)

            .exec('echo "Installation is done, server will now reboot";',loger)

            // Instead of restarting each services and forget something, we restart the server
            .exec('reboot', {
              out: loger.out,
              err: loger.err,
              exit: function (code, stdout, stderr) {
                resolve()
              }
            })
            .start()


        })
      }).then(function () {

        return Server.update(server.id, {status : 'installed'}).then()

      }).then(function () {

        loger.out('installation finished', true)
        loger.err('installation finished (no more errors)', true)

      }).catch(function (err) {
        sails.sockets.broadcast('errors', 'exception', 'Error : '+err)
      })

  }
}
;

