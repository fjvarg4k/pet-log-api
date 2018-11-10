const mongoose = require('mongoose');
const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const jsonwebtoken = require('jsonwebtoken');
const { JWT_SECRET, JWT_EXPIRY, TEST_DATABASE_URL } = require('../config');
const { app, runServer, closeServer } = require('../server');
const { User } = require('../user/model');
const { Dog } = require('../dog/model');
const expect = chai.expect;
chai.use(chaiHttp);

describe('tests for /api/dog', function() {
  let testUser, jwtToken;

  before(function() {
    return runServer(TEST_DATABASE_URL);
  });

  beforeEach(function() {
    testUser = generateUserData();

    return User.hashPassword(testUser.password)
      .then(hashedPassword => {
        return User.create({
          firstName: testUser.firstName,
          lastName: testUser.lastName,
          username: testUser.username,
          password: hashedPassword
        })
        .catch(err => {
          console.error(err);
          throw new Error(err);
        });
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

        const seedData = [];
        for (let i = 1; i <= 10; i++) {
          const newDog = generateDogData();
          newDog.user = createdUser.id;
          seedData.push(newDog);
        }
        return Dog.insertMany(seedData)
          .catch(err => {
            console.error(err);
            throw new Error(err);
          });
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
    it('Should create a new dog', function() {
      let newDog = generateDogData();
      return chai.request(app)
        .post('/api/dog')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send(newDog)
        .then(res => {
          expect(res).to.have.status(201);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body).to.include.keys('user', 'name', 'gender')
        });
    });
  });

  describe('GET', function() {
    it('Should return a user\'s dogs', function() {
      return chai.request(app)
        .get('/api/dog')
        .set('Authorization', `Bearer ${jwtToken}`)
        .then(res => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          expect(res.body).to.have.lengthOf.at.least(1);
          const dog = res.body[0];
          expect(dog).to.include.keys('user', 'name', 'gender')
          expect(dog.user).to.be.a('object');
          expect(dog.user).to.include.keys('firstName', 'lastName', 'username');
        });
    });

    it('Should return a specific dog', function() {
      let searchDog;
      return Dog.find()
        .then(dogs => {
          expect(dogs).to.be.a('array');
          expect(dogs).to.have.lengthOf.at.least(1);
          searchDog = dogs[0];

          return chai.request(app)
            .get(`/api/dog/${searchDog.id}`)
            .set('Authorization', `Bearer ${jwtToken}`)
        })
        .then(res => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body).to.include.keys('user', 'name', 'gender')
        });
    });
  });

  describe('PUT', function() {
    it('Should update a dog\'s info', function() {
      let dogToUpdate;
      const newDogData = generateDogData();
      return Dog.find()
        .then(dogs => {
          expect(dogs).to.be.a('array');
          expect(dogs).to.have.lengthOf.at.least(1);
          dogToUpdate = dogs[0];

          return chai.request(app)
            .put(`/api/dog/${dogToUpdate.id}`)
            .set('Authorization', `Bearer ${jwtToken}`)
            .send(newDogData)
        })
        .then(res => {
          expect(res).to.have.status(204);

          return Dog.findById(dogToUpdate.id);
        })
        .then(dog => {
          expect(dog).to.be.a('object')
        });
    });
  });

  describe('DELETE', function() {
    it('Should delete a specific dog', function() {
      let dogToDelete;
      return Dog.find()
        .then(dogs => {
          expect(dogs).to.be.a('array');
          expect(dogs).to.have.lengthOf.at.least(1);
          dogToDelete = dogs[0];

          return chai.request(app)
            .delete(`/api/dog/${dogToDelete.id}`)
            .set('Authorization', `Bearer ${jwtToken}`)
        })
        .then(res => {
          expect(res).to.have.status(204);

          return Dog.findById(dogToDelete.id);
        })
        .then(dog => {
          expect(dog).to.not.exist;
        });
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

  // Generates a Dog object
  function generateDogData() {
    let genderSelect = ['male', 'female'];

    return {
      name: `${faker.name.firstName()}`,
      gender: genderSelect[Math.floor(Math.random() * genderSelect.length)],
    };
  }
});
