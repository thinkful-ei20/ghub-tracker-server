'use strict';

const express = require('express');
const passport = require('passport');
const _ = require('lodash');

const LeaderBoard = require('../models/leaderboard');

const router = express.Router();

router.get('/', (req, res, next) => {
  LeaderBoard.find({})
    .sort('rank')
    .then(results => {
      res.json(results);
    })
    .catch(next);
});

/* ==================================================================================== */
// PROTECTION FOR THE FOLLOWING ENDPOINTS
router.use('/', passport.authenticate('jwt', { session: false, failWithError: true }));

module.exports = router;
