
/*
 * GET home page.
 */
var mysqldb = require('../mysqldb.js');
exports.index = function(req, res){
	var connection = mysqldb.getConnection();
	connection.connect();
	connection.query('SELECT * from category', function(err, rows){
		if(err)
			console.log("Error getting vlaues % s", err);
		res.render('categories', {page_title:"Categories", data:rows, isAdmin:sess.isAdmin, name:sess.fname, lastlogin: sess.lastlogin, email :sess.email});
	});
	connection.end();
};

exports.main = function(req, res){
	res.render('home');
}