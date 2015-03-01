/**
 * PageController
 *
 * @description :: Server-side logic for managing pages
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
	home : function(req, res){
    var marked = require('marked')
    var fs = require('fs')

    return res.view({readme : marked(fs.readFileSync('README.md', 'utf8'))})
  }
};

