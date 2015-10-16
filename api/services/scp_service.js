// This function returns a Promise
exports.scpPromise = function(fileToCopy, destinationFolder, host, host_port, root_password, loger){

  var scp2 = require('scp2') // -> https://github.com/spmjs/node-scp2
  var Promise = require('promise') // -> https://github.com/then/promise
  var fs = require('fs')

    return new Promise(function (resolve, reject) {

        try{
          require('fs').statSync(fileToCopy)
        }catch(e){
          console.log(e)

          // We don't reject as we want to continue to execute script even if the file does not exists
          resolve()
        }

        scp2.scp(fileToCopy, {
          host: host,
          port: host_port,
          username: 'root',
          password: root_password,
          path: destinationFolder
        }, function (err) {

          if (err) {
            reject(err)
          }

          loger(fileToCopy + ' copied on remote')
          resolve(fileToCopy)

        })
    })
}

// This function returns a function
exports.scpFunction = function(fileToCopy, destinationFolder, host, host_port, root_password, loger){

  var scp2 = require('scp2') // -> https://github.com/spmjs/node-scp2

  return function(callback){

    scp2.scp(fileToCopy, {
      host: host,
      port: host_port,
      username: 'root',
      password: root_password,
      path: destinationFolder
    }, function (err) {

      loger(fileToCopy + ' copied on remote')
      callback(err)

    })
  }
}
