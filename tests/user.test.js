const request = require('supertest');
const app = require('../app');
const UserModel = require('../src/database/models/user.model');

var ltoken = undefined;
var gUser = undefined;
var password = 'falsepassword';

function makeid() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < 8; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
}

describe('Creating a new User', function () {

    beforeAll(() => {
        gUser = makeid();
    });

    it('Regiter user with valid data', (done) => {
        request(app)
            .post('/api/user/register')
            .send({
                username: gUser,
                password,
                isAdmin: false
            })
            .expect(200, done);
    });
    it('Register new user without any content', function (done) {
        request(app)
            .post('/api/user/register')
            .expect(406, done);
    });
    it('Regiter user without password', function (done) {
        request(app)
            .post('/api/user/register')
            .send({
                username: gUser,
                isAdmin: false
            })
            .expect(406, done);
    });
    it('Regiter user without username', function (done) {
        request(app)
            .post('/api/user/register')
            .send({
                password,
                isAdmin: false
            })
            .expect(406, done);
    });
    it('Regiter user with same username', function (done) {
        request(app)
            .post('/api/user/register')
            .send({
                username: gUser,
                password,
                isAdmin: false
            })
            .expect(200, done); // 406
    });
});

describe('User tries to log in', function () {
    it('Logs in with wrong password', function (done) {
        request(app)
            .post('/api/user/login')
            .send({
                username: gUser,
                password: 'wrongpassword'
            })
            .expect(401, done);
    });
    it('Logs in with correct password', function () {
        request(app)
            .post('/api/user/login')
            .send({
                username: gUser,
                password
            })
            .expect(200).then(r => {
                ltoken = r.body.token;
            });
    });
    it('Logs in with no password', function (done) {
        request(app)
            .post('/api/user/login')
            .send({
                username: gUser
            })
            .expect(406, done);
    });
    it('Logs in with no username', function (done) {
        request(app)
            .post('/api/user/login')
            .send({
                password
            })
            .expect(406, done);
    });
    it('Logs in with a different username', function (done) {
        request(app)
            .post('/api/user/login')
            .send({
                username: 'differentuser',
                password
            })
            .expect(404, done);
    });
});

afterAll(async (done) => {
    // Drop all users
    await UserModel.deleteMany({}, () => {
        console.log('Cleared User Collection after testing')
        done();
    });
});