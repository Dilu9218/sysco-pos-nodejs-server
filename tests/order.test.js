const request = require('supertest');
const app = require('../app');
var config = require('../src/auth/config');
var jwt = require('jsonwebtoken');
const ItemModel = require('../src/database/models/item.model');
const OrderModel = require('../src/database/models/order.model');
const UserModel = require('../src/database/models/user.model');

var gToken = undefined;
var nToken = undefined;
var gUser = undefined;
var gUserID = undefined;
var gItemID = undefined;
var gOrderID = undefined;
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
    let noorderingUser = new UserModel({
        username: generateUserName(),
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
    await UserModel.insertMany([orderingUser, noorderingUser]).then(users => {
        gUserID = users[0]._id;
        gToken = jwt.sign({ id: users[0]._id }, config.secret, {
            expiresIn: (24 * 60 * 60)
        });
        nToken = jwt.sign({ id: users[1]._id }, config.secret, {
            expiresIn: (24 * 60 * 60)
        });
        testingItem.save().then(itm => {
            gItemID = itm._id;
            console.debug('Done creating a test user for orders. Proceed with testing');
            done();
        });
    });
});

describe('Adding new items to database', function () {

    let testItemAdded = undefined;

    it('Adds an item with proper authorization', function (done) {
        request(app)
            .post('/api/item/new')
            .set('x-access-token', gToken)
            .send({
                "productID": generateItemCode(),
                "productTitle": generateUserName(),
                "quantity": parseInt(Math.random() * 50),
                "description": generateDescription(),
                "price": parseInt(Math.random() * 1000) / 100
            })
            .expect(200).then(res => {
                testItemAdded = res.body.id;
                done();
            });
    });
    it('Adds an item with invalid token', function (done) {
        request(app)
            .post('/api/item/new')
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
            .post('/api/item/new')
            .send({
                "productID": generateItemCode(),
                "productTitle": generateUserName(),
                "quantity": parseInt(Math.random() * 50),
                "description": "Random item description without token is here",
                "price": parseInt(Math.random() * 1000) / 100
            })
            .expect(403, done);
    });
    it('Adds an item with bogus data with proper authorization', function (done) {
        request(app)
            .post('/api/item/new')
            .set('x-access-token', gToken)
            .send({
                "productID": generateItemCode(),
                "productTitle": generateUserName(),
                "quantity": 'Invalid',
                "description": generateDescription(),
                "price": parseInt(Math.random() * 1000) / 100
            })
            .expect(400, done);
    });

    afterAll(async (done) => {
        ItemModel.findByIdAndDelete(testItemAdded).then(res => {
            done();
        });
    })
});

describe('Fetching an item', function () {

    it('Fetch an item from ID', function (done) {
        request(app)
            .get(`/api/item/item/${gItemID}`)
            .set('x-access-token', gToken)
            .expect(200).then(d => {
                expect(d.body.productID).toBe('TH-ISI-STS');
                done();
            });
    });
    it('Fetch an item which is not in database', function (done) {
        request(app)
            .get(`/api/item/item/${gItemID}z`)
            .set('x-access-token', gToken)
            .expect(404, done);
    });
    it('Fetch an item from ID without authorization', function (done) {
        request(app)
            .get(`/api/item/item/${gItemID}`)
            .expect(403, done);
    });
    it('Fetch an item from ID with invalid token', function (done) {
        request(app)
            .get(`/api/item/item/${gItemID}`)
            .set('x-access-token', gToken + 'z')
            .expect(500, done);
    });
});

describe('Updating an item', function () {

    it('Update an item from ID', function (done) {
        request(app)
            .put(`/api/item/item/${gItemID}`)
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
            .put(`/api/item/item/${gItemID}z`)
            .set('x-access-token', gToken)
            .expect(404, done);
    });
    it('Update an item from ID without authorization', function (done) {
        request(app)
            .put(`/api/item/item/${gItemID}`)
            .expect(403, done);
    });
    it('Update an item from ID with invalid token', function (done) {
        request(app)
            .put(`/api/item/item/${gItemID}`)
            .set('x-access-token', gToken + 'z')
            .expect(500, done);
    });
});

