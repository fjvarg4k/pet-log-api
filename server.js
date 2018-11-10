const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const cors = require('cors');
const passport = require('passport');

const { PORT, DATABASE_URL, CLIENT_ORIGIN } = require('./config');
const { userRouter } = require('./user/router');
const { authRouter } = require('./auth/router');
const { dogRouter } = require('./dog/router');
// const { dogMedicationRouter } = require('./dog-medication/router');
const { localStrategy, jwtStrategy } = require('./auth/strategy');

let server;
const app = express();

// Middleware
app.use(morgan('common'));
app.use(express.json());
// app.use(
//   cors({
//     origin: CLIENT_ORIGIN
//   })
// );

// Used when authenticating user login
passport.use(localStrategy);
passport.use(jwtStrategy);

// Router
app.use('/api/user', userRouter);
app.use('/api/auth', authRouter);
app.use('/api/dog', dogRouter);
// app.use('/api/medication', dogMedicationRouter);

// app.get('/api/*', (req, res) => {
//    res.json({ok: true});
//  });

app.use('*', (req, res) => {
  return res.status(404).json({ message: 'Not Found' });
});

function runServer(databaseURL, port = PORT) {
  return new Promise((resolve, reject) => {
    mongoose.connect(databaseURL, {useNewUrlParser: true }, err => {
      if (err) {
        return reject(err);
      }
      server = app.listen(port, () => {
        console.log(`Your app is listening on port ${port}`);
        resolve();
      })
      .on('error', err => {
        mongoose.disconnect();
        reject(err);
      });
    });
  });
}

function closeServer() {
  return mongoose.disconnect().then(() => {
    return new Promise((resolve, reject) => {
      console.log('Closing server');
      server.close(err => {
        if (err) {
          return reject(err)
        }
        resolve();
      });
    });
  });
}

if (require.main === module) {
  runServer(DATABASE_URL).catch(err => console.error(err));
}

module.exports = { app, runServer, closeServer };
