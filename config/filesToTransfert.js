module.exports.filesToTransfert = {


    security : [
      {
        source : 'rkhunter/rkhunter.conf',
        destination : '/etc/'
      },
      {
        source : 'ssh/sshd_config',
        destination : '/etc/ssh/'
      },
      {
        source : 'fail2ban/jail.local',
        destination : '/etc/fail2ban/'
      },
      {
        source : 'csf/csf.conf',
        destination : '/etc/csf/'
      },
      {
        source : 'csf/csf.allow',
        destination : '/etc/csf/'
      },
      {
        source : 'csf/csf.ignore',
        destination : '/etc/csf/'
      },
      {
        source : 'csf/csf.pignore',
        destination : '/etc/csf/'
      },
      {
        source : 'shared/mailname',
        destination : '/etc/'
      },
      {
        source : 'nullmailer/remotes',
        destination : '/etc/nullmailer/'
      },
      {
        source : 'nullmailer/adminaddr',
        destination : '/etc/nullmailer/'
      },
      {
        source : 'psad/psad.conf',
        destination : '/etc/psad/'
      }
    ]


}
