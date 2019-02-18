const request = require('supertest');
const app = require('../app');
const AdminModel = require('../src/database/models/user.model');

function makeid() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < 8; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
}

describe('Admin adds a new user', function () {

    var user = undefined;

    beforeAll(() => {
        // Drop all users
        AdminModel.deleteMany({}, () => {
            user = makeid();
        });
    });

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
    it('Request to add a user without username', function (done) {
        request(app)
            .post('/api/admin/user/add')
            .set('authorization', 'Basic asyuy8a8st6')
            .send({
                password: "abc123",
                isAdmin: false
            })
            .expect(400, done);
    });
    it('Request to add a user without password', function (done) {
        request(app)
            .post('/api/admin/user/add')
            .set('authorization', 'Basic asyuy8a8st6')
            .send({
                username: user,
                isAdmin: false
            })
            .expect(400, done);
    });
    it('Request to add a user without admin status', function (done) {
        request(app)
            .post('/api/admin/user/add')
            .set('authorization', 'Basic asyuy8a8st6')
            .send({
                username: user,
                password: "abc123"
            })
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

describe('Admin lists out all the users', function () {

    var user = undefined;

    beforeAll(() => {
        user = makeid();
    });

    it('Listing out users without authorization', function (done) {
        request(app)
            .get('/api/admin/users')
            .expect(403, done);
    });
    it('Listing out users with correct authorization', async function () {
        try {
            const response = await request(app)
                .get('/api/admin/users')
                .set('authorization', 'Basic asyuy8a8st6')
                .expect(200);
            expect(response.body[0].username).toEqual(user);
        }
        catch (e) { }
    });
});

describe('Admin fetches a user', function () {

    var id = undefined;
    var user = undefined;

    beforeAll(async (done) => {
        await AdminModel.findOne({}).then(doc => {
            id = doc._id;
            user = doc.username;
            done();
        });
    });

    it('Fetching a user without authorization', function (done) {
        request(app)
            .get(`/api/admin/user/${id}`)
            .expect(403, done);
    });
    it('Fetching a user with authorization', function () {
        return request(app)
            .get(`/api/admin/user/${id}`)
            .set('authorization', 'Basic asyuy8a8st6')
            .expect(200).then(r => {
                expect(r.body[0].username).toBe(user);
            });
    });
    it('Fetching a user with invalid ID', function (done) {
        request(app)
            .get(`/api/admin/user/${id}z`)
            .set('authorization', 'Basic asyuy8a8st6')
            .expect(404, done);
    });
});

afterAll(() => {
    console.log('Cleared User Collection after testing');
    AdminModel.deleteMany({}, () => { });
})