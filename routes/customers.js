var crypto = require('crypto');
var assert = require('assert');
var Chance = require('chance');
var algorithm = 'aes256';
var key = 'password';
var password_temp;

var mysqldb = require('../mysqldb.js');
var util = require('util');
/// REDIS TEST
var redis = require("redis"),
client = redis.createClient();
var cache = require('../redisCache');

// var md5 = require('MD5');
/*
 * GET users listing.
 */

exports.login = function(req, res) {
    res.render('login', {
        message : req.flash('error')
    });
};

exports.signup = function(req, res) {
    res.render('signup', {
        message : req.flash('error')
    });
};

exports.updateUser = function(req, res) {
    var input = JSON.parse(JSON.stringify(req.body));
    var personId = req.params.id;
    var button = input.sbtBtn;
    var data;
    if (input.sbtBtn == "Update") {
        var password = input.pass;
        if (password == "" || password.length == 0) {
            data = {
                firstname : input.firstname,
                lastname : input.lastname,
                address : input.address,
                city : input.city,
                state : input.state,
                country : input.country,
                street : input.street,
                zip : input.zip,
                contact : input.contact,
                card_number: input.card_number,
                card_name: input.cardname,
                code: input.csc,
                expiry_mm: input.month,
                expiry_yy: input.year
            };
        } else {
            var cipher = crypto.createCipher(algorithm, key);
            var encrypted = cipher.update(password, 'utf8', 'hex')
                    + cipher.final('hex');
            data = {
                firstname : input.firstname,
                lastname : input.lastname,
                password : encrypted,
                address : input.address,
                city : input.city,
                state : input.state,
                country : input.country,
                street : input.street,
                zip : input.zip,
                contact : input.contact,
                card_number: input.card_number,
                card_name: input.cardname,
                code: input.csc,
                expiry_mm: input.month,
                expiry_yy: input.year
            };
        }
        var connection = mysqldb.getConnection();
        connection.connect();
        var query = connection.query("UPDATE person set ? where id =?", [ data,
                personId ], function(err, rows) {
            if (err)
                console.log("Error Inserting: %s", err);
            else {
                req.flash('error', 'Record successfully updated!');
                connection
                        .query("select * from person where id = ?",
                                [ personId ], function(err, rows) {
                                    if (err)
                                        console.log(
                                                "Error fetching results : %s",
                                                err);
                                    else{
                                    	cache.vlmCache.invalidate("users", function(err) {
                    						if(err) {
                    							throw err;
                    						}
                    					});
                                    	cache.vlmCache.invalidate("buyers", function(err) {
                    						if(err) {
                    							throw err;
                    						}
                    					});
                                    	cache.vlmCache.invalidate("sellers", function(err) {
                    						if(err) {
                    							throw err;
                    						}
                    					});
                    					console.log(JSON.stringify(cache.vlmCache.getStats()));
                                    	 res.render('getUserDetails', {
                                             message : req.flash('error'),
                                             data : rows[0],
                                             personId : sess.uid,
                                             firstname : sess.fname,
                                             lastname : sess.lname,
                                             email : sess.email,
                                             lastlogin : sess.lastlogin,
                                             isAdmin : sess.isAdmin,
                                             isBuyer : sess.isBuyer,
                                             isSeller : sess.isSeller,
                                             memberno : sess.memberno
                                         });
                                    }
                                   

                                });
            }
            connection.end();
        });
    } else if (input.sbtBtn == "Cancel") {
        var connection = mysqldb.getConnection();
        connection.connect();
        var query = connection.query("SELECT * from person WHERE id = ? ",
                [ personId ], function(err, rows) {
                    if (err) {
                        console.log("Error fecthing details : %s", err);
                        res.redirect('/');
                    } else {
                        sess = req.session;
                        sess.uid = rows[0].id;
                        sess.fname = rows[0].firstname;
                        sess.lname = rows[0].lastname;
                        sess.email = rows[0].email;
                        sess.isAdmin = rows[0].isAdmin;
                        sess.isBuyer = rows[0].isBuyer;
                        sess.isSeller = rows[0].isSeller;
                        sess.memberno = rows[0].membership_no;
                        sess.lastlogin = rows[0].lastlogin.toString().substr(0,
                                23);

                        res.render('home', {
                            page_title : "Home",
                            data : rows,
                            personId : sess.uid,
                            firstname : sess.fname,
                            lastname : sess.lname,
                            email : sess.email,
                            lastlogin : sess.lastlogin,
                            isAdmin : sess.isAdmin,
                            isBuyer : sess.isBuyer,
                            isSeller : sess.isSeller,
                            memberno : sess.memberno
                        });
                    }
                });
    }
}

