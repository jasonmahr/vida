// get an instance of mongoose and mongoose.Schema
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ClickSchema = require('./click').schema;
var HourSchema = require('./hour').schema;
var SpecialSchema = require('./special').schema;
var RatingSchema = require('./rating').schema;

// set up a mongoose model and pass it using module.exports
module.exports = mongoose.model('Club', new Schema({ 
    name: String,
    latitude: Number,
    longitude: Number,
    description: String,
    phone: String,
    hours: [HourSchema],
    price: Number,
    address: String,
    email: String,
    ratings: [RatingSchema],
    clicks: [ClickSchema],
    specials: [SpecialSchema]
}));