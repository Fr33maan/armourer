module.exports = [
  {
    source: 'rkhunter/rkhunter.conf',
    destination: '/etc/'
  },
  {
    source: 'ssh/sshd_config',
    destination: '/etc/ssh/'
  },
  {
    source: 'fail2ban/jail.local',
    destination: '/etc/fail2ban/'
  },
  {
    source: 'csf/csf.conf',
    destination: '/etc/csf/'
  },
  {
    source: 'csf/csf.allow',
    destination: '/etc/csf/'
  },
  {
    source: 'csf/csf.ignore',
    destination: '/etc/csf/'
  },
  {
    source: 'csf/csf.pignore',
    destination: '/etc/csf/'
  },
  {
    source: 'shared/mailname',
    destination: '/etc/'
  },
  {
    source: 'nullmailer/remotes',
    destination: '/etc/nullmailer/'
  },
  {
    source: 'nullmailer/adminaddr',
    destination: '/etc/nullmailer/'
  },
  {
    source: 'psad/psad.conf',
    destination: '/etc/psad/'
  },
  {
    source: 'apt/50unattended-upgrades',
    destination: '/etc/apt/apt.conf.d/'
  },
  {
    source: 'apt/20auto-upgrades',
    destination: '/etc/apt/apt.conf.d/'
  },
  {
    source: 'apt/02periodic',
    destination: '/etc/apt/apt.conf.d/'
  },
  {
    source: 'apt/listchanges.conf',
    destination: '/etc/apt/'
  },
  {
    source: 'cron/cron_daily',
    destination: '/etc/cron.d/'
  },
  {
    source: 'cron/clamscan',
    destination: '/etc/cron.daily/'
  },
  {
    source: 'cron/psad_update',
    destination: '/etc/cron.daily/'
  }
]
