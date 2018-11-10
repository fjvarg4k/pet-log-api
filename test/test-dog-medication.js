const mongoose = require('mongoose');
const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const jsonwebtoken = require('jsonwebtoken');
const { JWT_SECRET, JWT_EXPIRY, TEST_DATABASE_URL } = require('../config');
const { app, runServer, closeServer } = require('../server');
const { User } = require('../user/model');
const { Dog } = require('../dog/model');
const { DogMedication } = require('../dog-medication/model');
const expect = chai.expect;
chai.use(chaiHttp);

describe('tests for api/medication', function() {
  let testUser, testDog, jwtToken;

  before(function() {
    return runServer(TEST_DATABASE_URL);
  });

  beforeEach(function() {
    testUser = generateUserData();
    testDog = generateDogData();

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

        return Dog.create({
          name: testDog.name,
          gender: testDog.gender
        })
        .catch(err => {
          console.error(err);
          throw new Error(err);
        });
      })
      .then(createdDog => {
        testDog.id = createdDog.id;

        const seedData = [];
        for (let i = 1; i <= 10; i++) {
          const newDogMedication = generateDogMedicationData();
          newDogMedication.dog = createdDog.id;
          seedData.push(newDogMedication);
        }
        return DogMedication.insertMany(seedData)
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
    it('Should create a new dog medication', function() {
      let newDogMedication = generateDogMedicationData();
      return chai.request(app)
        .post(`/api/medication/${testDog.id}`)
        .set('Authorization',  `Bearer ${jwtToken}`)
        .send(newDogMedication)
        .then(res => {
          expect(res).to.have.status(201);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body).to.include.keys('dog', 'name');
        });
    });
  });

  describe('GET', function() {
    it('Should return a dog\'s medication', function() {
      return chai.request(app)
        .get(`/api/medication/${testDog.id}/all`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .then(res => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          expect(res.body).to.have.lengthOf.at.least(1);
        });
    });

    it('Should return a specific dog medication', function() {
      let searchDogMedication;
      return DogMedication.find()
        .then(medications => {
          expect(medications).to.be.a('array');
          expect(medications).to.have.lengthOf.at.least(1);
          searchDogMedication = medications[0];

          return chai.request(app)
            .get(`/api/medication/${searchDogMedication.id}`)
            .set('Authorization', `Bearer ${jwtToken}`)
        })
        .then(res => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body).to.include.keys('name');
        });
    });
  });

  describe('PUT', function() {
    it('Should update a dog medication\'s info', function() {
      let dogMedicationToUpdate;
      const newDogMedicationData = generateDogMedicationData();
      return DogMedication.find()
        .then(medications => {
          expect(medications).to.be.a('array');
          expect(medications).to.have.lengthOf.at.least(1);
          dogMedicationToUpdate = medications[0];

          return chai.request(app)
            .put(`/api/medication/${dogMedicationToUpdate.id}`)
            .set('Authorization', `Bearer ${jwtToken}`)
            .send(newDogMedicationData)
        })
        .then(res => {
          expect(res).to.have.status(204);

          return DogMedication.findById(dogMedicationToUpdate.id);
        })
        .then(medication => {
          expect(medication).to.be.a('object');
        });
    });
  });

  describe('DELETE', function() {
    it('Should delete a specific dog medication', function() {
      let dogMedicationToDelete;
      return DogMedication.find()
        .then(medications => {
          expect(medications).to.be.a('array');
          expect(medications).to.have.lengthOf.at.least(1);
          dogMedicationToDelete = medications[0];

          return chai.request(app)
            .delete(`/api/medication/${dogMedicationToDelete.id}`)
            .set('Authorization', `Bearer ${jwtToken}`)
        })
        .then(res => {
          expect(res).to.have.status(204);

          return DogMedication.findById(dogMedicationToDelete.id);
        })
        .then(medication => {
          expect(medication).to.not.exist;
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

  function generateDogMedicationData() {
    return {
      name: `${faker.commerce.productName()}`
    };
  }
});
