/**
 * New node file
 */

var mysqldb = require('../mysqldb.js');
var util = require('util');

exports.getProductDetails = function(req,res){
	if (req.session.uid == undefined) {
		req.flash('error', 'Please Login..!!');
		res.redirect("/login");
	} else {
	//var input = JSON.parse(JSON.stringify(req.body));
	var id = req.params.id;
	var categoryName = req.params.catName;
	var connection = mysqldb.getConnection();
	connection.connect();
	var query =connection.query("select pr.id,pr.name as product_name,pr.details as product_details, pr.image,pr.`condition` as product_condition,pr.cost as cost,pr.isForAuction as auction,pr.cost as cost, pr.min_bid as min_bid,pr.bid_duration as bid_duration,pr.quantity as quantity,pr.bid_start_time as bid_start_time, pr.bid_end_time, p.firstname as seller_name, avg(pur.rating) as rating from Products pr INNER JOIN Person p ON pr.seller_id=p.id INNER JOIN purchase pur ON pr.id = pur.product_id WHERE pur.sold = 1 AND pr.id = ?",[id], function(err, rows){
		if (err)
			console.log("Error : %s ",err );
		console.log("rows: " + rows[0].rating);
		res.render('getProductDetailsBid',{data:rows,categoryName:categoryName, message: req.flash('message')});

			});
	connection.end();

	}
};

exports.bid = function(req, res){
	if (req.session.uid == undefined) {
		req.flash('error', 'Please Login..!!');
		res.redirect("/login");
	} else {
	//var id = req.params.id;
	var input = JSON.parse(JSON.stringify(req.body));
	var data = {
			product_id : input.productId,
			customer_id : sess.uid,   //to be replaced by sesion id
			bid_amount : input.bid_amount,
			submitted_on: new Date(),
			sold : 0,
			quantity : 1

	};
	var connection = mysqldb.getConnection();
	console.log(data);
	connection.connect();
	var query=connection.query("select min_bid from products where id = ?",[data.product_id],function(err,rows)
			{
		  console.log(rows);
		if(err){
			console.log("Error fecthing details : %s", err);
			res.redirect('/getProductDetailsBid');
		} 
		if(input.bid_amount<rows[0].min_bid)
		{
			req.flash('message','Invalid Bid Amount!');
			res.redirect('/getProductDetailsBid/'+input.categoryName+'/'+input.productId);
		}
		else
		{
			var query = connection.query("Insert into purchase set ? ", data, function(err, rows){
				if(err)
					console.log("Error inserting : %s", err);
				else
				{
					req.flash('message','Your Bid Hasbeen Successfully Placed!');
					res.redirect('/getProductDetailsBid/'+input.categoryName+'/'+input.productId);

				}



			});
			connection.end();
		}
			});
	//connection.end();

}};

exports.cart = function(req, res){
	var id = sess.uid;
	var connection = mysqldb.getConnection();
	connection.connect();
	var query =connection.query("select pr.id,pr.name as product_name,uc.cost as cost, uc.quantity as quantity from Products pr JOIN user_cart uc  ON pr.id = uc.product_id WHERE uc.user_id=?",[id], function(err, rows){
		if (err)
			console.log("Error : %s ",err );
		res.render('cart',{data:rows, message: req.flash('message')});
			});
	connection.end();
	
}
exports.buy = function(req, res){
	if (req.session.uid == undefined) {
		req.flash('error', 'Please Login..!!');
		res.redirect("/login");
	} else {

	var id = req.params.id;
	var input = JSON.parse(JSON.stringify(req.body));
	var event = input.event;
	console.log("event"+event);
	var connection = mysqldb.getConnection();
	connection.connect();
	if(event=="cart"){
		
		var cartdata = {
				user_id : sess.uid,
				product_id : input.productId,
				stored_on : new Date(),
				quantity : input.quantity,
				cost : (input.cost) * (1*input.quantity)
		}
		var query=connection.query("insert into user_cart set ?", cartdata, function(err, rows){
			console.log(rows);
			if(err)
				console.log("Error inserting : %s", err);
			else{
				req.flash('message','Product added in your cart!');
				res.redirect('/getProductDetailsBid/'+input.categoryName+'/'+input.productId);
			}
		});
	}
	else{
		var query=connection.query("select cost,quantity from products where id =? ",[input.productId],function(err,rows){
			if(err){
				console.log("Error fecthing details : %s", err);
				res.redirect('/getProductDetailsBid/'+input.categoryName+'/'+input.productId);
			} 	
			else{
				var data = {
						product_id : input.productId,
						customer_id : sess.uid,   //to be replaced by sesion id
						bid_amount : rows[0].cost,
						submitted_on: new Date(),
						sold : 1,
						quantity : input.quantity

				};
				var old_qty=rows[0].quantity;
				console.log(data);
				if(input.quantity==0)
					{
					req.flash('message','Please Enter Quantity 1 Or More');
					res.redirect('/getProductDetailsBid/'+input.categoryName+'/'+input.productId);
					}
				if(input.quantity<=old_qty)
				{
					var query = connection.query("Insert into purchase set ? ", data, function(err, rows){
						console.log(rows);
						if(err)
							console.log("Error inserting : %s", err);
						else
						{
							console.log(typeof old_qty);
							console.log(typeof input.quantity);
							var query= connection.query("update products set quantity=? where id = ?", [old_qty-input.quantity, input.productId], function(err, rows){
								if(err)
									console.log("Error inserting : %s", err);
								else{

									req.flash('message','You have Successfully Placed your Order!');
									res.redirect('/getProductDetailsBid/'+input.categoryName+'/'+input.productId);

								}
							});
							connection.end();
						}

					});
				}
				
				else{
					req.flash('message','Invalid Quantity!');
					res.redirect('/getProductDetailsBid/'+input.categoryName+'/'+input.productId);

				}
			}	
				
			});
	}
				//connection.end();

	}
};