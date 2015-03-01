exports.scpPromise = function(fileToCopy, destinationFolder, host, host_port, root_password, loger){

  var scp2 = require('scp2') // -> https://github.com/spmjs/node-scp2
  var Promise = require('promise') // -> https://github.com/then/promise

  return new Promise(function (resolve, reject) {

    scp2.scp(fileToCopy, {
      host: host,
      port: host_port,
      username: 'root',
      password: root_password,
      path: destinationFolder
    }, function (err) {

      if (err) reject(err)

      loger(fileToCopy+' copied on remote')
      resolve()

    })
  })
}
