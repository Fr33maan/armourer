module.exports = [
  {
    source: 'apache/apache2.conf',
    destination: '/etc/apache2/'
  },
  {
    source: 'apache/ports.conf',
    destination: '/etc/apache2/'
  },
  {
    source: 'vsftp/vsftpd.chroot_list',
    destination: '/etc/'
  },
  {
    source: 'vsftp/vsftpd.conf',
    destination: '/etc/'
  }
]
