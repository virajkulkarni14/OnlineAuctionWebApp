var mysql = require('mysql');

function getConnection(){
	var connection = mysql.createConnection({        
	    host: 'localhost',
	    user: 'root',
	    password : '',
	    port : 3306, //port mysql
	    database:'Ebay_DB'
	});
	return connection;
}
exports.getConnection = getConnection;