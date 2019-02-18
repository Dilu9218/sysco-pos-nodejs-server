const request = require('supertest');
const app = require('../app');

var user = undefined;

function makeid() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < 8; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
}

beforeAll(() => {
    user = makeid();
    console.log(`Username --> ${user}`);
});

describe('Admin adds a new user', function () {
    it('Request to add a user without authorization', function (done) {
        request(app)
            .post('/api/admin/user/add')
            .send({
                username: makeid(),
                password: "abc123",
                isAdmin: false
            })
            .expect(403, done);
    });
    it('Request to add a user without any data', function (done) {
        request(app)
            .post('/api/admin/user/add')
            .set('authorization', 'Basic asyuy8a8st6')
            .send({})
            .expect(400, done);
    });
    it('Request to add a user with authorization', function (done) {
        request(app)
            .post('/api/admin/user/add')
            .set('authorization', 'Basic asyuy8a8st6')
            .send({
                username: user,
                password: "abc123",
                isAdmin: false
            })
            .expect(200, done);
    });
    it('Request to add the same user with authorization', function (done) {
        request(app)
            .post('/api/admin/user/add')
            .set('authorization', 'Basic asyuy8a8st6')
            .send({
                username: user,
                password: "abc123",
                isAdmin: false
            })
            .expect(409, done);
    });
});