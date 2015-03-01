exports.getCurrentDate = function () {
  var date = new Date()
  return date.getFullYear()+'/'+(parseInt(date.getMonth())+1)+'/'+date.getDate()+' '+date.getHours()+':'+date.getMinutes()+':'+date.getSeconds() // YYYY-MM-DD HH:MM:SS
}


exports.replaceInFile = function(path, rule, value){

  // Replace an expression in a file
  // Sync method

  var fs = require('fs')

  var content = fs.readFileSync(path, 'utf8')
  var regex = new RegExp(rule, 'g')

  content = content.replace(regex, value)

  fs.writeFileSync(path, content)
}
