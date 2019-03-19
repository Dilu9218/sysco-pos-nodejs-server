const request = require('supertest');
const app = require('../app');
var jwt = require('jsonwebtoken');
const config = require('../src/auth/config');
const UserModel = require('../src/database/models/user.model');
var ValidateToken = require('../src/auth/verifytoken');

var ltoken = undefined;
var gUser = undefined;
var password = 'falsepassword';

function generateUserName() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < 8; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
}

beforeAll(() => {
    gUser = generateUserName();
});

describe('Creating a new User', function () {

    it('Register new user without any content', function (done) {
        request(app)
            .post('/api/user/register')
            .expect(406, done);
    });
    it('Register user without password', function (done) {
        request(app)
            .post('/api/user/register')
            .send({
                username: gUser,
                isAdmin: false
            })
            .expect(406, done);
    });
    it('Register user without username', function (done) {
        request(app)
            .post('/api/user/register')
            .send({
                password,
                isAdmin: false
            })
            .expect(406, done);
    });
    it('Register user with valid data', (done) => {
        request(app)
            .post('/api/user/register')
            .send({
                username: gUser,
                password,
                isAdmin: false
            })
            .expect(200, done);
    });
    it('Register user with same username', function (done) {
        request(app)
            .post('/api/user/register')
            .send({
                username: gUser,
                password,
                isAdmin: false
            })
            .expect(409, done);
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
                password,
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

describe('Find a non existing user', () => {
    it('Logs in with an invalid username', function (done) {
        var token = jwt.sign({ id: 'invaliduser' }, config.secret, {
            expiresIn: (30 * 24 * 60 * 60)
        });
        var res = {
            status(n) { return { send(N) { return n + N; } } },
        };
        var req = {};
        req.headers = { 'x-access-token': token };
        var result = ValidateToken(req, res, () => { });
        expect(result).toBe(undefined);
        done();
    });
});

afterAll(async (done) => {
    await UserModel.findOneAndDelete({ username: gUser }).then(res => {
        console.log('Cleaned up resources created while testing user end points');
        done();
    });
});