exports.saveUser = function(req, res) {
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
        address : input.address,
        city : input.city,
        state : input.state,
        country : input.country,
        street : input.street,
        zip : input.zip,
        contact : input.contact,
        membership_no : chance.ssn(),
        isAdmin : 'N',
        isActive : '1',
        isBuyer : buyer,
        isSeller : seller,
        card_number: input.card_number,
        card_name: input.cardname,
        code: input.csc,
        expiry_mm: input.month,
        expiry_yy: input.year
    };
    var connection = mysqldb.getConnection();
    connection.connect();
    var query = connection
            .query(
                    "SELECT * from person WHERE email = ? ",
                    [ data.email ],
                    function(err, rows) {
                        if (err) {
                            console.log("Error fecthing details : %s", err);
                            res.redirect('/signup');
                        }
                        if (rows[0] == undefined) {
                            var query = connection
                                    .query(
                                            "INSERT INTO person set ?",
                                            data,
                                            function(err, rows) {
                                                if (err)
                                                    console
                                                            .log(
                                                                    "Error Inserting: %s",
                                                                    err);
                                                cache.vlmCache.invalidate("users", function(err) {
                            						if(err) {
                            							throw err;
                            						}
                            					});
                                            	cache.vlmCache.invalidate("buyers", function(err) {
                            						if(err) {
                            							throw err;
                            						}
                            					});
                                            	cache.vlmCache.invalidate("sellers", function(err) {
                            						if(err) {
                            							throw err;
                            						}
                            					});
                                                req
                                                        .flash('error',
                                                                'You are registerd.Please Login!');
                                                res.redirect('/');
                                            });
                            connection.end();
                        } else {
                            if (rows[0].email == input.email) {
                                req
                                        .flash('error',
                                                'Email ID already exists. Please try another email.');
                                res.redirect('/signup');
                            }
                        }

                    });
    // });
};

exports.logindo = function(req, res) {
    var input = JSON.parse(JSON.stringify(req.body));
    // req.getConnection(function(err,connection){
    var data = {
        email : input.email,
        password : input.pass,
    };
    console.log(data);
    var password_check = input.pass;
    var cipher = crypto.createCipher(algorithm, key);
    var encrypted_password = cipher.update(password_check, 'utf8', 'hex')
            + cipher.final('hex');
    var connection = mysqldb.getConnection();
    connection.connect();
    var query = connection
            .query(
                    "SELECT * from person WHERE email = ? ",
                    [ data.email ],
                    function(err, rows) {
                        if (err) {
                            console.log("Error fecthing details : %s", err);
                            res.redirect('/');
                        }
                        var userexist = rows[0];
                        console.log("rows: " + userexist);
                        if (userexist == undefined) {
                            console.log("rows: " + userexist);
                            req.flash('error',
                                    'Username does not exists in database');
                            res.redirect('/');
                        } else {
                            if (rows[0].password == encrypted_password) {
                                sess = req.session;
                                console.log(req.session);
                                console.log(rows[0].firstname);
                                sess.uid = rows[0].id;
                                sess.fname = rows[0].firstname;
                                sess.lname = rows[0].lastname;
                                sess.email = rows[0].email;
                                sess.isAdmin = rows[0].isAdmin;
                                sess.isBuyer = rows[0].isBuyer;
                                sess.isSeller = rows[0].isSeller;
                                sess.memberno = rows[0].membership_no;
                                if (rows[0].lastlogin == null) {
                                    sess.lastlogin = "First Login";
                                } else {
                                    sess.lastlogin = rows[0].lastlogin
                                            .toString().substr(0, 24);
                                }
                                var lastlogin = new Date();
                                connection
                                        .query(
                                                'UPDATE person SET lastlogin = ? WHERE email = ?',
                                                [ lastlogin, sess.email ]);
                                console.log("Session: " + JSON.stringify(sess));

                                res.render('home', {
                                    page_title : "After Login",
                                    data : rows,
                                    personId : sess.uid,
                                    firstname : sess.fname,
                                    lastname : sess.lname,
                                    email : sess.email,
                                    lastlogin : sess.lastlogin,
                                    isAdmin : sess.isAdmin,
                                    isBuyer : sess.isBuyer,
                                    isSeller : sess.isSeller,
                                    memberno : sess.memberno
                                });
                                connection.end();
                            } else {
                                req
                                        .flash('error',
                                                'Username or password is incorrect. Try Again!');
                                res.redirect('/');
                            }
                        }
                    });

    // });
};


