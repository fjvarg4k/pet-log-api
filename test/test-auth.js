const mongoose = require('mongoose');
const chai = require('chai');
const chaiHttp = require('chai-http');
const jsonwebtoken = require('jsonwebtoken');
const faker = require('faker');
const { app, runServer, closeServer } = require('../server');
const { User } = require('../user/model');
const { TEST_DATABASE_URL, JWT_SECRET, JWT_EXPIRY } = require('../config');
const expect = chai.expect;
chai.use(chaiHttp);

describe('tests for /api/auth', function() {
  let testUser, jwtToken;

  before(function() {
    return runServer(TEST_DATABASE_URL);
  });

  beforeEach(function() {
    testUser = generateUserData();

    return User.hashPassword(testUser.password).then(hashedPassword => {
      return User.create({
        firstName: testUser.firstName,
        lastName: testUser.lastName,
        username: testUser.username,
        password: hashedPassword
      })
      .then(createdUser => {
        testUser.id = createdUser.id;

        jwtToken = jsonwebtoken.sign(
          {
            user: {
              id: testUser.id,
              firstName: testUser.firstName,
              lastName: testUser.lastName,
              username: testUser.username
            }
          },
          JWT_SECRET,
          {
            algorithm: 'HS256',
            expiresIn: JWT_EXPIRY,
            subject: testUser.username
          }
        );
      })
      .catch(err => {
        console.error(err);
      })
    });
  });

  afterEach(function() {
    return new Promise((resolve, reject) => {
      mongoose.connection.dropDatabase()
        .then(res => {
          resolve(res);
        })
        .catch(err => {
          console.error(err);
          reject(err);
        });
    });
  });

  after(function() {
    return closeServer();
  });

  describe('POST', function() {
    it('should login and return a valid json web token', function() {
      return chai.request(app)
        .post('/api/auth/login')
        .send({
          username: testUser.username,
          password: testUser.password
        })
        .then(res => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.an('object');
          const payload = jsonwebtoken.verify(res.body.jwtToken, JWT_SECRET, {
            algorithm: ['HS256']
          });
          expect(payload.user).to.be.an('object');
        });
    });

    it('should return a valid auth token with a newer expiry date', function() {
      const firstJwtPayload = jsonwebtoken.verify(jwtToken, JWT_SECRET, {
        algorithm: ['HS256']
      });
      return chai.request(app)
        .post('/api/auth/refresh')
        .set('Authorization', `Bearer ${jwtToken}`)
        .then(res => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.an('object');

          const newJwtPayload = jsonwebtoken.verify(res.body.jwtToken, JWT_SECRET, {
            algorithm: ['HS256']
          });
          expect(newJwtPayload.user).to.be.an('object');
        })
    });
  });

  // Generates a User object
  function generateUserData() {
    return {
      firstName: `${faker.name.firstName()}`,
      lastName: `${faker.name.lastName()}`,
      username: `${faker.internet.userName()}`,
      password: `${faker.internet.password()}`
    };
  }
});
