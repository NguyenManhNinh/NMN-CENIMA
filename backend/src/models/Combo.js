const mongoose = require('mongoose');

const comboSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  items: [{
    name: String,
    quantity: Number
  }],
  price: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE'],
    default: 'ACTIVE'
  }
}, {
  timestamps: true
});

const Combo = mongoose.model('Combo', comboSchema);
module.exports = Combo;