exports.logindo_vertical = function(req, res) {
    var input = JSON.parse(JSON.stringify(req.body));
    // req.getConnection(function(err,connection){
    var data = {
        email : input.email,
        password : input.pass,
    };
    console.log(data);
    var password_check = input.pass;
    var cipher = crypto.createCipher(algorithm, key);
    var encrypted_password = cipher.update(password_check, 'utf8', 'hex')
            + cipher.final('hex');
    var connection = mysqldb.getConnection();
    connection.connect();
    var query = connection
            .query(
                    "SELECT * from user WHERE email = ? ",
                    [ data.email ],
                    function(err, rows) {
                        if (err) {
                            console.log("Error fecthing details : %s", err);
                            res.redirect('/');
                        }
                        var userexist = rows[0];
                        console.log("rows: " + userexist);
                        if (userexist == undefined) {
                            console.log("rows: " + userexist);
                            req.flash('error',
                                    'Username does not exists in database');
                            res.redirect('/');
                        } else {
                            if (rows[0].password == encrypted_password) {
                                sess = req.session;
                                console.log(req.session);
                                console.log(rows[0].firstname);
                                sess.uid = rows[0].id;
                                sess.fname = rows[0].firstname;
                                sess.lname = rows[0].lastname;
                                sess.email = rows[0].email;
                                sess.memberno = rows[0].membership_no;
                                if (rows[0].lastlogin == null) {
                                    sess.lastlogin = "First Login";
                                } else {
                                    sess.lastlogin = rows[0].lastlogin
                                            .toString().substr(0, 24);
                                }
                                var lastlogin = new Date();
                                connection
                                        .query(
                                                'UPDATE user SET lastlogin = ? WHERE email = ?',
                                                [ lastlogin, sess.email ]);
                                console.log("Session: " + JSON.stringify(sess));

                                res.render('home_vertical', {
                                    page_title : "After Login",
                                    data : rows,
                                    personId : sess.uid,
                                    firstname : sess.fname,
                                    lastname : sess.lname,
                                    email : sess.email,
                                    lastlogin : sess.lastlogin,
                                    memberno : sess.memberno
                                });
                                connection.end();
                            } else {
                                req
                                        .flash('error',
                                                'Username or password is incorrect. Try Again!');
                                res.redirect('/');
                            }
                        }
                    });

    // });
};

/* Rate a product */

