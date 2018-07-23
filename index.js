'use strict';

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const passport = require('passport');
const _ = require('lodash');

const { PORT, CLIENT_ORIGIN } = require('./config');
const { dbConnect, dbGet } = require('./db-mongoose');

const localStrategy = require('./passport/local');
const jwtStrategy = require('./passport/jwt');

const leaderBoardRouter = require('./routes/leaderboard');
const usersRouter = require('./routes/users');
const authRouter = require('./routes/auth');

const app = express();

app.use(
  morgan(process.env.NODE_ENV === 'production' ? 'common' : 'dev', {
    skip: (req, res) => process.env.NODE_ENV === 'test'
  })
);

app.use(
  cors({
    origin: CLIENT_ORIGIN
  })
);

app.use(express.json());

passport.use(localStrategy);
passport.use(jwtStrategy);

app.use('/api/leaderboard', leaderBoardRouter);
app.use('/api/users', usersRouter);
app.use('/api', authRouter);

app.get('/', (req, res) => {
  res.send(`Hello ${req.hostname}`);
})

app.use(function (req, res, next) {
  const err = new Error('Not Found *********');
  err.status = 404;
  next(err);
});

function runServer(port = PORT) {
  const server = app
    .listen(port, () => {
      console.info(`App listening on port ${server.address().port}`);
    })
    .on('error', err => {
      console.error('Express failed to start');
      console.error(err);
    });
}

if (require.main === module) {
  dbConnect();
  runServer();
}

console.log(`DB URI: ${dbGet().connection.host}:${dbGet().connection.port}`);

module.exports = { app };
