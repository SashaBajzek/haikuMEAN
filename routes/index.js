var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Haiku = mongoose.model('Haiku');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

//Get all haikus
router.get('/haikus', function(req, res, next){
	Haiku.find(function(err, haikus){
		if(err) {return next(err);}
		
		res.json(haikus);
	});
	
});

//Create new haiku
router.post('/haikus', function(req, res, next) {
	var haiku = new Haiku(req.body);
	
	haiku.save(function(err, post){
		if(err){return next(err);}
		
		res.json(haiku);
	});
	
});

//Map logic to route parameter 'haiku'
router.param('haiku', function(req, res, next, id) {
	var query = Haiku.findById(id);
	
	query.exec(function (err, haiku) {
		if (err) {return next(err);}
		if (!haiku) {return next(new Error('can\'t find haiku'));}
		
		req.haiku = haiku;
		
		return next();
		
	});
});

//Get single haiku
router.get('/haikus/:haiku', function(req, res) {
	res.json(req.haiku);
});

//Delete haiku
router.delete('/haikus/:haiku', function(req, res) {
	Haiku.remove({
		_id: req.params.haiku
	}, function(err, haiku) {
		if (err) { return next(err); }
		
		// get and return all the haiku after one is deleted
		Haiku.find(function(err, haikus) {
			res.json(haikus);
		});
	});
});

module.exports = router;
