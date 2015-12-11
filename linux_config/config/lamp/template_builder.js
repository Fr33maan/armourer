module.exports = function(server, output_directory, replacer){

  // This will set the sudo user as the only user who is not chrooted
  replacer(output_directory+'/lamp/vsftp/vsftpd.chroot_list', 'sudo.user', server.sudo_user)


  // This will set the apache working directory as the web_worker home directory
  replacer(output_directory+'/lamp/apache/apache2.conf', 'webworker.user', server.webworker_user)
}

