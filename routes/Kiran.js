var ejs = require("ejs");
var mysql = require('../mysqldb');
var url = require('url');
var redis = require("redis"), 
client = redis.createClient();
var cache = require('../redisCache');
var validator = require('validator');
var product_id = [];
var quantity = [];
var cost = [];

function getUserDetails(req, res) {
    if (req.session.fname == undefined) {
        res.redirect("/");
    }

    var url_parts = url.parse(req.url, true);
    var query = url_parts.query;
    var user_id = parseInt(query.id);
    var details = "select * from person where id='" + user_id + "'";
    var con = mysql.getConnection();
    con.query(details, function(err, results) {
        if (results.length > 0) {
            res.send(results);
            console.log(results);
            res.end();
        } else {
            console.log("no details for the given id");
            res.send("no details for the given id");
        }
    }

    );
    con.end();
}
function start(req, res) {
    if (req.session.fname == undefined) {
        res.redirect("/");
    } else {
        ejs.renderFile('./views/home.ejs', function(err, result) {
            if (!err) {

                res.end(result);
            } else {
                res.end('An error occured');
                console.log(err);
            }

        });
    }
}
function update(req, res) {
    var query = "select * from person where ";
    ejs.renderFile('./views/update.ejs', function(err, result) {
        if (!err) {

            res.end(result);
        } else {
            res.end('An error occured');
            console.log(err);
        }

    });

}
function updateUserDetails(req, res) {
    var firstname = req.param("firstname");
    var lastname = req.param("lastname");
    var address = req.param("address");
    var password = req.param("pass");
    var city = req.param("city");
    var state = req.param("state");
    var zip = req.param("zip");
    var contact = req.param("contact");
    var query = "update person set firstname='" + firstname + "',lastname='"
            + lastname + "',address='" + address + "',city='" + city
            + "',state='" + state + "',zip='" + zip + "',contact='" + contact
            + "' where id='2'";
    var con = mysql.getConnection();
    con.query(query, function(err, results) {
        if (!err) {
            res.send("updated");
            console.log("updated");
            res.end();
        } else {
            res.send("not updated");
            console.log("not updated");
            res.end();
        }
    });
    con.end();

}

function searchProducts(req, res) {
    var rows1;
    if (req.session.fname == undefined) {
        res.redirect("/");
    } else {

        var searchQuery = req.param("_nkw");

        var sql = "select p.*,c.id as catId,c.name as catName from products p join category c on c.id = p.category_id where p.name REGEXP '"
                + searchQuery
                + "' OR details REGEXP '"
                + searchQuery
                + "' OR `condition` REGEXP '"
                + searchQuery
                + "' and p.isActive='1' and p.quantity>'0'";

        cache.vlmCache.get("products", sql, function(err, value) {
            if (value !== null) {
                rows1 = value;
                console.log("got data from cache");
                console.log(JSON.stringify(cache.vlmCache.getStats()));

                ejs.renderFile('./views/sample.ejs', {
                    results : rows1,
                    searchName : searchQuery
                }, function(err, result) {
                    if (!err) {
                        res.end(result);
                    } else {
                        res.end("An error occured");
                        console.log(err);
                    }
                });

            } else {
                console.log("have to set cache");
                var connection = mysql.getConnection();
                connection.query(sql, function(err, rows) {
                    rows1 = rows;
                    if (err) {
                        throw err;
                    } else {
                        // console.log(JSON.stringify(rows));
                        cache.vlmCache.set("products", sql, rows, function(err,
                                success) {
                            if (err || !success) {
                                throw err;
                            }
                        });
                        console.log(JSON.stringify(cache.vlmCache.getStats()));

                        ejs.renderFile('./views/sample.ejs', {
                            results : rows1,
                            searchName : searchQuery
                        }, function(err, result) {
                            if (!err) {
                                res.end(result);
                            } else {
                                res.end("An error occured");
                                console.log(err);
                            }
                        });

                    }
                });
                connection.end();

            }
        });
    }

}

