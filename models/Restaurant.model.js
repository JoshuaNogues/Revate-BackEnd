const { Schema, model } = require('mongoose');

const restaurantSchema = new Schema({
    name: String,
    description: String,
    imageUrl: String,
    owner: { type: Schema.Types.ObjectId, ref: "User" },
    reviews: [{type: Schema.Types.ObjectId, ref: "Review"}]
  });

module.exports = model('Restaurant', restaurantSchema);