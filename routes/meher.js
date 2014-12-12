var mysqldb = require('../mysqldb.js');
var redis = require("redis"), 
client = redis.createClient();
var cache = require('../redisCache');

exports.getCategories = function(req, res) {
	if (req.session.uid == undefined) {
		req.flash('error', 'Please Login..!!');
		res.redirect("/login");
	} else {
		var connection = mysqldb.getConnection();
		connection.connect();
		var query = connection.query('SELECT * from category', function(err,
				rows) {
			if (err)
				console.log("Error getting vlaues % s", err);
			connection.end();
			res.render('categories', {
				page_title : "Categories",
				data : rows
			});
		});
	}
}

exports.updateProduct = function(req, res) {
	if (req.session.uid == undefined) {
		req.flash('error', 'Please Login..!!');
		res.redirect("/login");
	} else {
		var connection = mysqldb.getConnection();
		connection.connect();
		var productId = req.params.productId;
		var catName = req.params.catName;
		console.log('********' + productId + 'in update***********');
		var query = connection.query('SELECT * from products where id=?',
				[ productId ], function(err, rows) {
					if (err)
						console.log("Error getting vlaues % s", err);
					cache.vlmCache.invalidate("products", function(err) {
						if(err) {
							throw err;
						}
					});
					connection.end();
					//console.log(rows);
					console.log(rows[0].name.length);
					res.render('updateProduct', {
						page_title : "Update Product",
						data : rows,
						productId : productId,
						catName : catName,
						message : req.flash('error')
					});
				});
	}
};

exports.saveUpdatedProduct = function(req, res) {
	if (req.session.uid == undefined) {
		req.flash('error', 'Please Login..!!');
		res.redirect("/login");
	} else {
		var input = JSON.parse(JSON.stringify(req.body));
		var connection = mysqldb.getConnection();
		var productId = input.productId;
		console.log('********************' + productId
				+ ' in saveUpdated******************');
		var condition = input.condition == "1000" ? "New" : "Refurbished";
		var auction = input.format == "Auction" ? 1 : 0;
		var active = input.format == "Active" ? 1 : 0;
		var myDate = new Date();
		myDate.setDate(myDate.getDate() + parseInt(input.duration));
		

		console.log("inside if")
		
		var data = {
			name : input.title,
			details : input.details,
			condition : condition,
			isForAuction : auction,
			min_bid : input.startPrice * 1,
			quantity : parseInt(input.quantity),
			bid_duration : parseInt(input.duration),
			//category_id : input.categoryId,
			cost : input.startPrice * 1,
			bid_start_time : new Date(),
			isActive : active,
			bid_end_time : myDate
		//image : target_path.substring(8)
		};
		connection.connect();
		var query = connection.query("update products set ? where id = ?", [
				data, productId ], function(err, info) {
			if (err) {
				console.log("Error inserting : %s", err);
				req.flash('error', msg);
				res.redirect('/updateProduct');
			} else {
				res.redirect('/getSellerProducts');
			}

		});
		console.log(query);
		connection.end();
	}
	//	else {
	//			console.log("inside else")
	//			req.flash('error', msg);
	//			res.redirect('/updateProduct');
	//		}

	// set where the file should actually exists - in this case it is in the
	// "images" directory
	// var target_path = '/images/' + req.files.image.name;
	// move the file from the temporary location to the intended location
	// fs.rename(tmp_path, target_path, function(err) {
	// if (err) throw err;
	// // delete the temporary file, so that the explicitly set temporary
	// upload
	// dir does not get filled with unwanted files
	// fs.unlink(tmp_path, function() {
	// if (err) throw err;
	// res.send('File uploaded to: ' + target_path + ' - ' +
	// req.files.thumbnail.size + ' bytes');
	// });
	// });

}

exports.getProducts = function(req, res) {
	if (req.session.uid == undefined) {
		req.flash('error', 'Please Login..!!');
		res.redirect("/login");
	} else {
		var category_id = req.params.id;
		var category_name = req.params.name;
		console.log(category_id);
		console.log(category_name);
		var connection = mysqldb.getConnection();
		connection.connect();

		var query = connection
				.query(
						"Select * from products where isActive='1' and quantity>'0' and category_id = ?",
						[ category_id ],
						function(err, rows) {
							if (err)
								console.log("Error fetching results : %s", err);
							connection.end();
							res.render('getProducts', {
								page_title : "Products",
								data : rows,
								name : category_name,
								category_id : category_id
							});
							console.log(rows.length);
						});
	}
};

exports.getSellerProducts = function(req, res) {
	if (req.session.uid == undefined) {
		req.flash('error', 'Please Login..!!');
		res.redirect("/login");
	} else {
		var seller_id = req.session.uid;
		console.log(seller_id + "Seller_Id");
		var connection = mysqldb.getConnection();
		connection.connect();

		var query = connection
				.query(
						"Select p.*, c.name as cname from products p join category c on c.id = p.category_id where p.seller_id = ?",
						seller_id,
						function(err, rows) {
							if (err)
								console.log("Error fetching results : %s", err);
							connection.end();
							res.render('getSellerProducts', {
								page_title : "Listed Products",
								data : rows
							});
						});
	}
};