describe('Fetching the item list', function () {

    it('Fetch item list with valid credentials', function (done) {
        request(app)
            .get('/api/item/list')
            .set('x-access-token', gToken)
            .expect(200).then(d => {
                gItemList = d;
                expect(d.body.length).toBeGreaterThan(1);
                done();
            });
    });
    it('Fetch item list without authorization', function (done) {
        request(app)
            .get('/api/item/list')
            .expect(403, done);
    });
    it('Fetch item list with an invalid token', function (done) {
        request(app)
            .get('/api/item/list')
            .set('x-access-token', gToken + 'z')
            .expect(500, done);
    });
});

describe('Creates an order', function () {

    it('Creates a blank order with proper authorization', function (done) {
        request(app)
            .post('/api/order/order')
            .set('x-access-token', gToken)
            .expect(200).then(r => {
                gOrderID = r.body._id;
                done();
            });
    });
    it('Creates an order without authorization', function (done) {
        request(app)
            .post('/api/order/order')
            .expect(403, done);
    });
    it('Creates an order with invalid token', function (done) {
        request(app)
            .post('/api/order/order')
            .set('x-access-token', gToken + 'z')
            .expect(500, done);
    });
});

describe('Fetches an order', function () {

    let localOrderID = undefined;

    beforeAll(async (done) => {
        let tempOrder = new OrderModel({
            cartID: 'DummyCart',
            items: []
        });
        await tempOrder.save().then(res => {
            localOrderID = res._id;
            done();
        })
    })

    it('Fetches an order with proper authorization', function (done) {
        request(app)
            .get(`/api/order/order/${localOrderID}`)
            .set('x-access-token', gToken)
            .expect(200).then(r => {
                expect(r.body.cartID).toBe('DummyCart');
                done();
            });
    });
    it('Fetches an order which is not in database', function (done) {
        request(app)
            .get(`/api/order/order/${localOrderID}z`)
            .set('x-access-token', gToken)
            .expect(404, done);
    });
    it('Fetches an order without authorization', function (done) {
        request(app)
            .get(`/api/order/order/${localOrderID}`)
            .expect(403, done);
    });
    it('Fetches an order with invalid token', function (done) {
        request(app)
            .get(`/api/order/order/${localOrderID}`)
            .set('x-access-token', gToken + 'z')
            .expect(500, done);
    });

    afterAll(async (done) => {
        OrderModel.findByIdAndDelete(localOrderID).then(res => {
            done();
        });
    });
});

