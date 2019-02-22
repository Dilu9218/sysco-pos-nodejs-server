const request = require('supertest');
const app = require('../app');
var config = require('../src/auth/config');
var jwt = require('jsonwebtoken');
const ItemModel = require('../src/database/models/item.model');
const OrderModel = require('../src/database/models/order.model');
const UserModel = require('../src/database/models/user.model');

var gToken = undefined;
var gUser = undefined;
var gUserID = undefined;
var gItemID = undefined;
var gCart = undefined;
var gOrderID = undefined;
var gItemList = undefined;
var lOrderID = undefined;

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
            { productID: "TH-ISI-STS" }).then(res => {
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
    it('Fetches a cart which is not in database', function (done) {
        request(app)
            .get(`/api/order/cart/${gCart}z`)
            .set('x-access-token', gToken)
            .expect(404, done);
    });
});

describe('Deletes a cart', function () {

    it('Deletes a cart without authorization', function (done) {
        request(app)
            .delete(`/api/order/cart/${gCart}`)
            .expect(403, done);
    });
    it('Deletes a cart with invalid authorization', function (done) {
        request(app)
            .delete(`/api/order/cart/${gCart}`)
            .set('x-access-token', gToken + 'z')
            .expect(500, done);
    });
    it('Deletes a cart with authorization', function (done) {
        request(app)
            .delete(`/api/order/cart/${gCart}`)
            .set('x-access-token', gToken)
            .expect(200).then(r => {
                expect(JSON.stringify(r.body.userID)).toBe(JSON.stringify(gUserID));
                done();
            });
    });
});

