module.exports = {
  install : [
    {
      name : 'webworker_user',
      type : 'text',
      placeholder : 'The name of the restricted user who will access via FTP'
    }
  ],
  secret : [
    {
      name : 'mysql_password',
      type: 'password'
    },{
      name : 'webuser_password',
      type: 'password'
    }
  ]
}
