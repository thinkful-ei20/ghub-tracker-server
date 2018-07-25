'use strict';

const {app} = require('../index');
const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const { TEST_MONGODB_URI } = require('../config'); ('../config');

const User = require('../models/user');

process.env.NODE_ENV = 'test';

const expect = chai.expect;

chai.use(chaiHttp);

describe('Commit2Win - Users', function () {
	const username = 'exampleUser';
	const password = 'examplePass';
	// const fullname = 'Example User';
	const firstname = 'exampleName';
	const lastname = 'exampleSurname';

	before(function () {
		return mongoose.connect('mongodb://@localhost:27017/ghub-tracker-test', { useNewUrlParser: true })
			.then(() => mongoose.connection.db.dropDatabase());
	});

	beforeEach(function () {
		return User.ensureIndexes();
	});

	afterEach(function () {
		return User.remove();
		// return User.collection.drop();
		// return mongoose.connection.db.dropDatabase()
	});

	after(function () {
		return mongoose.disconnect();
	});

	describe('/api/users', function () {
		describe('POST', function () {
			it('Should create a new user with valid password', function () {
				let res;
				return chai
					.request(app)
					.post('/api/users/register')
					.send({ username, password, firstname, lastname })
					// .send({ username, password, fullname })
					.then(_res => {
						res = _res;
						expect(res).to.have.status(201);
						expect(res.body).to.be.an('object');
						expect(res.body).to.have.keys('id', 'username', 'firstname', 'lastname', 'createdAt', 'updatedAt', 'friends');
						// expect(res.body).to.have.keys('id', 'username', 'fullname');
						expect(res.body.id).to.exist;
						expect(res.body.username).to.equal(username);
						expect(res.body.firstname).to.equal(firstname);
						expect(res.body.lastname).to.equal(lastname);
						// expect(res.body.fullname).to.equal(fullname);
						return User.findOne({ username });
					})
					.then(user => {
						expect(user).to.exist;
						expect(user.id).to.equal(res.body.id);
						expect(user.firstname).to.equal(firstname);
						expect(user.lastname).to.equal(lastname);
						// expect(user.fullname).to.equal(fullname);
						return user.validatePassword(password);
					})
					.then(isValid => {
						expect(isValid).to.be.true;
					});
			});

			// it('Should reject users with missing username', function () {
			// 	return chai
			// 		.request(app)
			// 		.post('/api/users')
			// 		// .send({ password, firstname, lastname })
			// 		.send({ password, fullname })
			// 		.catch(err => err.response)
			// 		.then(res => {
			// 			expect(res).to.have.status(422);
			// 			expect(res.body.message).to.equal('Missing \'username\' in request body');
			// 		});
			// });

			// it('Should reject users with missing password', function () {
			// 	return chai
			// 		.request(app)
			// 		.post('/api/users')
			// 		// .send({ username, firstname, lastname })
			// 		.send({ username, fullname })
			// 		.catch(err => err.response)
			// 		.then(res => {
			// 			expect(res).to.have.status(422);
			// 			expect(res.body.message).to.equal('Missing \'password\' in request body');
			// 		});

			// });

			// it('Should reject users with non-string username', function () {
			// 	return chai
			// 		.request(app)
			// 		.post('/api/users')
			// 		// .send({ username: 1234, password, firstname, lastname })
			// 		.send({ username: 1234, password, fullname })
			// 		.catch(err => err.response)
			// 		.then(res => {
			// 			expect(res).to.have.status(422);
			// 			expect(res.body.message).to.equal('Field: \'username\' must be type String');
			// 		});
			// });

			// it('Should reject users with non-string password', function () {
			// 	return chai
			// 		.request(app)
			// 		.post('/api/users')
			// 		.send({ username, password: 1234, firstname, lastname })
			// 		// .send({ username, password: 1234, fullname })
			// 		.catch(err => err.response)
			// 		.then(res => {
			// 			expect(res).to.have.status(422);
			// 			expect(res.body.message).to.equal('Field: \'password\' must be type String');
			// 		});
			// });

			// it('Should reject users with non-trimmed username', function () {
			// 	return chai
			// 		.request(app)
			// 		.post('/api/users')
			// 		.send({ username: ` ${username} `, password, firstname, lastname })
			// 		// .send({ username: ` ${username} `, password, fullname })
			// 		.catch(err => err.response)
			// 		.then(res => {
			// 			expect(res).to.have.status(422);
			// 			expect(res.body.message).to.equal('Field: \'username\' cannot start or end with whitespace');
			// 		});
			// });

			// it('Should reject users with non-trimmed password', function () {
			// 	return chai
			// 		.request(app)
			// 		.post('/api/users')
			// 		.send({ username, password: ` ${password}`, firstname, lastname })
			// 		// .send({ username, password: ` ${password}`, fullname })
			// 		.catch(err => err.response)
			// 		.then(res => {
			// 			expect(res).to.have.status(422);
			// 			expect(res.body.message).to.equal('Field: \'password\' cannot start or end with whitespace');
			// 		});
			// });

			// it('Should reject users with empty username', function () {
			// 	return chai
			// 		.request(app)
			// 		.post('/api/users')
			// 		.send({ username: '', password, firstname, lastname })
			// 		// .send({ username: '', password, fullname })
			// 		.catch(err => err.response)
			// 		.then(res => {
			// 			expect(res).to.have.status(422);
			// 			expect(res.body.message).to.equal('Field: \'username\' must be at least 1 characters long');
			// 		});
			// });

			// it('Should reject users with password less than 8 characters', function () {
			// 	return chai
			// 		.request(app)
			// 		.post('/api/users')
			// 		.send({ username, password: 'asdfghj', firstname, lastname })
			// 		// .send({ username, password: 'asdfghj', fullname })
			// 		.catch(err => err.response)
			// 		.then(res => {
			// 			expect(res).to.have.status(422);
			// 			expect(res.body.message).to.equal('Field: \'password\' must be at least 8 characters long');
			// 		});
			// });

			// it('Should reject users with password greater than 72 characters', function () {
			// 	return chai
			// 		.request(app)
			// 		.post('/api/users')
			// 		.send({ username, password: new Array(73).fill('a').join(''), firstname, lastname })
			// 		// .send({ username, password: new Array(73).fill('a').join(''), fullname })
			// 		.catch(err => err.response)
			// 		.then(res => {
			// 			expect(res).to.have.status(422);
			// 			expect(res.body.message).to.equal('Field: \'password\' must be at most 72 characters long');
			// 		});
			// });

			// it('Should reject users with duplicate username', function () {
			// 	return User
			// 		.create({
			// 			username,
			// 			password,
			// 			firstname,
			// 			lastname
			// 			// fullname
			// 		})
			// 		.then(() => {
			// 			return chai
			// 				.request(app)
			// 				.post('/api/users')
			// 				.send({ username, password, firstname, lastname });
			// 			// .send({ username, password, fullname });
			// 		})
			// 		.catch(err => err.response)
			// 		.then(res => {
			// 			expect(res).to.have.status(400);
			// 			expect(res.body.message).to.equal('The username already exists');
			// 		});
			// });
		});
	});
});