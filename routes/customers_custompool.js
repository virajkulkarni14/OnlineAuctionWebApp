
var mysqldb = require('../mysqldb.js');
/*
 * GET users listing.
 */
var connection = mysqldb.getConnection();

function Pool(num_conns)
{
    this.pool = [];
    for(var i=0; i < num_conns; ++i)
        this.pool.push(connection); // your new Client + auth
    this.last = 0;
}

Pool.prototype.get = function()
{
    var cli = this.pool[this.last];
    this.last++;
    if (this.last == this.pool.length) // cyclic increment
       this.last = 0;
    return cli;
}
var p = new Pool(500);
exports.list = function(req, res){
	//var coneection = mysqldb.getConnection();
	connection.query('SELECT * FROM customer',function(err,rows)     {
        if(err)
           console.log("Error Selecting : %s ",err );
            res.render('customers',{page_title:"Customers - Node.js",data:rows});
         });
	connection.end();
  
};

exports.listCategory = function(req, res){
	//console.log(req.session.fname);
	if(req.session.fname == undefined){
		res.redirect("/");
	}
	else{
		//connection.connect();
		p.get().query('SELECT * from category', function(err, rows){
			if(err)
				console.log("Error getting vlaues % s", err);
			res.render('categories', {page_title:"Categories", data:rows, isAdmin : sess.isAdmin, name: sess.fname, email : sess.email, lastlogin: sess.lastlogin});
		});
		//connection.end();
	}
}

exports.signup = function(req, res){
	res.render('signup', {page_title:"Sign Up"});
}
exports.add = function(req, res){
	res.render('add_customer', {page_title:"Add Customers"});
}

exports.addCategory = function(req,res){
	if(req.session.fname == undefined){
		res.redirect("/");
	}
	else{
		var input = JSON.parse(JSON.stringify(req.body));
		var data = {
				name : input.name,
				description : input.description,
		};
		//var connection = mysqldb.getConnection();
		console.log(data);
		//connection.connect();
		p.get().query("Insert into category set ? ", data, function(err, rows){
			if(err)
				console.log("Error inserting : %s", err);
			res.redirect('/home');
			//res.render('categories', {page_title:"Categories", data:rows, name:sess.fname, lastlogin: sess.lastlogin, email :sess.email});
		});
	//	connection.end();
	}
}

exports.addElement = function(req, res){
	if(req.session.fname == undefined){
		res.redirect("/");
	}
	else {
		
		var input = JSON.parse(JSON.stringify(req.body));
		var data = {
				name : input.name,
				description : input.description,
				address : input.address,
				total_reviews: 0,
				category_name : input.category_name
		};
		console.log(data);
		
		p.get().query("Insert into element set ? ", data, function(err, rows){
			if(err)
				console.log("Error inserting : %s", err);
			res.redirect('/getDetails/'+data.category_name);
		});
		//connection.end();
	}
	
}
exports.edit = function(req,res){
	var id = req.params.id;
	req.getConnection(function(err, connection){
		connection.query('select * from customer where id = ?', [id], function(err, rows){
			if(err){
				cosole.log("error : %s", err);
			}
			res.render('edit_customer', {page_title:"Edit Customers",data : rows});
		});
	});
};