exports.rate = function(req, res) {
    var input = JSON.parse(JSON.stringify(req.body));
    var flag = input.flag;
    var connection = mysqldb.getConnection();

    var data = {
        product_id : input.product_id,
        rating : input.rating,

        submitted_on : new Date(),
    };

    var query = connection
            .query(
                    "Update purchase set rating = ? where product_id =? ",
                    [ input.rating, input.product_id ],
                    function(err, rows) {
                        if (err)
                            console.log("Error inserting : %s ", err);
                        else {
                            if (flag == "bidding") {
                                var id = sess.uid // session user-id
                                connection
                                        .query(
                                                "	select p.id as purchase_id, pr.id as product_id, pr.name "
                                                        + " as product_name,pr.details as product_details, pr.image, s.id "
                                                        + " as seller_id,s.firstname as seller_name, s.membership_no, p.bid_amount, "
                                                        + " p.submitted_on, p.rating, p.submitted_on, p.bid_amount, pr.min_bid "
                                                        + " from Purchase p JOIN Products pr ON p.product_id = pr.id JOIN person s "
                                                        + " ON s.id = pr.seller_id WHERE p.customer_id = ? AND p.sold=1",
                                                [ id ],
                                                function(err, rows) {
                                                    if (err)
                                                        console
                                                                .log(
                                                                        "Error fetching results : %s",
                                                                        err);
                                                    console.log(rows
                                                            + "************");
                                                    res.redirect('/getPurchaseHistory');
                                                });
                            } else {
                                var id = sess.uid // session user-id
                                connection
                                        .query(
                                                "select p.id as purchase_id, pr.id as product_id, pr.name as product_name, pr.image as image, "
                                                        + " s.id as seller_id, s.firstname as seller_name, p.bid_amount as bid_amount, p.submitted_on, p.rating, "
                                                        + " c.firstname as customer_name, c.id as customer_id, p.quantity, s.membership_no, p.bid_amount, p.submitted_on, pr.min_bid "
                                                        + " from Purchase p JOIN Products pr ON p.product_id = pr.id "
                                                        + " JOIN person s ON s.id = pr.seller_id JOIN  person c "
                                                        + " ON c.id = p.customer_id WHERE pr.seller_id = 2 AND p.sold=1",
                                                [ id ],
                                                function(err, rows) {
                                                    if (err)
                                                        console
                                                                .log(
                                                                        "Error fetching results : %s",
                                                                        err);
                                                    console.log(rows
                                                            + "************");
                                                    res.redirect('/getPurchaseHistory');
                                                });
                            }

                            connection.end();
                        }
                    });
};

exports.getUserDetails = function(req, res) {
    var personId = req.params.id;
    var connection = mysqldb.getConnection();
    connection.connect();
    var query = connection.query("select * from person where id = ?",
            [ personId ], function(err, rows) {
                if (err)
                    console.log("Error fetching results : %s", err);
                res.render('getUserDetails', {
                    message : req.flash('error'),
                    data : rows[0],
                    personId : sess.uid,
                    firstname : sess.fname,
                    lastname : sess.lname,
                    email : sess.email,
                    lastlogin : sess.lastlogin,
                    isAdmin : sess.isAdmin,
                    isBuyer : sess.isBuyer,
                    isSeller : sess.isSeller,
                    memberno : sess.memberno
                });
            });
    connection.end();
};


exports.getUserDetails_vertical = function(req, res) {
    var personId = req.params.id;
    var connection = mysqldb.getConnection();
    connection.connect();
    var query = connection.query("select u.id, u.firstname, u.lastname, u.email, ue.address, ue.street, ue.city, ue.state, ue.zip, ue.country, ue.contact, ue.membership_no from user u join user_ext ue where u.id = ue.user_id AND u.id = ?",
            [ personId ], function(err, rows) {
                if (err)
                    console.log("Error fetching results : %s", err);
                res.render('getUserDetails_vertical', {
                    message : req.flash('error'),
                    data : rows[0],
                    personId : sess.uid,
                    firstname : sess.fname,
                    lastname : sess.lname,
                    email : sess.email,
                    lastlogin : sess.lastlogin,
                    memberno : sess.memberno
                });
            });
    connection.end();
};


exports.getDetails = function(req, res) {
    var name = req.params.name;
    // if(req.session.fname == undefined){
    // res.redirect("/");
    // }
    // else {
    var connection = mysqldb.getConnection();

    connection.query("Select * from element where category_name = ?", [ name ],
            function(err, rows) {
                if (err)
                    console.log("Error fetching results : %s", err);
                console.log(rows + "************");

                res.render('details', {
                    page_title : "Details",
                    isAdmin : sess.isAdmin,
                    data : rows,
                    category_name : name,
                    data : rows,
                    name : sess.fname,
                    lastlogin : sess.lastlogin
                });
            });

    connection.end();
    // }
}

exports.logout = function(req, res) {
    var email = sess.email;
    var lastlogin = new Date();
    console.log(email);
    req.session.destroy(function(err) {
        if (err) {
            console.log(err);
        } else {
            var connection = mysqldb.getConnection();

            connection.query("UPDATE users set lastlogin = ? WHERE email = ? ",
                    [ lastlogin, email ], function(err, rows) {
                        if (err) {
                            cosole.log("error : %s", err);
                        }
                        res.redirect('/');
                    });

            connection.end();
        }
    });
}

