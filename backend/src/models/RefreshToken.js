const mongoose = require('mongoose');

const refreshTokenSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  token: {
    type: String,
    required: true,
    index: true // Index for faster lookup
  },
  expires: {
    type: Date,
    required: true
  },
  created: {
    type: Date,
    default: Date.now
  },
  createdByIp: {
    type: String
  },
  revoked: {
    type: Date
  },
  revokedByIp: {
    type: String
  },
  replacedByToken: {
    type: String
  }
});

// Virtual property to check if token is expired
refreshTokenSchema.virtual('isExpired').get(function () {
  return Date.now() >= this.expires;
});

// Virtual property to check if token is active
refreshTokenSchema.virtual('isActive').get(function () {
  return !this.revoked && !this.isExpired;
});

refreshTokenSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    // remove these props when object is serialized
    delete ret._id;
    delete ret.id;
    delete ret.user;
  }
});

module.exports = mongoose.model('RefreshToken', refreshTokenSchema);
