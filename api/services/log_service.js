exports.create_log = function (log_path) {
  var fs = require('fs')

  if (fs.existsSync(log_path)) {
    return fs.createWriteStream(log_path, {encoding: 'utf8'})
  } else {

    // Create the file if it does not exists
    fs.writeFileSync(log_path)
    return fs.createWriteStream(log_path, {encoding: 'utf8'})
  }
}


exports.file_log = function (wsstream, msg, socket_channel, close_stream) { // close_stream is facultative

  // See api/services/misc_services.js
  // Return the current date : YYYY/MM/DD HH:MM:SS
  var time = misc_services.getCurrentDate()

  // Remove strings like '..... ... .....' || '...'
  if(!(msg.match(/^[ .]*$/))){

    // Broadcast the message to the given channel
    if (socket_channel) sails.sockets.broadcast('log', socket_channel, time + ' : ' + msg)

    // Write the message in the log file
    wsstream.write(time + ' : ' + msg + '\n')
  }

  if (close_stream) wsstream.end()
}
