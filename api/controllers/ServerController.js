/**
 * ServerController
 *
 * @description :: Server-side logic for managing servers
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
	view_all : function(req, res){

    // See sails ORM documentation -> https://github.com/balderdashy/waterline
    Server.find().sort({createdAt : 'asc'}).then(function(servers){

      if(servers.length === 0) req.flash('error', 'No server found')

      return res.view({servers : servers})
    })

  },

  view_one : function(req, res){

    var fs = require('fs')

    // See sails ORM documentation -> https://github.com/balderdashy/waterline
    Server.findOne(req.params.server_id).then(function(server){

      if(!server){
        req.flash('message', 'server not found')
        return res.redirect('/servers')

      }else{

        var install_log, error_log
        var server_dir = server.host+':'+server.host_port

        try{

          // read the existing logs to transmit them to the view
          install_log = fs.readFileSync('logs/'+server_dir+'/install.log', 'utf8')
          error_log = fs.readFileSync('logs/'+server_dir+'/error.log', 'utf8')

        }catch(e){
          // If files does not exists there will be an error but we don't care
        }

        res.view({server : server, install_log : install_log, error_log : error_log})
      }

    }).catch(function(err){
      req.flash('error', 'an error occurs while fetching requested server : '+err)
      return res.redirect('/servers')
    })
  },


  // If you want to re install a server
  destroy : function(req, res){

    var wrench = require('wrench')

    if(req.params.server_id.length === 0) return res.redirect('back')

    Server.findOne(req.params.server_id).then(function(server){

      if(!server){
        req.flash('error', 'server not found')
        return res.redirect('/servers')
      }

      var log_dir = 'logs/'+server.host+':'+server.host_port
      var output_dir = 'linux_config/output/security/'+server.host+':'+server.host_port
      var fail = function(err){
        console.log(err)
      }

      wrench.rmdirSyncRecursive(log_dir, fail)
      wrench.rmdirSyncRecursive(output_dir, fail)

      Server.destroy(req.params.server_id).then(function(){

        req.flash('message', 'server has been destroyed')
        res.redirect('/')

      }).catch(function(err){
        req.flash('error', 'error during server deletion : '+err)
        res.redirect('back')
      })
    })
  },

};

