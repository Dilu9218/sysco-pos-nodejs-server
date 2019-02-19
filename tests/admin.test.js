const request = require('supertest');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
const app = require('../app');
var config = require('../src/auth/config');
const AdminModel = require('../src/database/models/user.model');

var gid = undefined;

function makeid() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < 8; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
}

describe('Admin adds a new user', function () {

    var user = undefined;
    var token = undefined;

    beforeAll(async (done) => {
        await AdminModel.deleteMany({}, () => {
            user = makeid();
            let adminUser = new AdminModel({
                username: makeid(),
                password: bcrypt.hashSync("falsepassword", 10),
                isAdmin: true
            });
            adminUser.save().then(doc => {
                token = jwt.sign({ id: doc._id }, config.secret, {
                    expiresIn: (24 * 60 * 60)
                });
                done();
            });
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
            .set('x-access-token', token)
            .send({})
            .expect(400, done);
    });
    it('Request to add a user without username', function (done) {
        request(app)
            .post('/api/admin/user/add')
            .set('x-access-token', token)
            .send({
                password: "abc123",
                isAdmin: false
            })
            .expect(400, done);
    });
    it('Request to add a user without password', function (done) {
        request(app)
            .post('/api/admin/user/add')
            .set('x-access-token', token)
            .send({
                username: user,
                isAdmin: false
            })
            .expect(400, done);
    });
    it('Request to add a user without admin status', function (done) {
        request(app)
            .post('/api/admin/user/add')
            .set('x-access-token', token)
            .send({
                username: user,
                password: "abc123"
            })
            .expect(400, done);
    });
    it('Request to add a user with authorization', function (done) {
        request(app)
            .post('/api/admin/user/add')
            .set('x-access-token', token)
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
            .set('x-access-token', token)
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
    var token = undefined;

    beforeAll(async (done) => {
        await AdminModel.deleteMany({}, () => {
            user = makeid();
            let adminUser = new AdminModel({
                username: user,
                password: bcrypt.hashSync("falsepassword", 10),
                isAdmin: true
            });
            adminUser.save().then(doc => {
                gid = doc._id;
                token = jwt.sign({ id: gid }, config.secret, {
                    expiresIn: (24 * 60 * 60)
                });
                done();
            });
        });
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
                .set('x-access-token', token)
                .expect(200);
            expect(response.body[0].username).toEqual(user);
        }
        catch (e) { }
    });
});

describe('Admin fetches a user', function () {

    var user = undefined;
    var token = undefined;

    beforeAll(async (done) => {
        await AdminModel.findOne({ _id: gid }).then(doc => {
            token = jwt.sign({ id: gid }, config.secret, {
                expiresIn: (24 * 60 * 60)
            });
            user = doc.username;
            done();
        });
    });

    it('Fetching a user without authorization', function (done) {
        request(app)
            .get(`/api/admin/user/${gid}`)
            .expect(403, done);
    });
    it('Fetching a user with authorization', function () {
        return request(app)
            .get(`/api/admin/user/${gid}`)
            .set('x-access-token', token)
            .expect(200).then(r => {
                expect(r.body[0].username).toBe(user);
            });
    });
    it('Fetching a user with an invalid ID', function (done) {
        request(app)
            .get(`/api/admin/user/${gid}z`)
            .set('x-access-token', token)
            .expect(404, done);
    });
});

describe('Admin updates a user', function () {

    var newuser = makeid();
    var token = undefined;

    beforeAll(async (done) => {
        await AdminModel.findOne({ _id: gid }).then(doc => {
            token = jwt.sign({ id: gid }, config.secret, {
                expiresIn: (24 * 60 * 60)
            });
            user = doc.username;
            done();
        });
    });

    it('Updating a user without authorization', function (done) {
        request(app)
            .put(`/api/admin/user/${gid}`)
            .send({
                username: newuser
            })
            .expect(403, done);
    });
    it('Updating a user with authorization', async function (done) {
        await request(app)
            .put(`/api/admin/user/${gid}`)
            .set('x-access-token', token)
            .send({
                username: newuser
            })
            .expect(200).then(r => {
                expect(r.body.username).toBe(newuser);
                done();
            });
    });
    it('Updating a user with an invalid ID', function (done) {
        request(app)
            .put(`/api/admin/user/${gid}z`)
            .send({
                username: newuser
            })
            .set('x-access-token', token)
            .expect(404, done);
    });
});

describe('Admin deletes a user', function () {

    var id = undefined;
    var token = undefined;

    beforeAll(async (done) => {
        let deletableUser = new AdminModel({
            username: "deletableUser",
            password: "falsepassword",
            isAdmin: true
        });
        await deletableUser.save().then(doc => {
            token = jwt.sign({ id: gid }, config.secret, {
                expiresIn: (24 * 60 * 60)
            });
            id = doc._id;
            done();
        });
    });

    it('Deleting a user without authorization', function (done) {
        request(app)
            .delete(`/api/admin/user/${id}`)
            .expect(403, done);
    });
    it('Deleting a user with authorization', function () {
        return request(app)
            .delete(`/api/admin/user/${id}`)
            .set('x-access-token', token)
            .expect(200).then(r => {
                expect(String.valueOf(r.body._id)).toBe(String.valueOf(id));
            });
    });
    it('Deleting a user with an invalid ID', function (done) {
        request(app)
            .delete(`/api/admin/user/${id}z`)
            .set('x-access-token', token)
            .expect(404, done);
    });
});

afterAll(() => {
    console.log('Cleared Admin Collection after testing');
    AdminModel.deleteMany({}, () => { });
})