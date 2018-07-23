'use strict';

const express = require('express');
const passport = require('passport');
const _ = require('lodash');

const gitWrap = require('../utility/git-wrap');

const User = require('../models/user');

const router = express.Router();

router.get('/', (req, res, next) => {
  User.find({})
    .sort('name')
    .then(results => {
      res.json(results);
    })
    .catch(next);
});

/* ========== POST/CREATE A USER ========= */
router.post('/register', (req, res, next) => {

  const requiredFields = ['username', 'password'];
  const missingField = requiredFields.find(field => !(field in req.body));

  if (missingField) {
    const err = new Error(`Missing '${missingField}' in request body`);
    err.status = 422;
    return next(err);
  }

  const stringFields = ['username', 'password', 'firstname', 'lastname'];
  const nonStringField = stringFields.find(
    field => field in req.body && typeof req.body[field] !== 'string'
  );

  if (nonStringField) {
    const err = new Error(`Field: '${nonStringField}' must be type String`);
    err.status = 422;
    return next(err);
  }

  // If the username and password aren't trimmed we give an error.  Users might
  // expect that these will work without trimming (i.e. they want the password
  // "foobar ", including the space at the end).  We need to reject such values
  // explicitly so the users know what's happening, rather than silently
  // trimming them and expecting the user to understand.
  // We'll silently trim the other fields, because they aren't credentials used
  // to log in, so it's less of a problem.
  const explicityTrimmedFields = ['username', 'password'];
  const nonTrimmedField = explicityTrimmedFields.find(
    field => req.body[field].trim() !== req.body[field]
  );

  if (nonTrimmedField) {
    const err = new Error(`Field: '${nonTrimmedField}' cannot start or end with whitespace`);
    err.status = 422;
    return next(err);
  }

  // bcrypt truncates after 72 characters, so let's not give the illusion
  // of security by storing extra **unused** info
  const sizedFields = {
    username: { min: 1 },
    password: { min: 8, max: 72 }
  };

  const tooSmallField = Object.keys(sizedFields).find(
    field => 'min' in sizedFields[field] &&
      req.body[field].trim().length < sizedFields[field].min
  );
  if (tooSmallField) {
    const min = sizedFields[tooSmallField].min;
    const err = new Error(`Field: '${tooSmallField}' must be at least ${min} characters long`);
    err.status = 422;
    return next(err);
  }

  const tooLargeField = Object.keys(sizedFields).find(
    field => 'max' in sizedFields[field] &&
      req.body[field].trim().length > sizedFields[field].max
  );

  if (tooLargeField) {
    const max = sizedFields[tooLargeField].max;
    const err = new Error(`Field: '${tooLargeField}' must be at most ${max} characters long`);
    err.status = 422;
    return next(err);
  }

  // Username and password were validated as pre-trimmed
  let { username, password, firstname = '', lastname = '' } = req.body;
  firstname = firstname.trim();
  lastname = lastname.trim();

  // Remove explicit hashPassword if using pre-save middleware
  User.hashPassword(password)
    .then(digest => {
      const newUser = {
        username,
        password: digest,
        firstname,
        lastname
      };
      return User.create(newUser);
    })
    .then(result => {
      return res.status(201).location(`/api/users/${result.id}`).json(result);
    })
    .catch(err => {
      if (err.code === 11000) {
        err = new Error('The username already exists');
        err.status = 400;
      }
      next(err);
    });
});


/* ==================================================================================== */
// PROTECTION FOR THE FOLLOWING ENDPOINTS
router.use('/', passport.authenticate('jwt', { session: false, failWithError: true }));

router.get('/profile', (req, res, next) => {
  const username = req.user.username;
  console.log('username: ', username);

  let profile = {
    repos: []
  };

  // get list of repos for username
  gitWrap.getUserRepos(username)
    .then(results => {
      _.forEach(results.data, function (repo) {
        console.log('repo name: ', repo.name);
        profile.repos.push({ name: repo.name });
      });

      // return gitWrap.getUserRepoCommits(username, profile.repos[0].name);

      // TODO: FIGURE OUT HOW TO RETURN FROM PROMISE.ALL WITH A DYNAMIC AMOUNT OF PROMISES*************
      // return Promise.all(profile.repos.map(repo => {
      //   gitWrap.getUserRepoCommits(username, repo.name);
      // }));

      return res.json(profile);
    })
  // .then(result => {
  //   console.log(result);
  //   return res.json(profile);
  // })
  // .catch(next);
})

router.get('/friends', (req, res, next) => {
  const userId = req.user.id;

  User.getFriends(userId, (err, friendships) => {
    res.json(friendships);
  })
})

router.post('/addFriend', (req, res, next) => {
  const userId = req.user.id;
  const friendId = req.body.friendId;

  User.requestFriend(userId, friendId, (results) => {
    !(results instanceof Error) ? res.json('friend request sent') : next(results);
  });
})

router.post('/acceptFriend', (req, res, next) => {
  const userId = req.user.id;
  const friendId = req.body.friendId;

  User.requestFriend(userId, friendId, (results) => {
    !(results instanceof Error) ? res.json('friend request accepted') : next(results);
  });
})

module.exports = router;