exports.getHistoryPage = function(req, res) {
    res.render('History', {
        page_title : "",
        dataVar : "ABC"
    });
}

exports.getBiddingHistory = function(req, res) {
    if (req.session.fname == undefined) {
        res.redirect("/");
    } else {
        var connection = mysqldb.getConnection();
        var id = sess.uid // session user-id
        connection
                .query(
                        "select p.id as purchase_id, pr.id as product_id, pr.name as product_name, pr.details as product_details, "
                                + " pr.image, s.id as seller_id,p.bid_amount, pr.min_bid, "
                                + " s.firstname as seller_name, s.membership_no as membership_no, p.bid_amount, p.submitted_on, p.rating "
                                + " from Purchase p JOIN Products pr"
                                + " ON p.product_id = pr.id "
                                + " JOIN person s ON s.id = pr.seller_id "
                                + " WHERE p.customer_id = ? AND pr.isForAuction = 1",
                        [ id ],
                        function(err, rows) {
                            if (err)
                                console.log("Error fetching results : %s", err);
                            console.log(rows + "************");
                            res.render('BiddingHistory', {
                                page_title : "",
                                dataVar : rows
                            });
                        });

        connection.end();
    }
}

exports.getPurchaseHistory = function(req, res) {
    if (req.session.fname == undefined) {
        res.redirect("/");
    } else {
        var connection = mysqldb.getConnection();
        var id = sess.uid // session user-id
        connection
                .query(
                        "	select p.id as purchase_id, pr.id as product_id, pr.name "
                                + " as product_name,pr.details as product_details, pr.image, s.id "
                                + " as seller_id, p.bid_amount, pr.min_bid, s.firstname as seller_name, p.bid_amount, "
                                + " p.submitted_on, p.rating "
                                + " from Purchase p JOIN Products pr ON p.product_id = pr.id JOIN person s "
                                + " ON s.id = pr.seller_id WHERE p.customer_id = ? AND p.sold=1",
                        [ id ],
                        function(err, rows) {
                            if (err)
                                console.log("Error fetching results : %s", err);
                            console.log(rows + "************");
                            res.render('Purchase-History', {
                                page_title : "",
                                dataVar : rows
                            });
                        });

        connection.end();
    }
}

exports.getSellingHistory = function(req, res) {
    if (req.session.fname == undefined) {
        res.redirect("/");
    } else {
        var connection = mysqldb.getConnection();
        var id = sess.uid // session user-id
        connection
                .query(
                        "select p.id as purchase_id, pr.id as product_id, pr.name as product_name, pr.details as product_details, "
                                + "pr.image as image, "
                                + " s.id as seller_id,p.bid_amount, pr.min_bid, s.firstname as seller_name, p.bid_amount as bid_amount, p.submitted_on, p.rating, "
                                + " c.firstname as customer_name, c.id as customer_id, p.quantity "
                                + " from Purchase p JOIN Products pr ON p.product_id = pr.id "
                                + " JOIN person s ON s.id = pr.seller_id JOIN  person c "
                                + " ON c.id = p.customer_id WHERE pr.seller_id = ? AND p.sold=1",
                        [ id ],
                        function(err, rows) {
                            if (err)
                                console.log("Error fetching results : %s", err);
                            console.log(rows + "************");
                            res.render('SellingHistory', {
                                page_title : "",
                                dataVar : rows
                            });
                        });

        connection.end();
    }
}

exports.imageForm = function(req, res) {
    res.render('upload', {
        title : 'Upload Images'
    });

};

exports.uploadImage = function(req, res, next) {
    // console.log('file info: ',req.files.image);

    // split the url into an array and then get the last chunk and render it out
    // in the send req.
    var pathArray = req.files.image.path.split('/');

    var ts = new Date();
    console.log('A : ' + req.files.image.name);
    console.log('A1 : ' + req.files.image.size);
    console.log('A2 : ' + req.files.image.path);
    console.log('A3 : ' + req.body.title);
    console.log('A4 : ' + req.files.image);
    console.log('A5 :' + pathArray)

    var fs = require('fs');
    fs.rename(req.files.image.path,
            '/Users/prashantyadav/Documents/images/uploads/AF.png', function(
                    err) {
                if (err)
                    console.log('ERROR: ' + err);
            });

    // res.send(util.format('<img
    // src="/Users/prashantyadav/Documents/images/uploads/AF.png">'
    // ));

};

