const request = require('supertest');
const app = require('../app');
var config = require('../src/auth/config');
var jwt = require('jsonwebtoken');
const ItemModel = require('../src/database/models/item.model');
const UserModel = require('../src/database/models/user.model');

var gToken = undefined;
var gUser = undefined;
var gUserID = undefined;
var gItemID = undefined;
var gCart = undefined;

function generateDescription() {
    var text = "";
    var possible = "ABC DEFGH IJKL MNOPQRST U VWXYZabcde fghijklmnopq rstu vwxy z";
    for (var i = 0; i < 80; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
}

function generateUserName() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < 8; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
}

function generateItemCode() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < 2; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    text += '-';
    for (var i = 0; i < 3; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    text += '-';
    for (var i = 0; i < 3; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text.toUpperCase();
}

beforeAll(async (done) => {
    // Create a new user and get correct credentials to access orders
    gUser = generateUserName();
    let orderingUser = new UserModel({
        username: gUser,
        password: 'falsepassword',
        isAdmin: false
    });
    let testingItem = new ItemModel({
        "productID": "TH-ISI-STS",
        "productTitle": "Test Item",
        "quantity": 999,
        "description": "This is a test item generated for testing",
        "price": 1000.00
    });
    await orderingUser.save().then(doc => {
        gUserID = doc._id;
        gToken = jwt.sign({ id: doc._id }, config.secret, {
            expiresIn: (24 * 60 * 60)
        });
        ItemModel.findOneAndDelete(
            { "productID": "TH-ISI-STS" }).then(res => {
                testingItem.save().then(itm => {
                    gItemID = itm._id;
                    console.debug('Done creating a test user for orders. Proceed with testing');
                    done();
                });
            }).catch(err => {
                testingItem.save().then(itm => {
                    gItemID = itm._id;
                    console.error('Done creating a test user for orders. Proceed with testing');
                    done();
                });
            })
    });
});

describe('Creating a new cart item', function () {

    it('Creates a blank cart without authorization', function (done) {
        request(app)
            .post('/api/order/cart/new')
            .expect(403, done);
    });
    it('Creates a blank cart item without any orders', function (done) {
        request(app)
            .post('/api/order/cart/new')
            .set('x-access-token', gToken)
            .expect(201).then(r => {
                gCart = r.body.id;
                expect(r.body.status).toBe('Cart created succefully');
                done();
            });
    });
    it('Creates a blank cart without valid authorization', function (done) {
        request(app)
            .post('/api/order/cart/new')
            .set('x-access-token', gToken + 'z')
            .expect(500, done);
    });
    it('Creates a blank cart item with the same user', function (done) {
        request(app)
            .post('/api/order/cart/new')
            .set('x-access-token', gToken)
            .expect(200).then(r => {
                expect(r.body.status).toBe('A cart already exists');
                done();
            });
    });
});

describe('Fetch a cart', function () {

    it('Fetches a cart without authorization', function (done) {
        request(app)
            .get(`/api/order/cart/${gCart}`)
            .expect(403, done);
    });
    it('Fetches a cart with invalid authorization', function (done) {
        request(app)
            .get(`/api/order/cart/${gCart}`)
            .set('x-access-token', gToken + 'z')
            .expect(500, done);
    });
    it('Fetches a cart with authorization', function (done) {
        request(app)
            .get(`/api/order/cart/${gCart}`)
            .set('x-access-token', gToken)
            .expect(200).then(r => {
                expect(JSON.stringify(r.body.userID)).toBe(JSON.stringify(gUserID));
                done();
            });
    });
});

describe('Adding new items to database', function () {

    it('Valid user adds an item to database', function (done) {
        request(app)
            .post('/api/order/item/new')
            .set('x-access-token', gToken)
            .send({
                "productID": generateItemCode(),
                "productTitle": generateUserName(),
                "quantity": parseInt(Math.random() * 50),
                "description": generateDescription(),
                "price": parseInt(Math.random() * 1000) / 100
            })
            .expect(200, done);
    });
    it('Valid user adds an item to database with invalid token', function (done) {
        request(app)
            .post('/api/order/item/new')
            .set('x-access-token', gToken + 'z')
            .send({
                "productID": generateItemCode(),
                "productTitle": generateUserName(),
                "quantity": parseInt(Math.random() * 50),
                "description": "Random item description is here",
                "price": parseInt(Math.random() * 1000) / 100
            })
            .expect(500, done);
    });
    it('Valid user adds an item to database without authorization', function (done) {
        request(app)
            .post('/api/order/item/new')
            .send({
                "productID": generateItemCode(),
                "productTitle": generateUserName(),
                "quantity": parseInt(Math.random() * 50),
                "description": "Random item description without token is here",
                "price": parseInt(Math.random() * 1000) / 100
            })
            .expect(403, done);
    });
});

describe('Fetching an item', function () {

    it('Fetch an item from ID', function (done) {
        request(app)
            .get(`/api/order/item/${gItemID}`)
            .set('x-access-token', gToken)
            .expect(200).then(d => {
                expect(d.body.length).toBe(1);
                expect(d.body[0].productID).toBe('TH-ISI-STS');
                done();
            });
    });
    it('Fetch an item from ID without authorization', function (done) {
        request(app)
            .get(`/api/order/item/${gItemID}`)
            .expect(403, done);
    });
    it('Fetch an item from ID with invalid token', function (done) {
        request(app)
            .get(`/api/order/item/${gItemID}`)
            .set('x-access-token', gToken + 'z')
            .expect(500, done);
    });
});
