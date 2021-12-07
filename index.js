const express = require('express');
const exphbs  = require('express-handlebars');
const avos = require('./avo-shopper')
const pg = require("pg");
const Pool = pg.Pool;
require('dotenv').config()

const app = express();
const PORT =  process.env.PORT || 3019;

//connect to database 
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:Minenhle!28@localhost:5432/avo_shopper';

const pool = new Pool({
	connectionString,
	rejectUnautorized: false
});

const Avos = avos(pool)


// enable the req.body object - to allow us to use HTML forms
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// enable the static folder...
app.use(express.static('public'));

// add more middleware to allow for templating support

app.engine('handlebars', exphbs.engine());
app.set('view engine', 'handlebars');

let counter = 0;

app.get('/', async function(req, res) {
	let topFiveDeals = await Avos.topFiveDeals()
	res.render('index', {
		deals: topFiveDeals
	});
});

app.post('/shops', async function (req, res){
	let shopList = await Avos.listShops()
	res.render('shoplist', {
		list: shopList
	})
})

app.post('/amount', async function (req, res){
	let maxPrice = parseFloat(req.body.amount)
	let recommendedDeals = await Avos.recommendDeals(maxPrice)
	res.render('index', {
		deals: recommendedDeals
	})
})

app.get('/shops/:id', async function(req, res){
	let shopDeals = await Avos.dealsForShop(req.params.id)
	res.render('deals', {
		deals: shopDeals
	})
})

app.post('/addDeal', async function(req, res){
	let shopList = await Avos.listShops()
	Avos.createDeal(req.body.shop_name, req.body.qty, req.body.price)
	res.render('addDeal', {
		list: shopList
	})
})

app.post('/addShop', async function(req, res){
	Avos.createShop(req.body.shop)
	res.redirect('/')
})

// start  the server and start listening for HTTP request on the PORT number specified...
app.listen(PORT, function() {
	console.log(`AvoApp started on port ${PORT}`)
});