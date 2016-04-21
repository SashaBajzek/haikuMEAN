var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Haiku = mongoose.model('Haiku');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/haikus', function(req, res, next){
	Haiku.find(function(err, haikus){
		if(err) {return next(err);}
		
		res.json(haikus);
	});
	
});

router.post('/haikus', function(req, res, next) {
	var haiku = new Haiku(req.body);
	
	haiku.save(function(err, post){
		if(err){return next(err);}
		
		res.json(haiku);
	});
	
});

router.param('haiku', function(req, res, next, id) {
	var query = Haiku.findById(id);
	
	query.exec(function (err, haiku) {
		if (err) {return next(err);}
		if (!haiku) {return next(new Error('can\'t find haiku'));}
		
		req.haiku = haiku;
		
		return next();
		
	});
});

router.get('/haikus/:haiku', function(req, res) {
	res.json(req.haiku);
});

module.exports = router;
