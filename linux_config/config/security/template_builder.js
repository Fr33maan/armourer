module.exports = function (server, output_dir, replacer) {

/*

replacer function takes 3 arguments :
  1. the file which is the output_directory

 */



  // ----------------
  // ------SSH-------
  // ----------------

  replacer(output_dir + '/security/ssh/sshd_config', 'ssh.port', server.ssh_port || '22')
  replacer(output_dir + '/security/ssh/sshd_config', 'sudo.user', server.sudo_user)


  // ----------------
  // ------CSF-------
  // ----------------

  var ssh_port = server.ssh_port || '22'
  var port_knocking, ip_allowed

  if (server.port_knocking) {
    port_knocking = ssh_port + ';TCP;20;' + server.port_knocking.replace(/,/g, ';')
  } else {
    port_knocking = ''
  }

  var tcp_out_default_sequence = ssh_port + ',80, 465'

  var tcp_in = server.tcp_in || ''
  var tcp_out = server.tcp_out ? server.tcp_out + ',' + tcp_out_default_sequence : tcp_out_default_sequence
  var udp_in = server.udp_in || ''
  var udp_out = server.udp_out || ''

  if (server.ip_ignore) {
    ip_allowed = server.ip_ignore.replace(/,/g, '\n')
  } else {
    ip_allowed = ''
  }

  replacer(output_dir + '/security/csf/csf.conf', 'tcp.in', tcp_in)
  replacer(output_dir + '/security/csf/csf.conf', 'tcp.out', tcp_out)
  replacer(output_dir + '/security/csf/csf.conf', 'udp.in', udp_in)
  replacer(output_dir + '/security/csf/csf.conf', 'udp.out', udp_out)

  replacer(output_dir + '/security/csf/csf.conf', 'firewall.portknocking', port_knocking)
  replacer(output_dir + '/security/csf/csf.conf', 'ssh.port', ssh_port)

  replacer(output_dir + '/security/csf/csf.allow', 'ip.list', ip_allowed)
  replacer(output_dir + '/security/csf/csf.ignore', 'ip.list', ip_allowed)



  // ----------------
  // ---FAIL2BAN-----
  // ----------------


  var ssh_port = server.ssh_port || '22'
  var ignore_ip = ''


  if (server.ipallowed) {
    ignore_ip = server.ipallowed.replace(',', ' ')
  }

  replacer(output_dir + '/security/fail2ban/jail.local', 'ssh.port', ssh_port)
  replacer(output_dir + '/security/fail2ban/jail.local', 'fail2ban.ignoreip', ignore_ip)


  // ----------------
  // ---NULLMAILER---
  // ----------------


  replacer(output_dir + '/security/nullmailer/remotes', 'mail.smtp', server.mail_smtp)
  replacer(output_dir + '/security/nullmailer/remotes', 'mail.user', server.mail_user)
  replacer(output_dir + '/security/nullmailer/remotes', 'mail.password', server.mail_password)
  replacer(output_dir + '/security/nullmailer/adminaddr', 'control.mail', server.admin_mail)

  replacer(output_dir + '/security/shared/mailname', 'machine.name', server.machine_name)
  replacer(output_dir + '/security/shared/mailname', 'company.name', server.company_name)


  // ----------------
  // ------PSAD------
  // ----------------


  var port_sequence = ''

  if (server.port_knocking) {

    var arr = server.port_knocking.split(',')


    for (var index in arr) {
      var comma = index === 0 ? '' : ','

      port_sequence += comma + 'tcp/' + arr[index]
    }

  } else {
    port_sequence = 'NONE'
  }


  replacer(output_dir + '/security/psad/psad.conf', 'psad.portsequence', port_sequence)
  replacer(output_dir + '/security/psad/psad.conf', 'machine_name.company_name', server.machine_name + '.' + server.company_name)

  replacer(output_dir + '/security/cron/psad_update', 'machine.name', server.machine_name)
  replacer(output_dir + '/security/cron/psad_update', 'company.name', server.company_name)


  // ----------------
  // -----CLAMAV-----
  // ----------------


  replacer(output_dir + '/security/cron/clamscan', 'machine.name', server.machine_name)
  replacer(output_dir + '/security/cron/clamscan', 'company.name', server.company_name)

}
