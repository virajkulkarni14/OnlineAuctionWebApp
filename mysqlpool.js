var mysql = require('mysql');

function getConnectionPool(){
	var pool = mysql.createPool({        
	    host: 'localhost',
	    user: 'root',
	    password : '',
	    port : 3306, //port mysql
	    database:'NodeJSYelp',
	    connectionLimit : 1000
	});
	return pool;
}
exports.getConnectionPool = getConnectionPool;