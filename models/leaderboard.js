'use strict';

const mongoose = require('mongoose');

const leaderBoardSchema = new mongoose.Schema({
  rank: { type: Number, required: true },
  name: { type: String, required: true },
  commits: { type: Number, required: true },
}, { timestamps: true });

leaderBoardSchema.set('toObject', {
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  }
});

module.exports = mongoose.model('LeaderBoard', leaderBoardSchema);
