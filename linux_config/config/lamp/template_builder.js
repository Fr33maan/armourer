module.exports = function(server, output_directory, replacer){

  replacer(output_directory+'/lamp/vsftp/vsftpd.chroot_list', 'sudo.user', server.sudo_user)

}