describe('User fetches a list of items', function () {

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
            .get('/api/item/list')
            .set('x-access-token', gToken)
            .expect(200).then(res => {
                expect(res.body.length).toBeGreaterThanOrEqual(2);
                done();
            });
    });
    it('Fetches a set of orders with invalid authorization', function (done) {
        request(app)
            .get('/api/item/list')
            .set('x-access-token', gToken + 'z')
            .expect(500, done);
    });
    it('Fetches a set of orders with no authorization', function (done) {
        request(app)
            .get('/api/item/list')
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

describe('Fetches orders related to a user', function () {

    let lOrderID = undefined;

    beforeAll(async (done) => {
        let testItem1 = new ItemModel({
            productID: 'CC-FIR-STA',
            productTitle: "Test Item Three",
            quantity: 50,
            description: "This is the third test item created",
            price: 89.00
        });
        let testItem2 = new ItemModel({
            productID: 'DD-SEC-ONA',
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
            .get('/api/order/list')
            .set('x-access-token', gToken)
            .expect(200).then(res => {
                console.log(res.body);
                expect(res.body.length).toBeGreaterThanOrEqual(2);
                done();
            });
    });
    it('Fetches a set of orders with invalid authorization', function (done) {
        request(app)
            .get('/api/order/list')
            .set('x-access-token', gToken + 'z')
            .expect(500, done);
    });
    it('Fetches a set of orders with no authorization', function (done) {
        request(app)
            .get('/api/order/list')
            .expect(403, done);
    });
    it('Fetches a set of orders with a user with no orders', function (done) {
        request(app)
            .get('/api/order/list')
            .set('x-access-token', nToken)
            .expect(404, done);
    });

    afterAll(async (done) => {
        await ItemModel.findOneAndDelete({ productID: 'CC-FIR-STA' }).then(res => {
            ItemModel.findOneAndDelete({ productID: 'DD-SEC-ONA' }).then(res => {
                OrderModel.findByIdAndDelete(lOrderID).then(res => {
                    console.log('Deleted test items and orders fetching orders');
                    done();
                });
            });
        });
    });
});

describe('Adds item to an order', function () {

    beforeAll(async (done) => {
        let testItem = new ItemModel({
            productID: 'NE-WPOS-TME',
            productTitle: "New Adding Method",
            quantity: 500,
            description: "This is a test item created to test adding a new item",
            price: 250.00
        });
        // Save the test item
        await testItem.save().then(doc => {
            done();
        });
    });

    it('Adds a new item to the order without authorization', function (done) {
        request(app)
            .put(`/api/order/item/${lOrderID}`)
            .send({
                productID: 'NE-WPOS-TME',
                quantity: 10
            })
            .expect(403, done);
    });
    it('Adds a new item to the order with invalid authorization', function (done) {
        request(app)
            .put(`/api/order/item/${lOrderID}`)
            .set('x-access-token', gToken + 'z')
            .send({
                productID: 'NE-WPOS-TME',
                quantity: 10
            })
            .expect(500, done);
    });
    it('Adds a new item to the order', function (done) {
        request(app)
            .put(`/api/order/item/${lOrderID}`)
            .set('x-access-token', gToken)
            .send({
                productID: 'NE-WPOS-TME',
                quantity: 10
            })
            .expect(200).then(res => {
                ItemModel.findOne({ productID: 'NE-WPOS-TME' }).then(doc => {
                    expect(doc.quantity).toBe(490);
                    done();
                });
            });
    });
    it('Adds a non existing item to the order', function (done) {
        request(app)
            .put(`/api/order/item/${lOrderID}`)
            .set('x-access-token', gToken)
            .send({
                productID: 'NE-WNOS-TME',
                quantity: 10
            })
            .expect(404, done);
    });
    it('Adds an item with invalid data', function (done) {
        request(app)
            .put(`/api/order/item/${lOrderID}`)
            .set('x-access-token', gToken)
            .send({
                productID: 'NE-WPOS-TME',
                quantity: 'abc'
            })
            .expect(404, done);
    });
    it('Adds an item with invalid order', function (done) {
        request(app)
            .put(`/api/order/item/${lOrderID}z`)
            .set('x-access-token', gToken)
            .send({
                productID: 'NE-WPOS-TME',
                quantity: 10
            })
            .expect(500, done);
    });

    afterAll(async (done) => {
        await ItemModel.findOneAndDelete({ productID: 'NE-WPOS-TME' }).then(res => {
            done();
        })
    });
});

describe('Checkouts an order', function () {

    it('Checkout the order with no authorization', function (done) {
        request(app)
            .post(`/api/order/checkout/${lOrderID}`)
            .expect(403, done);
    });
    it('Checkout the order with invalid authorization', function (done) {
        request(app)
            .post(`/api/order/checkout/${lOrderID}`)
            .set('x-access-token', gToken + 'z')
            .expect(500, done);
    });
    it('Checkout the order with valid authorization', function (done) {
        request(app)
            .post(`/api/order/checkout/${lOrderID}`)
            .set('x-access-token', gToken)
            .expect(200, done);
    });
    it('Checkout a non existing order with valid authorization', function (done) {
        request(app)
            .post(`/api/order/checkout/${lOrderID}z`)
            .set('x-access-token', gToken)
            .expect(404, done);
    });
});

describe('Deleting an order', function () {
    let orderID = undefined;
    let emptyItemOrderID = undefined;

    beforeAll(async (done) => {
        let testItem1 = new ItemModel({
            productID: 'TH-ENE-W01',
            productTitle: "Item Under Test 01",
            quantity: 490,
            description: "This item has 490 at the beginning",
            price: 250.00
        });
        let testItem1C = new ItemModel({
            productID: 'TH-ENE-W01',
            productTitle: "Item Under Test 01",
            quantity: 10,
            description: "This item was added to order",
            price: 250.00
        });

        let testItem2 = new ItemModel({
            productID: 'TH-ENE-W02',
            productTitle: "Item Under Test 02",
            quantity: 1567,
            description: "This item has 1567 at the beginning",
            price: 487.33
        });
        let testItem2C = new ItemModel({
            productID: 'TH-ENE-W02',
            productTitle: "Item Under Test 02",
            quantity: 433,
            description: "This item was added to order",
            price: 487.33
        });

        let testOrder = new OrderModel({
            cartID: 'ThisIsTheTestCartID',
            items: [testItem1C, testItem2C]
        });
        let testOrderWithNoItems = new OrderModel({
            cartID: 'ThisOrderHasNoItems',
            items: []
        });
        await ItemModel.insertMany([testItem1, testItem2]).then(docs => {
            OrderModel.insertMany([testOrder, testOrderWithNoItems]).then(doc => {
                orderID = doc[0]._id;
                emptyItemOrderID = doc[1]._id;
                done();
            });
        });
    });

    it('Delete the order with no authorization', function (done) {
        request(app)
            .delete(`/api/order/order/${orderID}`)
            .expect(403, done);
    });
    it('Delete the order with invalid authorization', function (done) {
        request(app)
            .delete(`/api/order/order/${orderID}`)
            .set('x-access-token', gToken + 'z')
            .expect(500, done);
    });
    it('Delete a non existing order with valid authorization', function (done) {
        request(app)
            .delete(`/api/order/order/${orderID}z`)
            .set('x-access-token', gToken)
            .expect(404, done);
    });
    it('Delete the order with valid authorization', function (done) {
        request(app)
            .delete(`/api/order/order/${orderID}`)
            .set('x-access-token', gToken)
            .expect(200).then(res => {
                ItemModel.findOne({ productID: 'TH-ENE-W01' }).then(doc1 => {
                    ItemModel.findOne({ productID: 'TH-ENE-W02' }).then(doc2 => {
                        expect(doc1.quantity).toBe(500);
                        expect(doc2.description).toBe('This item has 1567 at the beginning');
                        expect(doc2.quantity).toBe(2000);
                        done();
                    });
                });
            });
    });
    it('Delete an order with no items in it', function (done) {
        request(app)
            .delete(`/api/order/order/${emptyItemOrderID}`)
            .set('x-access-token', gToken)
            .expect(200, done);
    });

    afterAll(async (done) => {
        await OrderModel.findOneAndDelete({ cartID: 'ThisIsTheTestCartID' }).then(res => {
            ItemModel.deleteOne({ productID: 'TH-ENE-W01' }).then(doc => {
                ItemModel.deleteOne({ productID: 'TH-ENE-W02' }).then(doc => {
                    console.log('Deleted test items created for deleting an order');
                    done();
                });
            });
        })
    });
});

describe('Removing an item from an order', function () {
    let orderID = undefined;

    beforeAll(async (done) => {
        let testItem1 = new ItemModel({
            productID: 'OR-DER-IT1',
            productTitle: "Order Item 01",
            quantity: 250,
            description: "This item has 250 items at the beginning",
            price: 145.75
        });
        let testItem1C = new ItemModel({
            productID: 'OR-DER-IT1',
            productTitle: "Order Item 01",
            quantity: 25,
            description: "This is added to the order",
            price: 145.75
        });

        let testItem2 = new ItemModel({
            productID: 'OR-DER-IT2',
            productTitle: "Order Item 02",
            quantity: 1000,
            description: "This item has 1000 items at the beginning",
            price: 300.00
        });
        let testItem2C = new ItemModel({
            productID: 'OR-DER-IT2',
            productTitle: "Order Item 02",
            quantity: 200,
            description: "This is also added to the order",
            price: 300.00
        });

        let testOrder = new OrderModel({
            cartID: 'ThisIsANewCart',
            items: [testItem1C, testItem2C]
        });
        await ItemModel.insertMany([testItem1, testItem2]).then(docs => {
            testOrder.save().then(doc => {
                orderID = doc._id;
                done();
            });
        });
    });

    it('Remove an item from an order with no authorization', function (done) {
        request(app)
            .delete(`/api/order/item/${orderID}`)
            .expect(403, done);
    });
    it('Remove an item from an order with invalid authorization', function (done) {
        request(app)
            .delete(`/api/order/item/${orderID}`)
            .set('x-access-token', gToken + 'z')
            .expect(500, done);
    });
    it('Remove an item from an order with valid authorization', function (done) {
        request(app)
            .delete(`/api/order/item/${orderID}`)
            .set('x-access-token', gToken)
            .send({
                productID: 'OR-DER-IT1',
                quantity: 25
            })
            .expect(200).then(res => {
                ItemModel.findOne({ productID: 'OR-DER-IT1' }).then(doc1 => {
                    ItemModel.findOne({ productID: 'OR-DER-IT2' }).then(doc2 => {
                        expect(doc1.quantity).toBe(275);
                        expect(doc2.quantity).toBe(1000);
                        expect(doc1.description).toBe('This item has 250 items at the beginning');
                        done();
                    }).catch(err => { done(); });
                }).catch(err => { done(); });
            }).catch(err => { done() });
    });
    it('Remove an item from a non existing order with valid authorization', function (done) {
        request(app)
            .delete(`/api/order/item/${orderID}z`)
            .set('x-access-token', gToken)
            .expect(404, done);
    });

    afterAll(async (done) => {
        await OrderModel.findOneAndDelete({ cartID: 'ThisIsANewCart' }).then(res => {
            ItemModel.deleteOne({ productID: 'OR-DER-IT1' }).then(doc => {
                ItemModel.deleteOne({ productID: 'OR-DER-IT2' }).then(doc => {
                    console.log('Deleted test items created for deleting items in an order');
                    done();
                });
            });
        })
    });
});

describe('Changing an item in an order', function () {
    let orderID = undefined;

    beforeAll(async (done) => {
        let testItem1 = new ItemModel({
            productID: 'OR-DER-111',
            productTitle: "Order Item 01",
            quantity: 250,
            description: "This item has 250 items at the beginning",
            price: 145.75
        });
        let testItem1C = new ItemModel({
            productID: 'OR-DER-111',
            productTitle: "Order Item 01",
            quantity: 25,
            description: "This is added to the order",
            price: 145.75
        });

        let testItem2 = new ItemModel({
            productID: 'OR-DER-222',
            productTitle: "Order Item 02",
            quantity: 1000,
            description: "This item has 1000 items at the beginning",
            price: 300.00
        });
        let testItem2C = new ItemModel({
            productID: 'OR-DER-222',
            productTitle: "Order Item 02",
            quantity: 100,
            description: "This is also added to the order",
            price: 300.00
        });

        let testOrder = new OrderModel({
            cartID: 'ThisIsAnotherNewCart',
            items: [testItem1C, testItem2C]
        });
        await ItemModel.insertMany([testItem1, testItem2]).then(docs => {
            testOrder.save().then(doc => {
                orderID = doc._id;
                done();
            });
        });
    });

    it('Change an item from an order with no authorization', function (done) {
        request(app)
            .patch(`/api/order/order/${orderID}`)
            .expect(403, done);
    });
    it('Change an item from an order with invalid authorization', function (done) {
        request(app)
            .patch(`/api/order/order/${orderID}`)
            .set('x-access-token', gToken + 'z')
            .expect(500, done);
    });
    it('Change an item from an order with valid authorization', function (done) {
        request(app)
            .patch(`/api/order/order/${orderID}`)
            .set('x-access-token', gToken)
            .send({
                productID: 'OR-DER-111',
                quantity: 30,
                difference: 5
            })
            .expect(200).then(res => {
                ItemModel.findOne({ productID: 'OR-DER-111' }).then(doc1 => {
                    ItemModel.findOne({ productID: 'OR-DER-222' }).then(doc2 => {
                        expect(doc1.quantity).toBe(245);
                        expect(doc2.quantity).toBe(1000);
                        expect(doc1.description).toBe('This item has 250 items at the beginning');
                        done();
                    });
                });
            });
    });
    it('Change an item from an order with invalid quantity with valid authorization', function (done) {
        request(app)
            .patch(`/api/order/order/${orderID}`)
            .set('x-access-token', gToken)
            .send({
                productID: 'OR-DER-111',
                quantity: 'A',
                difference: 'A'
            })
            .expect(404, done);
    });
    it('Change an item from a non existing order with valid authorization', function (done) {
        request(app)
            .patch(`/api/order/order/${orderID}z`)
            .set('x-access-token', gToken)
            .send({
                productID: 'OR-DER-111',
                quantity: 30,
                difference: 5
            })
            .expect(405, done);
    });

    afterAll(async (done) => {
        await OrderModel.findOneAndDelete({ cartID: 'ThisIsAnotherNewCart' }).then(res => {
            ItemModel.deleteOne({ productID: 'OR-DER-111' }).then(doc => {
                ItemModel.deleteOne({ productID: 'OR-DER-222' }).then(doc => {
                    console.log('Deleted test items created for deleting items in an order');
                    done();
                });
            });
        })
    });
});

describe('Adds multiple items to an order', function () {

    let localOrderID = undefined;

    beforeAll(async (done) => {
        let testItem1 = new ItemModel({
            productID: 'MU-LTI-PL1',
            productTitle: "Multiple Item One",
            quantity: 500,
            description: "This is the first test item created to test multiple item addition",
            price: 250.00
        });
        let testItem2 = new ItemModel({
            productID: 'MU-LTI-PL2',
            productTitle: "Multiple Item Two",
            quantity: 400,
            description: "This is the second test item created to test multiple item addition",
            price: 350.00
        });
        let testItem3 = new ItemModel({
            productID: 'MU-LTI-PL3',
            productTitle: "Multiple Item Three",
            quantity: 700,
            description: "This is the third test item created to test multiple item addition",
            price: 150.00
        });
        let testOrder = new OrderModel({
            cartID: 'CartForMultipleItems',
            items: []
        })
        // Save the test item
        await ItemModel.insertMany([testItem1, testItem2, testItem3]).then(docs => {
            testOrder.save().then(doc => {
                console.debug('Created test items to test multiple item additions');
                localOrderID = doc._id;
                done();
            });
        })
    });

    it('Adds multiple items with proper authorization', function (done) {
        request(app)
            .put(`/api/order/items/${localOrderID}`)
            .set('x-access-token', gToken)
            .send({
                items: {
                    'MU-LTI-PL1': 20,
                    'MU-LTI-PL2': 15,
                    'MU-LTI-PL3': 230
                }
            })
            .expect(200).then(res => {
                ItemModel.findOne({ productID: 'MU-LTI-PL1' }).then(i1 => {
                    ItemModel.findOne({ productID: 'MU-LTI-PL2' }).then(i2 => {
                        ItemModel.findOne({ productID: 'MU-LTI-PL3' }).then(i3 => {
                            expect(i1.quantity).toBe(480);
                            expect(i2.quantity).toBe(385);
                            expect(i3.quantity).toBe(470);
                            done();
                        });
                    });
                });
            });
    });
    it('Adds multiple items without proper authorization', function (done) {
        request(app)
            .put(`/api/order/items/${localOrderID}`)
            .set('x-access-token', gToken + 'z')
            .send({
                items: {
                    'MU-LTI-PL1': 20,
                    'MU-LTI-PL2': 15,
                    'MU-LTI-PL3': 230
                }
            })
            .expect(500, done);
    });
    it('Adds multiple items to an invalid order', function (done) {
        request(app)
            .put(`/api/order/items/${localOrderID}z`)
            .set('x-access-token', gToken)
            .send({
                items: {
                    'MU-LTI-PL1': 20,
                    'MU-LTI-PL2': 15,
                    'MU-LTI-PL3': 230
                }
            })
            .expect(404, done);
    });
    it('Adds an invalid item to an order', function (done) {
        request(app)
            .put(`/api/order/items/${localOrderID}`)
            .set('x-access-token', gToken)
            .send({
                items: {
                    'MU-LTI-PL0': 20,
                    'MU-LTI-PL2': 15,
                    'MU-LTI-PL3': 230
                }
            })
            .expect(404).then(res => {
                ItemModel.findOne({ productID: 'MU-LTI-PL2' }).then(i2 => {
                    expect(i2.quantity).toBe(355);
                    done();
                });
            });
    });
    it('Adds no items to an order', function (done) {
        request(app)
            .put(`/api/order/items/${localOrderID}`)
            .set('x-access-token', gToken)
            .expect(400, done);
    });

    afterAll(async (done) => {
        await ItemModel.findOneAndDelete({ productID: 'MU-LTI-PL1' }).then(res => {
            ItemModel.findOneAndDelete({ productID: 'MU-LTI-PL2' }).then(res => {
                ItemModel.findOneAndDelete({ productID: 'MU-LTI-PL3' }).then(res => {
                    OrderModel.findOneAndDelete({ cartID: 'CartForMultipleItems' }).then(res => {
                        console.log('Cleaned up resources used while testing multiple item addition');
                        done();
                    })
                })
            })
        })
    });
});

afterAll(async (done) => {
    await UserModel.findByIdAndDelete(gUserID).then(res => {
        ItemModel.findOneAndDelete(
            { productID: "TH-ISI-STS" }).then(res => {
                console.log('Cleaned up resources used while testing order end points');
                done();
            });
    });
});