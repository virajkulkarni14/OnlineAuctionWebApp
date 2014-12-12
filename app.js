/**
 * Module dependencies.
 */
var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');
var crypto = require('crypto');
var Chance = require('chance');
var session = require('express-session');
var bodyParser = require('body-parser');
var fs = require('fs');
// load customers route
var customers = require('./routes/customers');
var meher = require('./routes/meher');
var kiran = require('./routes/Kiran');
var juveria = require('./routes/juveria');
var vertical = require('./routes/vertical');
//import cache, flush cache on every server startup,
//initialization takes time, but cache is renewed on server startup
var cache = require("./redisCache");
var app = express();
var connection = require('express-myconnection');
// var mysql = require('mysql');
var sess = null;
// all environments
app.set('port', process.env.PORT || 4300);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
// app.use(express.favicon());
app.use(session({
    secret : 'ssshhhhh'
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended : true
}));
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.bodyParser({
    keepExtensions : true
}));
// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}
var flash = require('connect-flash');
app.use(flash());
/*------------------------------------------
 connection peer, register as middleware
 type koneksi : single,pool and request 
 -------------------------------------------*/
/*
 * app.use( connection(mysql,{ host: 'localhost', user: 'root', password :
 * 'admin', port : 3306, //port mysql database:'nodejs' },'request') );
 */

// route index, hello world
// app.get('/home', routes.index);//route customer list
app.get('/history', customers.getBiddingHistory);
app.get('/selectCategory', customers.getCategories);
app.get('/getBiddingHistory', customers.getBiddingHistory);
app.get('/getPurchaseHistory', customers.getPurchaseHistory);
app.get('/getSellingHistory', customers.getSellingHistory);
app.get('/search', customers.searchproducts);
app.get('/delete/:id/:status/:utype', customers.deleteUser);
app.get('/testredis', customers.test2);




// ///prashant luthra/////
app.get('/', customers.login);
app.get('/login', customers.login);
app.get('/signup', customers.signup);
app.post('/signup', customers.saveUser);
app.post('/login', customers.logindo);
app.post('/rating', customers.rate);
app.get('/getUserDetails/:id', customers.getUserDetails);
app.post('/updateUser/:id', customers.updateUser);

app.get('/signup_vertical', vertical.signup_vertical);
app.post('/signup_vertical', vertical.saveUserVertical);
app.get('/login_vertical', vertical.login_vertical);
app.post('/login_vertical', customers.logindo_vertical);
app.get('/getUserDetails_vertical/:id', customers.getUserDetails_vertical);
// ////end//////

// ////Juveria/////
app.get('/getProductDetailsBid/:catName/:id', juveria.getProductDetails);
app.post('/bid', juveria.bid);
app.post('/buy', juveria.buy);
// app.get('/mycart', juveria.cart);

// ///Meher/////
app.get('/getCategories', meher.getCategories);
app.get('/getProducts/:name/:id', meher.getProducts);
app.get('/updateProduct/:catName/:productId', meher.updateProduct);
app.get('/getSellerProducts', meher.getSellerProducts);

app.post('/updateProduct/:productId', meher.saveUpdatedProduct);
// ////end//////
app.get('/addProduct/:categoryName/:categoryId', customers.addProduct);
app.post('/addProduct', customers.saveProduct)
app.get('/home', customers.home);

app.get('/upload', customers.imageForm);
app.post('/upload', customers.uploadImage);

// Kiran

app.get('/test', kiran.start);
app.get('/getUserDetails', kiran.getUserDetails);

// app.get('/updateUserDetails',kiran.update);
// app.post('/update',kiran.updateUserDetails);
app.get('/searchProducts', kiran.searchProducts);
app.get('/getAllCustomers', kiran.getCustomers);
app.get('/getAllSellers', kiran.getSellers);
app.get('/searchPerson', kiran.searchUsers);
app.get('/signout', kiran.signout);
app.get('/searchPurchasedProducts', kiran.searchPurchasedProducts);
app.get('/searchBiddedProducts', kiran.searchBiddedProducts);
app.get('/searchSoldProducts', kiran.searchSoldProducts);
app.get('/searchAllProductsInHistory', kiran.searchAllProductsInHistory);
app.get('/mycart', kiran.myCart);
app.get('/deleteFromCart/:id', kiran.deleteFromCart);
app.post('/checkout', kiran.checkout);

app.use(app.router);
//flush cache on server startup
cache.vlmCache.flush();
http.createServer(app).listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));
});