exports.save = function(req, res){
	var input = JSON.parse(JSON.stringify(req.body));
	console.log(input);
	var data = {
			firstName : input.firstName,
			lastName : input.lastName,
			email : input.email,
			password : input.password,
			isAdmin : 'N',
			lastlogin: new Date()
	};
	console.log(data);
	p.get().query("Insert into users set ? ", data, function(err, rows){
		if(err)
			console.log("Error inserting : %s", err);
		res.redirect('/');
	});
	//connection.end();
}
exports.login = function(req, res){
//	console.log(mysqldb.getName());
	res.render('login', {page_title : "Login"});
};
exports.logindo = function(req, res){
	var input = JSON.parse(JSON.stringify(req.body));
	var connection = mysqldb.getConnection();
	var data = {
			email : input.email,
			password : input.password,
	};
	console.log(data);
	//connection.connect();
	p.get().query("SELECT * from users WHERE email = ? ", [data.email], function(err, rows){
		if(err)
			console.log("Error fecthing details : %s", err);
		if(rows[0].password==data.password){
			sess = req.session;
			sess.fname = rows[0].firstName;
			sess.lname = rows[0].lastName;
			sess.email = rows[0].email;
			sess.isAdmin = rows[0].isAdmin;
			sess.lastlogin = rows[0].lastlogin.toString().substr(0,23);

			p.get().query('SELECT * from category', function(err, rows){
				if(err)
					console.log("Error getting vlaues % s", err);
				res.render('categories', {page_title:"Categories", data:rows,isAdmin :sess.isAdmin, name:sess.fname, lastlogin: sess.lastlogin, email :sess.email});
			});
			//connection.end();
		}
		else {
			res.redirect('/');
		}
		console.log();
	});
}
exports.reviews = function(req, res){
	var name = req.params.name;
	console.log(sess.fname + sess.lastlogin + sess.email);
	res.render('review_submit',{page_title:"Categories",element_name:name, name:sess.fname, lastlogin: sess.lastlogin, email :sess.email});
}
exports.get_reviews = function(req, res){
	var name = req.params.name;
	if(req.session.fname == undefined){
		res.redirect("/");
	}
	else {
		//var connection = mysqldb.getConnection();

		p.get().query("Select * from reviews where element_name = ?",[name], function(err, rows){
			if(err)
				console.log("Error fetching results : %s", err);
			res.render('get_reviews',{page_title:"Categories", data: rows, element_name:name, name:sess.fname, lastlogin: sess.lastlogin, email :sess.email});
		});
		//connection.end();
	}
		
}
exports.write_reviews = function(req, res){
	var input = JSON.parse(JSON.stringify(req.body));
	if(req.session.fname == undefined){
		res.redirect("/");
	}
	else {
		//var connection = mysqldb.getConnection();

		var data = {
				element_name : input.element_name,
				rating : input.rating,
				review : input.review,
				submitted_by : sess.email,
				submitted_on : new Date(),
		};
		
		p.get().query("Insert into reviews set ? ", data, function(err, rows){
			  if (err)
	              console.log("Error inserting : %s ",err );
			  else{

				  p.get().query("Select * from reviews where element_name = ?",[input.element_name], function(err, rows){
						if(err)
							console.log("Error fetching results : %s", err);
						console.log(rows + "************");
						//console.log(rows[0].element);
						res.render('get_reviews',{page_title:"Categories", data: rows, element_name:data.element, name:sess.fname, lastlogin: sess.lastlogin, email :sess.email});
					});
					//connection.end();
			  }
		});
	
	}
	
};
exports.save_edit = function(req,res){
    var input = JSON.parse(JSON.stringify(req.body));
    var id = req.params.id;
    req.getConnection(function (err, connection) {
        var data = {
            name    : input.name,
            address : input.address,
            email   : input.email,
            phone   : input.phone 
        
        };
        
        connection.query("UPDATE customer set ? WHERE id = ? ",[data,id], function(err, rows)
        {
  
          if (err)
              console.log("Error Updating : %s ",err );
         
          res.redirect('/customers');
          
        });
    
    });
};

exports.delete_customer = function(req,res){
          
     var id = req.params.id;
    
     req.getConnection(function (err, connection) {
        
        connection.query("DELETE FROM customer  WHERE id = ? ",[id], function(err, rows)
        {
            
             if(err)
                 console.log("Error deleting : %s ",err );
            
             res.redirect('/customers');
             
        });
        
     });
};

exports.getDetails = function(req,res){
	var name = req.params.name;
	if(req.session.fname == undefined){
		res.redirect("/");
	}
	else {
		//var connection = mysqldb.getConnection();

		p.get().query("Select * from element where category_name = ?",[name], function(err, rows){
			if(err)
				console.log("Error fetching results : %s", err);
			console.log(rows + "************");
			
			res.render('details',{page_title:"Details", isAdmin : sess.isAdmin, data : rows, category_name : name, data:rows, name : sess.fname, lastlogin: sess.lastlogin});
		});
		
		//connection.end();
	}
}

exports.logout = function(req, res){
	var email = sess.email;
	var lastlogin = new Date();
	console.log(email);
	req.session.destroy(function(err){
		if(err){
			console.log(err);
		}
		else{
			//var connection = mysqldb.getConnection();

			p.get().query("UPDATE users set lastlogin = ? WHERE email = ? ", [lastlogin,email], function(err, rows){
				if(err){
					cosole.log("error : %s", err);
				}
				res.redirect('/');
			});
		
			//connection.end();
		}
	});
}