describe('Adding new items to database', function () {

    it('Adds an item with proper authorization', function (done) {
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
    it('Adds an item with invalid token', function (done) {
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
    it('Adds an item without authorization', function (done) {
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
                expect(d.body.productID).toBe('TH-ISI-STS');
                done();
            });
    });
    it('Fetch an item which is not in database', function (done) {
        request(app)
            .get(`/api/order/item/${gItemID}z`)
            .set('x-access-token', gToken)
            .expect(404, done);
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

describe('Updating an item', function () {

    it('Update an item from ID', function (done) {
        request(app)
            .put(`/api/order/item/${gItemID}`)
            .set('x-access-token', gToken)
            .send({
                quantity: 500
            })
            .expect(200).then(d => {
                expect(d.body.quantity).toBe(500);
                expect(d.body.price).toBe(1000);
                done();
            });
    });
    it('Update an item which is not in database', function (done) {
        request(app)
            .put(`/api/order/item/${gItemID}z`)
            .set('x-access-token', gToken)
            .expect(404, done);
    });
    it('Update an item from ID without authorization', function (done) {
        request(app)
            .put(`/api/order/item/${gItemID}`)
            .expect(403, done);
    });
    it('Update an item from ID with invalid token', function (done) {
        request(app)
            .put(`/api/order/item/${gItemID}`)
            .set('x-access-token', gToken + 'z')
            .expect(500, done);
    });
});

describe('Fetching the item list', function () {

    it('Fetch item list with valid credentials', function (done) {
        request(app)
            .get('/api/order/items')
            .set('x-access-token', gToken)
            .expect(200).then(d => {
                gItemList = d;
                expect(d.body.length).toBeGreaterThan(1);
                done();
            });
    });
    it('Fetch item list without authorization', function (done) {
        request(app)
            .get('/api/order/items')
            .expect(403, done);
    });
    it('Fetch item list with an invalid token', function (done) {
        request(app)
            .get('/api/order/items')
            .set('x-access-token', gToken + 'z')
            .expect(500, done);
    });
});

describe('Creates an order', function () {

    it('Creates a blank order with proper authorization', function (done) {
        request(app)
            .post('/api/order/order/new')
            .set('x-access-token', gToken)
            .expect(200).then(r => {
                gOrderID = r.body.id;
                done();
            });
    });
    it('Creates an order without authorization', function (done) {
        request(app)
            .post('/api/order/order/new')
            .expect(403, done);
    });
    it('Creates an order with invalid token', function (done) {
        request(app)
            .post('/api/order/order/new')
            .set('x-access-token', gToken + 'z')
            .expect(500, done);
    });
});

describe('Fetches an order', function () {

    it('Fetches an order with proper authorization', function (done) {
        request(app)
            .get(`/api/order/order/${gOrderID}`)
            .set('x-access-token', gToken)
            .expect(200).then(r => {
                expect(JSON.stringify(r.body.cartID)).toBe(JSON.stringify(gUserID));
                done();
            });
    });
    it('Fetches an order which is not in database', function (done) {
        request(app)
            .get(`/api/order/order/${gOrderID}z`)
            .set('x-access-token', gToken)
            .expect(404, done);
    });
    it('Fetches an order without authorization', function (done) {
        request(app)
            .get(`/api/order/order/${gOrderID}`)
            .expect(403, done);
    });
    it('Fetches an order with invalid token', function (done) {
        request(app)
            .get(`/api/order/order/${gOrderID}`)
            .set('x-access-token', gToken + 'z')
            .expect(500, done);
    });

    afterAll(async (done) => {
        OrderModel.deleteMany({ cartID: gUserID }).then(res => {
            done();
        });
    });
});

describe('Updates an order', function () {

    beforeAll(async (done) => {
        let testItem1 = new ItemModel({
            productID: 'AA-FIR-ST1',
            productTitle: "Test Item One",
            quantity: 100,
            description: "This is the first test item created",
            price: 150.00
        });
        let testItem2 = new ItemModel({
            productID: 'BB-SEC-OND',
            productTitle: "Test Item Two",
            quantity: 45,
            description: "This is the second test item created",
            price: 899.50
        });
        let testOrder = new OrderModel({
            cartID: gUserID
        });
        var itemz = [testItem1, testItem2];
        await ItemModel.insertMany(itemz).then(docs => {
            testOrder.save().then(doc => {
                lOrderID = doc._id;
                console.log('Created two test items and a order');
                done();
            });
        });
    });

    it('Adds an item to an order with proper authorization', function (done) {
        request(app)
            .put(`/api/order/order/${lOrderID}`)
            .set('x-access-token', gToken)
            .send({
                productID: 'AA-FIR-ST1',
                quantity: 20
            })
            .expect(200).then(r => {
                expect(r.body.items[0].quantity).toBe(20);
                done();
            });
    });
    it('Adds another item to the same order with proper authorization', function (done) {
        request(app)
            .put(`/api/order/order/${lOrderID}`)
            .set('x-access-token', gToken)
            .send({
                productID: 'BB-SEC-OND',
                quantity: 5
            })
            .expect(200).then(r => {
                expect(r.body.items[0].quantity).toBe(5);
                done();
            });
    });
    it('Adds firstly added item again to the same order with proper authorization', function (done) {
        request(app)
            .put(`/api/order/order/${lOrderID}`)
            .set('x-access-token', gToken)
            .send({
                productID: 'AA-FIR-ST1',
                quantity: 1
            })
            .expect(200).then(r => {
                expect(r.body.items[1].quantity).toBe(21);
                done();
            });
    });
    it('Adds item to a non existing order with proper authorization', function (done) {
        request(app)
            .put(`/api/order/order/${lOrderID}z`)
            .set('x-access-token', gToken)
            .send({
                productID: 'FH-Q9J-5FO',
                quantity: -1
            })
            .expect(404, done);
    });
    it('Adds a non existing item to an order with proper authorization', function (done) {
        request(app)
            .put(`/api/order/order/${lOrderID}`)
            .set('x-access-token', gToken)
            .send({
                productID: 'DO-ESN-OTE',
                quantity: 10
            })
            .expect(404, done);
    });

    afterAll(async (done) => {
        await ItemModel.findOneAndDelete({ productID: 'AA-FIR-ST1' }).then(res => {
            ItemModel.findOneAndDelete({ productID: 'BB-SEC-OND' }).then(res => {
                console.log('Deleted test items in orders');
                done();
            });
        });
    });
});

describe('User fetches a list of orders', function () {

    beforeAll(async (done) => {
        let testItem1 = new ItemModel({
            productID: 'CC-FIR-ST1',
            productTitle: "Test Item Three",
            quantity: 50,
            description: "This is the third test item created",
            price: 89.00
        });
        let testItem2 = new ItemModel({
            productID: 'DD-SEC-OND',
            productTitle: "Test Item Four",
            quantity: 34,
            description: "This is the fourth test item created",
            price: 175.50
        });
        var itemz = [testItem1, testItem2];
        let testOrder = new OrderModel({
            cartID: gUserID,
            items: itemz
        });
        await ItemModel.insertMany(itemz).then(docs => {
            testOrder.save().then(doc => {
                lOrderID = doc._id;
                done();
            });
        });
    });

    it('Fetches a set of orders related to user with valid authorization', function (done) {
        request(app)
            .get('/api/order/itemlist')
            .set('x-access-token', gToken)
            .expect(200).then(res => {
                expect(res.body.length).toBe(2);
                expect(res.body[1].items[1].productID).toBe('DD-SEC-OND');
                expect(res.body[0].items[0].productID).toBe('BB-SEC-OND');
                done();
            });
    });
    it('Fetches a set of orders with invalid authorization', function (done) {
        request(app)
            .get('/api/order/itemlist')
            .set('x-access-token', gToken + 'z')
            .expect(500, done);
    });
    it('Fetches a set of orders with no authorization', function (done) {
        request(app)
            .get('/api/order/itemlist')
            .expect(403, done);
    });

    afterAll(async (done) => {
        await ItemModel.findOneAndDelete({ productID: 'CC-FIR-ST1' }).then(res => {
            ItemModel.findOneAndDelete({ productID: 'DD-SEC-OND' }).then(res => {
                console.log('Deleted test items in orderlist');
                done();
            });
        });
    });
});

describe('Deletes an order', function () {

    it('Deletes the order with no authorization', function (done) {
        request(app)
            .delete(`/api/order/order/${lOrderID}`)
            .expect(403, done);
    });
    it('Deletes the order with invalid authorization', function (done) {
        request(app)
            .delete(`/api/order/order/${lOrderID}`)
            .set('x-access-token', gToken + 'z')
            .expect(500, done);
    });
    it('Deletes the order with valid authorization', function (done) {
        request(app)
            .delete(`/api/order/order/${lOrderID}`)
            .set('x-access-token', gToken)
            .expect(200, done);
    });
    it('Deletes a non existing order with valid authorization', function (done) {
        request(app)
            .delete(`/api/order/order/${lOrderID}z`)
            .set('x-access-token', gToken)
            .expect(404, done);
    });
});

afterAll(async (done) => {
    await UserModel.findByIdAndDelete(gUserID).then(res => {
        console.log('Deleted test user created');
        done();
    });
});