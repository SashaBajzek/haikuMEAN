var mongoose = require('mongoose');

var HaikuSchema = new mongoose.Schema({
	haikuLine1: String,
	haikuLine2: String,
	haikuLine3: String,
	haikuTheme: String
});

mongoose.model('Haiku', HaikuSchema);