var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Haiku = mongoose.model('Haiku');
var passport = require('passport');
var User = mongoose.model('User');
var jwt = require('express-jwt');
var dotenv = require('dotenv');
dotenv.load();

var auth = jwt({secret: process.env.SECRET, userProperty: 'payload'});

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
router.delete('/haikus/:haiku', auth, function(req, res) {
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


router.post('/register', function(req, res, next) {
	if(!req.body.username || !req.body.password) {
		return res.status(400).json({message: 'Please fill out all fields'});
	}
	
	var user = new User();
	
	user.username = req.body.username;
	
	user.setPassword(req.body.password);
	
	user.save(function(err) {
		if(err) {
			return next(err);
		}
		return res.json({token: user.generateJWT()})
	});

});

router.post('/login', function(req, res, next) {
	if(!req.body.username || !req.body.password){
		return res.status(400).json({message: 'Please fill out all fields'});
	}
	
	passport.authenticate('local', function(err, user, info){
		if(err) {
			return next(err);
		}
		
		if(user) {
			return res.json({token: user.generateJWT()});
		}
		
		else {
			return res.status(401).json(info);
		}
	})(req, res, next);
});








module.exports = router;
