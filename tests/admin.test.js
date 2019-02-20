const request = require('supertest');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
const app = require('../app');
var config = require('../src/auth/config');
const AdminModel = require('../src/database/models/user.model');

var gid = undefined;
var gUser = undefined;
var gAdminToken = undefined;
var gUserToken = undefined;

function generateUserName() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < 8; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

/** Before the test begins, create three users;
 * User - Doesn't have any login credentials, just for testing
 * AdminUser - Has admin privileges
 * NormalUser - Doesn't have such privileges
 * 
 * Apart from these three, another user will be created as a result of a test
 */
beforeAll(async (done) => {
    // First clear the whole user database
    await AdminModel.deleteMany({}, () => {
        // Create a user ID for testing operations on a typical user
        gUser = generateUserName();
        let testUser = new AdminModel({
            username: gUser,
            password: bcrypt.hashSync("falsepassword0", 10),
            isAdmin: false
        })
        let adminUser = new AdminModel({
            username: generateUserName(),
            password: bcrypt.hashSync("falsepassword1", 10),
            isAdmin: true
        });
        let normalUser = new AdminModel({
            username: generateUserName(),
            password: bcrypt.hashSync("falsepassword2", 10),
            isAdmin: false
        });
        adminUser.save().then(docAdmin => {
            gAdminToken = jwt.sign({ id: docAdmin._id }, config.secret, {
                expiresIn: (24 * 60 * 60)
            });
            normalUser.save().then(docUser => {
                gUserToken = jwt.sign({ id: docUser._id }, config.secret, {
                    expiresIn: (24 * 60 * 60)
                });
                testUser.save().then(docTest => {
                    console.debug(`Admin is ${docAdmin.username}\nNormal user is ${docUser.username}\nTest user is ${docTest.username}`);
                    // Global user ID needed for testing would be this user's
                    gid = docTest._id;
                    console.debug('Done creating all test users. Proceed with testing');
                    done();
                });
            });
        });
    });
});

describe('Admin adds a new user', function () {

    var user = undefined;

    beforeAll(() => {
        user = generateUserName();
        console.debug(`User in testing will be created as ${user}`);
    });

    it('Request to add a user without authorization', function (done) {
        request(app)
            .post('/api/admin/user/add')
            .send({
                username: generateUserName(),
                password: "abc123",
                isAdmin: false
            })
            .expect(403, done);
    });
    it('Request to add a user without any data', function (done) {
        request(app)
            .post('/api/admin/user/add')
            .set('x-access-token', gAdminToken)
            .send({})
            .expect(400, done);
    });
    it('Request to add a user without username', function (done) {
        request(app)
            .post('/api/admin/user/add')
            .set('x-access-token', gAdminToken)
            .send({
                password: "abc123",
                isAdmin: false
            })
            .expect(400, done);
    });
    it('Request to add a user without password', function (done) {
        request(app)
            .post('/api/admin/user/add')
            .set('x-access-token', gAdminToken)
            .send({
                username: user,
                isAdmin: false
            })
            .expect(400, done);
    });
    it('Request to add a user without admin status', function (done) {
        request(app)
            .post('/api/admin/user/add')
            .set('x-access-token', gAdminToken)
            .send({
                username: user,
                password: "abc123"
            })
            .expect(400, done);
    });
    it('Request to add a user with authorization', function (done) {
        request(app)
            .post('/api/admin/user/add')
            .set('x-access-token', gAdminToken)
            .send({
                username: user,
                password: "abc123",
                isAdmin: false
            })
            .expect(200, done);
    });
    it('Request to add a user with invalid role authorization', function (done) {
        request(app)
            .post('/api/admin/user/add')
            .set('x-access-token', gUserToken)
            .send({
                username: user,
                password: "abc123",
                isAdmin: false
            })
            .expect(403, done);
    });
    it('Request to add the same user with authorization', function (done) {
        request(app)
            .post('/api/admin/user/add')
            .set('x-access-token', gAdminToken)
            .send({
                username: user,
                password: "abc123",
                isAdmin: false
            })
            .expect(409, done);
    });
});