function getCustomers(req, res) {
    var rows1;
    if (req.session.fname == undefined) {
        res.redirect("/");
    } else {
        var sql = "select * from person where isBuyer=1";
        cache.vlmCache.get("buyers", sql, function(err, value) {
            if (value !== null) {
                rows1 = value;
                console.log("got data from cache");
                console.log(JSON.stringify(cache.vlmCache.getStats()));

                ejs.renderFile('./views/users.ejs', {
                    results : rows1
                }, function(err, result) {
                    if (!err) {
                        res.end(result);
                    } else {
                        res.end("An error occured");
                        console.log(err);
                    }
                });

            } else {
                console.log("have to set cache");
                var connection = mysql.getConnection();
                connection.query(sql, function(err, rows) {
                    rows1 = rows;
                    if (err) {
                        throw err;
                    } else {
                        // console.log(JSON.stringify(rows));
                        cache.vlmCache.set("buyers", sql, rows, function(err,
                                success) {
                            if (err || !success) {
                                throw err;
                            }
                        });
                        console.log(JSON.stringify(cache.vlmCache.getStats()));

                        ejs.renderFile('./views/users.ejs', {
                            results : rows1
                        }, function(err, result) {
                            if (!err) {
                                res.end(result);
                            } else {
                                res.end("An error occured");
                                console.log(err);
                            }
                        });

                    }
                });
                connection.end();

            }
        });

    }

}
function getSellers(req, res) {
    var rows1;
    if (req.session.fname == undefined) {
        res.redirect("/");
    } else {
        var sql = "select * from person where isSeller=1";
        cache.vlmCache.get("sellers", sql, function(err, value) {
            if (value !== null) {
                rows1 = value;
                console.log("got data from cache");
                console.log(JSON.stringify(cache.vlmCache.getStats()));

                ejs.renderFile('./views/sellers.ejs', {
                    results : rows1
                }, function(err, result) {
                    if (!err) {
                        res.end(result);
                    } else {
                        res.end("An error occured");
                        console.log(err);
                    }
                });

            } else {
                console.log("have to set cache");
                var connection = mysql.getConnection();
                connection.query(sql, function(err, rows) {
                    rows1 = rows;
                    if (err) {
                        throw err;
                    } else {
                        // console.log(JSON.stringify(rows));
                        cache.vlmCache.set("sellers", sql, rows, function(err,
                                success) {
                            if (err || !success) {
                                throw err;
                            }
                        });
                        console.log(JSON.stringify(cache.vlmCache.getStats()));

                        ejs.renderFile('./views/sellers.ejs', {
                            results : rows1
                        }, function(err, result) {
                            if (!err) {
                                res.end(result);
                            } else {
                                res.end("An error occured");
                                console.log(err);
                            }
                        });

                    }
                });
                connection.end();

            }
        });

    }

}
function searchUsers(req, res) {
    if (req.session.fname == undefined) {
        res.redirect("/");
    } else {
        var searchQuery = req.param("_nkw");
        var flag = req.param("flag");
        var sql = "select * from person where firstname REGEXP '" + searchQuery
                + "' OR lastname REGEXP '" + searchQuery
                + "' OR email REGEXP '" + searchQuery + "'";

        cache.vlmCache.get("users", sql, function(err, value) {
            if (value !== null) {
                rows1 = value;
                console.log("got data from cache");
                console.log(JSON.stringify(cache.vlmCache.getStats()));
                if (flag === "AllSellers") {
                    ejs.renderFile('./views/sellers.ejs', {
                        results : rows1
                    }, function(err, result) {
                        if (!err) {
                            res.end(result);
                        } else {
                            res.end("An error occured");
                            console.log(err);
                        }
                    });
                }
                if (flag === "AllCustomers") {
                    ejs.renderFile('./views/users.ejs', {
                        results : rows1
                    }, function(err, result) {
                        if (!err) {
                            res.end(result);
                        } else {
                            res.end("An error occured");
                            console.log(err);
                        }
                    });
                }
            } else {
                console.log("have to set cache");
                var connection = mysql.getConnection();
                connection.query(sql, function(err, rows) {
                    rows1 = rows;
                    if (err) {
                        throw err;
                    } else {
                        // console.log(JSON.stringify(rows));
                        cache.vlmCache.set("users", sql, rows, function(err,
                                success) {
                            if (err || !success) {
                                throw err;
                            }
                        });
                        console.log(JSON.stringify(cache.vlmCache.getStats()));
                        if (flag === "AllSellers") {
                            ejs.renderFile('./views/sellers.ejs', {
                                results : rows1
                            }, function(err, result) {
                                if (!err) {
                                    res.end(result);
                                } else {
                                    res.end("An error occured");
                                    console.log(err);
                                }
                            });
                        }
                        if (flag === "AllCustomers") {
                            ejs.renderFile('./views/users.ejs', {
                                results : rows1
                            }, function(err, result) {
                                if (!err) {
                                    res.end(result);
                                } else {
                                    res.end("An error occured");
                                    console.log(err);
                                }
                            });
                        }
                        // res.render('allMovies.jade', {catas : rows1});
                    }
                });
                connection.end();
            }
        });
    }
}
function signout(req, res) {

    if (req.session.fname == undefined) {
        res.redirect("/");
    } else {
        req.flash('error', "Successfully Signed out...");
        ejs.renderFile('./views/login.ejs', {
            message : req.flash('error')
        }, function(err, result) {
            if (!err) {

                res.end(result);
            } else {
                res.end('An error occured');
                console.log(err);
            }
        });
        req.session.destroy();
    }

}
function searchPurchasedProducts(req, res) {
    if (req.session.fname == undefined) {
        res.redirect("/");
    } else {
        var searchQuery = req.param("_nkw");
        var flag = req.param("flag");
        var id = req.session.uid;

        var con = mysql.getConnection();
        con
                .query(
                        "    select p.id as purchase_id, pr.id as product_id, pr.name "
                                + " as product_name,pr.details as product_details, pr.image, s.id "
                                + " as seller_id, p.bid_amount, pr.min_bid, s.firstname as seller_name, p.bid_amount, "
                                + " p.submitted_on, p.rating "
                                + " from Purchase p JOIN Products pr ON p.product_id = pr.id JOIN person s "
                                + " ON s.id = pr.seller_id WHERE p.customer_id = ? AND p.sold=1 AND pr.name REGEXP '"
                                + searchQuery + "'", [ id ], function(err,
                                results) {
                            if (!err) {
                                res.render('Purchase-History', {
                                    page_title : "",
                                    dataVar : results
                                });
                            } else {
                                res.send("no matches");
                            }
                        });
        con.end();
    }

}
function searchBiddedProducts(req, res) {
    if (req.session.fname == undefined) {
        res.redirect("/");
    } else {

        var searchQuery = req.param("_nkw");
        var flag = req.param("flag");
        var id = req.session.uid;

        var con = mysql.getConnection();
        con
                .query(
                        "select p.id as purchase_id, pr.id as product_id, pr.name as product_name, pr.details as product_details, "
                                + " pr.image, s.id as seller_id,p.bid_amount, pr.min_bid, "
                                + " s.firstname as seller_name, s.membership_no as membership_no, p.bid_amount, p.submitted_on, p.rating "
                                + " from Purchase p JOIN Products pr"
                                + " ON p.product_id = pr.id "
                                + " JOIN person s ON s.id = pr.seller_id "
                                + " WHERE p.customer_id = ? AND pr.isForAuction = 1 AND pr.name REGEXP '"
                                + searchQuery + "'", [ id ], function(err,
                                results) {
                            if (!err) {
                                console.log("hi");
                                res.render('BiddingHistory', {
                                    page_title : "",
                                    dataVar : results
                                });
                            } else {
                                res.send("no matches");
                            }
                        });
        con.end();
    }

}
function searchSoldProducts(req, res) {
    if (req.session.fname == undefined) {
        res.redirect("/");
    } else {
        var searchQuery = req.param("_nkw");
        var flag = req.param("flag");
        var id = req.session.uid;

        var con = mysql.getConnection();
        con
                .query(
                        "select p.id as purchase_id, pr.id as product_id, pr.name as product_name, pr.details as product_details, "
                                + "pr.image as image, "
                                + " s.id as seller_id,p.bid_amount, pr.min_bid, s.firstname as seller_name, p.bid_amount as bid_amount, p.submitted_on, p.rating, "
                                + " c.firstname as customer_name, c.id as customer_id, p.quantity "
                                + " from Purchase p JOIN Products pr ON p.product_id = pr.id "
                                + " JOIN person s ON s.id = pr.seller_id JOIN  person c "
                                + " ON c.id = p.customer_id WHERE pr.seller_id = ? AND p.sold=1 AND pr.name REGEXP '"
                                + searchQuery + "'", [ id ], function(err,
                                results) {
                            if (!err) {
                                res.render('BiddingHistory', {
                                    page_title : "",
                                    dataVar : results
                                });
                            } else {
                                res.send("no matches");
                            }
                        });
        con.end();
    }
}
function myCart(req, res) {
    if (req.session.fname == undefined) {
        res.redirect("/");
    } else {
        var id = req.session.uid;

        var con = mysql.getConnection();
        con
                .query(
                        "select u.id,pr.name,u.cost,u.quantity,pr.id from user_cart AS u  join products AS pr ON u.product_id=pr.id where u.user_id= ?",
                        [ id ], function(err, results) {
                            console.log(results);
                            if (!err) {
                                for ( var i = 0; i < results.length; i++) {

                                    product_id[i] = results[i].id;
                                    quantity[i] = results[i].quantity;
                                    cost[i] = results[i].cost;
                                }
                                res.render('Cart', {
                                    page_title : "",
                                    results : results,
                                    message : req.flash('message')
                                });
                            } else {
                                res.send("no matches");
                            }
                        });
        con.end();
    }

}
function searchAllProductsInHistory(req, res) {
    if (req.session.fname == undefined) {
        res.redirect("/");
    } else {
        var searchQuery = req.param("_nkw");
        // var flag = req.param("flag");
        var id = req.session.uid;

        var con = mysql.getConnection();
        con
                .query(
                        "Select p.*, c.name as cname from products p join category c on c.id = p.category_id where p.seller_id = ? AND p.name REGEXP '"
                                + searchQuery + "'", [ id ], function(err,
                                results) {
                            if (!err) {
                                res.render('getSellerProducts', {
                                    page_title : "",
                                    data : results
                                });
                            } else {
                                res.send("no matches");
                            }
                        });
        con.end();
    }

}
function deleteFromCart(req, res) {
    if (req.session.fname == undefined) {
        res.redirect("/");
    } else {
        var id = req.params.id;
        var con = mysql.getConnection();
        con.query("delete from user_cart where product_id=?", [ id ], function(
                err, results) {
            res.redirect('/mycart');
        });
        con.end();
    }
}
function checkout(req, res) {
    if (req.session.fname == undefined) {
        res.redirect("/");
    } else {
        if (product_id.length === 0) {
            req.flash('message', "No items in the Cart to place the order");
            res.redirect('/mycart');

        }
        var con = mysql.getConnection();
        for ( var i = 0; i < product_id.length; i++) {
            console.log(product_id[i]);
            console.log(quantity[i]);
            console.log(cost[i]);
            var id = product_id[i];
            var soldquantity = quantity[i];
            var totalcost = cost[i];
            con.query("update products set quantity=quantity-? where id=?", [
                    soldquantity, id ]);
            con.query("delete from user_cart where product_id= ?", id);
            var data = {
                product_id : id,
                customer_id : sess.uid, // to be replaced by sesion id
                bid_amount : totalcost,
                submitted_on : new Date(),
                sold : 1,
                quantity : soldquantity

            };
            con.query("insert into purchase set ?", data);
            req.flash('message', "Successfully placed the order...");
            res.redirect('/mycart');

        }

        con.end();
    }
}

exports.getUserDetails = getUserDetails;
exports.start = start;
exports.updateUserDetails = updateUserDetails;
exports.update = update;
exports.searchProducts = searchProducts;
exports.getCustomers = getCustomers;
exports.getSellers = getSellers;
exports.searchUsers = searchUsers;
exports.signout = signout;
exports.searchPurchasedProducts = searchPurchasedProducts;
exports.searchBiddedProducts = searchBiddedProducts;
exports.searchSoldProducts = searchSoldProducts;
exports.searchAllProductsInHistory = searchAllProductsInHistory;
exports.myCart = myCart;
exports.checkout = checkout;
exports.deleteFromCart = deleteFromCart;
