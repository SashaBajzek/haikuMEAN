var mongoose = require('mongoose');

var HaikuSchema = new mongoose.Schema({
	haikuBody: String
	
});

mongoose.model('Haiku', HaikuSchema);