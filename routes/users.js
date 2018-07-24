'use strict';

const express = require('express');
const passport = require('passport');
const _ = require('lodash');

const User = require('../models/user');

const router = express.Router();

const octokit = require('@octokit/rest')({
  debug: true
})

// basic
octokit.authenticate({
  type: 'basic',
  username: 'jeffmahmoudi@gmail.com',
  password: 'Persican#1'
})

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
    username: {
      min: 1
    },
    password: {
      min: 8,
      max: 72
    }
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
  let {
    username,
    password,
    firstname = '',
    lastname = ''
  } = req.body;
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

router.get('/profile/:username', (req, res, next) => {
  const username = req.params.username;

  User.findOne({ username })
    .then(user => res.json(user))
    .catch(next);
})

// PROTECTION FOR THE FOLLOWING ENDPOINTS
router.use('/', passport.authenticate('jwt', {
  session: false,
  failWithError: true
}));

router.get('/dashboard', (req, res, next) => {
  const user = req.user

  User.getFriends(user.id, (err, friends) => {
    if (err) next(err)
    res.json(friends)
  })
})

router.get('/addFriend/:receivingUserId', (req, res, next) => {
  const sendingUser = req.user.id;
  const receivingUser = req.params.receivingUserId;

  User.requestFriend(sendingUser, receivingUser, (results) => {
    !(results instanceof Error) ? res.json('friend request sent') : next(results);
  });
});

router.get('/acceptFriend/:sendingUserId', (req, res, next) => {
  const receivingUser = req.user.id;
  const sendingUser = req.params.sendingUserId;

  User.requestFriend(receivingUser, sendingUser, (results) => {
    !(results instanceof Error) ? res.json('friend request accepted') : next(results);
  });
});

router.get('/profile', (req, res, next) => {
  const username = req.user.username;

  let profile = {
    repos: [],
  };

  // get list of repos for username
  octokit.repos.getForUser({ username })
    .then(results => {
      // hydrate profile.repos
      _.forEach(results.data, repo => {
        profile.repos.push({
          name: repo.name,
          // commits: Math.floor(Math.random() * 201), // TEMP
        });
      });
      return Promise.all(profile.repos.map(repo => {
        return octokit.repos.getCommits({ owner: username, repo: repo.name })
          .then(({ data }) => {
            repo.commits = data.length;
            // repo.data = data;
            return repo;
          });
      }));
    })
    .then(promises => {
      console.log(promises);
      return res.json(profile);
    });
});

module.exports = router;