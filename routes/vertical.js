/**
 * New node file
 */

var crypto = require('crypto');
var assert = require('assert');
var Chance = require('chance');
var algorithm = 'aes256';
var key = 'password';
var password_temp;

var mysqldb = require('../mysqldb.js');
var util = require('util');

exports.signup_vertical = function(req, res) {
    res.render('signup_vertical', {message : req.flash('error')});
};

exports.saveUserVertical = function(req, res) {
    var input = JSON.parse(JSON.stringify(req.body));
    var chance = new Chance();
    console.log(input);
    console.log("PAssword: " + input.hash + " " + input.password);
    if (input.buyer == 1 && input.seller == "") {
        var buyer = 1;
        var seller = 0;
    } else if (input.buyer == "" && input.seller == 2) {
        var buyer = 0;
        var seller = 1;
    } else {
        var buyer = 1;
        var seller = 1;
    }
    // var password = crypto.createCipher(md5, input.pass);
    var password = input.pass;
    var password_temp = input.pass;
    console.log("Password_temp and password: " + password_temp + password);
    // var hash =
    // require('crypto').createHash('md5').update(password).digest('hex');
    var cipher = crypto.createCipher(algorithm, key);
    var encrypted = cipher.update(password, 'utf8', 'hex')
            + cipher.final('hex');
    // req.getConnection(function (err, connection) {
    var data = {
        firstname : input.firstname,
        lastname : input.lastname,
        email : input.email,
        password : encrypted,
        isAdmin : 'N'
        
    };
    
    
    var connection = mysqldb.getConnection();
    connection.connect();
    var query = connection.query("SELECT * from user WHERE email = ? ",[ data.email ],function(err, rows) {
	            if (err) {
	                console.log("Error fecthing details : %s", err);
	                res.redirect('/signup_vertical');
	            }
	            if (rows[0] == undefined) {
	                var query = connection.query("INSERT INTO user set ?",data,function(err, info) {
	                                    if (err)
	                                        console.log("Error Inserting: %s",err);
	                                    else{
	                                    	var user_id = info.insertId;
	                                    	var data_ext = {
	                                        		address : input.address,
	                                                city : input.city,
	                                                state : input.state,
	                                                country : input.country,
	                                                street : input.street,
	                                                zip : input.zip,
	                                                contact : input.contact,
	                                                membership_no : chance.ssn(),
	                                                isActive : '1',
	                                                isBuyer : buyer,
	                                                isSeller : seller,
	                                                user_id : user_id
	                                        };
	                                    	var query_ext = connection.query("INSERT INTO user_ext set ?",data_ext,function(err, rows) {
	                                            if (err)
	                                                console.log("Error Inserting: %s",err);
	                                            req.flash('error','You are registerd.Please Login!');
	                                            res.redirect('/login_vertical');
	                                        });
	                                    }
	                                    //req.flash('error','You are registerd.Please Login!');
	                                    //res.redirect('/');
	                                    connection.end();
	                                });
	            } 
	            else {
	                if (rows[0].email == input.email) {
	                    req.flash('error','Email ID already exists. Please try another email.');
	                    res.redirect('/signup_vertical');
	                }
	            }
	
	        });
    // });
};


exports.login_vertical = function(req, res) {
    res.render('login_vertical', {message : req.flash('error')});
};