exports.addProduct = function(req, res) {
    if (req.session.fname == undefined) {
        res.redirect("/");
    } else {

        var categoryName = req.params.categoryName;
        var categoryId = req.params.categoryId;
        res.render('addProduct', {
            categoryName : categoryName,
            categoryId : categoryId,
            message : req.flash('error')
        });
    }
};

exports.saveProduct = function(req, res) {
    if (req.session.fname == undefined) {
        res.redirect("/");
    } else {
        var input = JSON.parse(JSON.stringify(req.body));
        var connection = mysqldb.getConnection();
        var condition = input.condition == "1000" ? "New" : "Refurbished";
        var auction = input.format == "Auction" ? 1 : 0;
        var temp_path = req.files.image.path;
        console.log(temp_path);
        var fs = require('fs');
        var data = {
            name : input.title,
            details : input.details,
            condition : condition,
            isForAuction : auction,
            min_bid : input.startPrice * 1,
            quantity : parseInt(input.quantity),
            bid_duration : parseInt(input.duration),
            category_id : input.categoryId,
            cost : input.startPrice * 1,
            seller_id : sess.uid, // session management
            bid_start_time : new Date(),
            isActive : 1,
            image : temp_path
        };
        console.log('####Image Size####'+req.files.image.size);
        if(req.files.image.size>3000000){
        	req.flash('error', 'Maximum Image Size is 5MB');
        	 res.redirect('/addProduct/'+input.categoryName+'/'+input.categoryId);
        }
        else{
        	var msg = validate(input, req.files.image.name);

            console.log("Message : " + msg.length);
            if (msg.length == 0) {

                console.log("inside if")
                // get the temporary location of the file
                var tmp_path = req.files.image.path;
                // set where the file should actually exists - in this case it is in
                // the
                // "images" directory
                var target_path = './public/images/' + req.files.image.name;
                // move the file from the temporary location to the intended
                // location
                fs.rename(tmp_path, target_path, function(err) {
                    if (err)
                        throw err;
                    // delete the temporary file, so that the explicitly set
                    // temporary
                    // upload dir does not get filled with unwanted files
                    fs.unlink(tmp_path, function() {
                        if (err)
                            throw err;
                        console.log();
                    });
                });
                var myDate = new Date();
                myDate.setDate(myDate.getDate() + parseInt(input.duration));
                var data = {
                    name : input.title,
                    details : input.details,
                    condition : condition,
                    isForAuction : auction,
                    min_bid : input.startPrice * 1,
                    quantity : parseInt(input.quantity),
                    bid_duration : parseInt(input.duration),
                    category_id : input.categoryId,
                    cost : input.startPrice * 1,
                    seller_id : sess.uid,
                    bid_start_time : new Date(),
                    image : target_path.substring(8),
                    isActive : 1,
                    bid_end_time : myDate
                };
                connection.connect();
                var query = connection.query("Insert into products set ? ", data,
                        function(err, info) {
                            if (err)
                                console.log("Error inserting : %s", err);
                            else {
                            	cache.vlmCache.invalidate("products", function(err) {
            						if(err) {
            							throw err;
            						}
            					});
                                console.log(info.insertId);
                                res.render('addProduct', {
                                    categoryName : input.categoryName,
                                    categoryId : input.categoryId,
                                    message : 'Product added successfuly'
                                });
                            }

                        });
                connection.end();
            } else {
                console.log("inside else")
                req.flash('error', msg);
                res.redirect('/addProduct/'+input.categoryName+'/'+input.categoryId);
            }
        }
        

    }

}

exports.home = function(req, res) {
    if (sess.fname == undefined) {
        res.redirect("/");
    } else {
        res.render('home');
    }
}
validate = function(input, name) {
    var msgappender = " is mandoatory";
    var msg = "";

    if (input.title == "" || input.title.length == 0) {
        msg = "Title" + msgappender;
    } else if (input.details == "" || input.details.length == 0) {
        msg = "Description" + msgappender;
    } else if (input.condition == "" || input.condition.length == 0)
        msg = "Condition" + msgappender;
    else if (input.format == "" || input.format.length == 0)
        msg = "List As" + msgappender;
    else if (input.startPrice == "" || input.condition.length == 0)
        msg = "Start Prie" + msgappender;
    else if (input.duration == "" || input.duration.length == 0)
        msg = "Duration" + msgappender;
    else if (name.toString().indexOf(".") == -1)
        msg = "Invalid Image";
    else if ((input.startPrice * 1) == NaN)
        msg == "Invalid Start Price";

    return msg;

}