describe('Admin lists out all the users', function () {

    it('Listing out users without authorization', function (done) {
        request(app)
            .get('/api/admin/users')
            .expect(403, done);
    });
    it('Listing out users with invalid token', function (done) {
        request(app)
            .get('/api/admin/users')
            .set('x-access-token', gUserToken + 'z')
            .expect(500, done);
    });
    it('Listing out users with invalid role authorization', function (done) {
        request(app)
            .get('/api/admin/users')
            .set('x-access-token', gUserToken)
            .expect(403, done);
    });
    it('Listing out users with correct authorization', async function (done) {
        await request(app)
            .get('/api/admin/users')
            .set('x-access-token', gAdminToken)
            .expect(200).then(r => {
                expect(r.body.length).toBeGreaterThanOrEqual(4);
                expect(r.body[2].username).toBe(gUser);
                done();
            });
    });
});

describe('Admin fetches a user', function () {

    it('Fetching a user without authorization', function (done) {
        request(app)
            .get(`/api/admin/user/${gid}`)
            .expect(403, done);
    });
    it('Fetching a user with authorization', async function () {
        const r = await request(app)
            .get(`/api/admin/user/${gid}`)
            .set('x-access-token', gAdminToken)
            .expect(200);
        expect(r.body[0].username).toBe(gUser);
    });
    it('Fetching a user with invalid role authorization', function (done) {
        request(app)
            .get(`/api/admin/user/${gid}`)
            .set('x-access-token', gUserToken)
            .expect(403, done);
    });
    it('Fetching a user with an invalid ID', function (done) {
        request(app)
            .get(`/api/admin/user/${gid}z`)
            .set('x-access-token', gAdminToken)
            .expect(404, done);
    });
});

describe('Admin updates a user', function () {

    var newuser = undefined;

    beforeAll(() => {
        newuser = generateUserName();
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
            .set('x-access-token', gAdminToken)
            .send({
                username: newuser
            })
            .expect(200).then(r => {
                expect(r.body.username).toBe(newuser);
                // Updating current global username as it changed after this test
                gUser = newuser;
                done();
            });
    });
    it('Updating a user with invalid role authorization', function (done) {
        request(app)
            .put(`/api/admin/user/${gid}`)
            .set('x-access-token', gUserToken)
            .send({
                username: newuser
            })
            .expect(403, done);
    });
    it('Updating a user with an invalid ID', function (done) {
        request(app)
            .put(`/api/admin/user/${gid}z`)
            .send({
                username: newuser
            })
            .set('x-access-token', gAdminToken)
            .expect(404, done);
    });
});

describe('Admin deletes a user', function () {

    var id = undefined;

    beforeAll(async (done) => {
        let deletableUser = new AdminModel({
            username: "deletableUser",
            password: "falsepassword",
            isAdmin: true
        });
        await deletableUser.save().then(doc => {
            id = doc._id;
            done();
        });
    });

    it('Deleting a user without authorization', function (done) {
        request(app)
            .delete(`/api/admin/user/${id}`)
            .expect(403, done);
    });
    it('Deleting a user with invalid role authorization', function (done) {
        request(app)
            .delete(`/api/admin/user/${id}`)
            .set('x-access-token', gUserToken)
            .expect(403, done);
    });
    it('Deleting a user with authorization', function () {
        return request(app)
            .delete(`/api/admin/user/${id}`)
            .set('x-access-token', gAdminToken)
            .expect(200).then(r => {
                expect(String.valueOf(r.body._id)).toBe(String.valueOf(id));
            });
    });
    it('Deleting a user with an invalid ID', function (done) {
        request(app)
            .delete(`/api/admin/user/${id}z`)
            .set('x-access-token', gAdminToken)
            .expect(404, done);
    });
});

afterAll(() => {
    console.log('Cleared Admin Collection after testing');
    AdminModel.deleteMany({}, () => { });
})