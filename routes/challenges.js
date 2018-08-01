const User = require('../models/user')
const router = require('express').Router()
const passport = require('passport')

// PROTECTION FOR THE FOLLOWING ENDPOINTS
router.use(
  '/',
  passport.authenticate('jwt', {
    session: false,
    failWithError: true,
  }),
)

// Get all challenges for user
// Has option status query for getting by status
router.get('/', (req, res, next) => {
  const userId = req.user.id
  const status = req.query.status

  if (status) {
    User.getOfStatus(userId, status.toLowerCase())
      .then(results => {
        results = results.map(async val => {
          const newVal = { ...val.toObject() }
          let user
          if (val.sender != userId + '') {
            return User.findById(val.sender)
              .then(doc => {
                user = doc
                return Promise.resolve()
              })
              .then(() => {
                newVal.senderUsername = user.username
                return Promise.resolve()
              })
              .then(() => {
                newVal.receiverUsername = req.user.username
                return Promise.resolve()
              })
              .then(() => Promise.resolve(newVal))
          } else {
            return User.findById(val.receiver)
              .then(doc => {
                user = doc
                return Promise.resolve()
              })
              .then(() => {
                newVal.senderUsername = req.user.username
                return Promise.resolve()
              })
              .then(() => {
                newVal.receiverUsername = user.username
                return Promise.resolve()
              })
              .then(() => Promise.resolve(newVal))
          }
        })
        Promise.all(results).then(stuff => res.json(stuff))
      })
      .catch(next)
  } else {
    User.getRequests(userId)
      .then(results => {
        results = results.map(async val => {
          const newVal = { ...val.toObject() }
          let user
          if (val.sender != userId + '') {
            return User.findById(val.sender)
              .then(doc => {
                user = doc
                return Promise.resolve()
              })
              .then(() => {
                newVal.senderUsername = user.username
                return Promise.resolve()
              })
              .then(() => {
                newVal.receiverUsername = req.user.username
                return Promise.resolve()
              })
              .then(() => Promise.resolve(newVal))
          } else {
            return User.findById(val.receiver)
              .then(doc => {
                user = doc
                return Promise.resolve()
              })
              .then(() => {
                newVal.senderUsername = req.user.username
                return Promise.resolve()
              })
              .then(() => {
                newVal.receiverUsername = user.username
                return Promise.resolve()
              })
              .then(() => Promise.resolve(newVal))
          }
        })
        Promise.all(results).then(stuff => res.json(stuff))
      })
      .catch(next)
  }
})

// Send challenge to user with receivingUserId
router.get('/send/:receivingUserId', (req, res, next) => {
  const receivingUserId = req.params.receivingUserId
  const sendingUserId = req.user.id

  User.sendRequest(sendingUserId, receivingUserId)
    .then(() => res.status(204).end())
    .catch(next)
})

// Accept challenge from user with sendingUserId
router.get('/accept/:sendingUserId', (req, res, next) => {
  const receivingUserId = req.user.id
  const sendingUserId = req.params.sendingUserId

  User.acceptRequest(receivingUserId, sendingUserId)
    .then(() => res.status(204).end())
    .catch(next)
})

// Deny challenge from user with sendingUserId
router.get('/deny/:sendingUserId', (req, res, next) => {
  const receivingUserId = req.user.id
  const sendingUserId = req.params.sendingUserId

  User.denyRequest(receivingUserId, sendingUserId)
    .then(() => res.status(204).end())
    .catch(next)
})

// Delete challenge from logged in user to receivingUser
router.get('/delete/:receivingUserId', (req, res, next) => {
  const receivingUserId = req.params.receivingUserId
  const sendingUserId = req.user.id

  User.deleteRequest(sendingUserId, receivingUserId)
    .then(() => res.status(204).end())
    .catch(next)
})

module.exports = router