exports.searchproducts = function(req, res) {
    var connection = mysqldb.getConnection();
    connection.connect();

    var query = connection.query('SELECT name from products where name like "%'
            + req.query.key + '%"', function(err, rows, fields) {
        if (err)
            throw err;
        var data = [];
        for (i = 0; i < rows.length; i++) {
            data.push(rows[i].name);
        }
        res.end(JSON.stringify(data));
    });

    connection.end();
}

exports.getCategories = function(req, res) {
    /*
     * if(req.session.fname == undefined){ res.redirect("/"); } else{
     */
    if (req.session.fname == undefined) {
        res.redirect("/");
    } else {
        var connection = mysqldb.getConnection();
        connection.connect();
        var query = connection.query('SELECT * from category', function(err,
                rows) {
            if (err)
                console.log("Error getting vlaues % s", err);
            connection.end();
            res.render('selectCategories', {
                page_title : "Categories",
                data : rows
            });
        });
    }
}

var CronJob = require('cron').CronJob;
new CronJob(
        '300 * * * * *',
        function() {
            var connection = mysqldb.getConnection();
            connection.connect();
            var query = connection
                    .query(
                            "select p.product_id, p.customer_id, max(p.bid_amount) as max_bid from purchase p "
                                    + " join products pr on pr.id = p.product_id "
                                    + " WHERE pr.isForAuction = 1 and pr.bid_end_time < now() "
                                    + " and sold=0 and p.submitted_on < pr.bid_end_time group by p.product_id",
                            function(err, rows) {
                                if (err)
                                    console
                                            .log("Error getting values %s ",
                                                    err);
                                else {
                                    for ( var i = 0; i < rows.length; i++) {
                                        var pid = rows[i].product_id;
                                        var cid = rows[i].customer_id;
                                        var cost = rows[i].max_bid;
                                        console.log(pid + " " + cid + " "
                                                + cost);
                                        var query = connection
                                                .query(
                                                        "UPDATE purchase set sold = 1 WHERE product_id = ? and customer_id = ? and bid_amount = ? ",
                                                        [ pid, cid, cost ],
                                                        function(err, data) {
                                                            if (err)
                                                                console
                                                                        .log(
                                                                                "Error getting values %s ",
                                                                                err);
                                                            else
                                                                console
                                                                        .log(data);
                                                        });
                                    }
                                }
                                connection.end();
                            });
          //  console.log('You will see this message every second');
        }, null, true, "America/Los_Angeles");

exports.deleteUser = function(req, res) {
    var id = req.params.id;
    var status = req.params.status;
    var utype = req.params.utype;
    var connection = mysqldb.getConnection();
    connection.query("UPDATE person set isActive = ? WHERE id = ? ", [ status,
            id ], function(err, rows) {
        if (err) {
            console.log("error : %s", err);
        }
        if (utype == "customers") {
            res.redirect("/getAllCustomers")
        } else {
            res.redirect("/getAllSellers")
        }

    });

    connection.end();
}

exports.test2 = function(req, res){
	var rows1;
	var sql = 'select * from person limit 1000';
	cache.vlmCache.get("users", sql, function(err, value) {
		if(value !== null) {
			rows1 = value;
			console.log("got data from cache");
			console.log(JSON.stringify(cache.vlmCache.getStats()));
			res.send(rows1);
		} else {
			console.log("have to set cache");
			var connection = mysqldb.getConnection();
			connection.query(sql,function(err, rows) {
				rows1=rows;
				if(err) {
					throw err;
				} else {
					//console.log(JSON.stringify(rows));
					cache.vlmCache.set("users", sql, rows, function(err, success) {
						if(err || !success) {
							throw err;
						}
					});
					console.log(JSON.stringify(cache.vlmCache.getStats()));
					res.send(rows1);
				}});

			}});
}
