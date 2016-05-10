var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    nestedSet = require('../index');

var ItemSchema = new Schema({
    title: String
});

ItemSchema.plugin(nestedSet);

var Item = mongoose.model('Item', ItemSchema);

module.exports = Item;
