var express = require('express');
var router = express.Router();
var VerifyToken = require('../auth/verifytoken');
var ItemModel = require('../database/models/item.model');
var OrderModel = require('../database/models/order.model');
var CartModel = require('../database/models/cart.model');

/*
- Cart
   |-- Order
        |-- Item
        |-- Item
        |-- Item
   |-- Order
        |-- Item
*/

// Creates a new order list ##TESTED
router.post('/cart/new', VerifyToken, (req, res, next) => {
    // Fetch the new cart details
    let cart = {};
    // Attach current user ID to it
    cart.userID = req._id;
    // Save the cart in DB
    let o = new CartModel(cart);
    o.save().then(doc => {
        res.status(201).json({
            status: 'Cart created succefully',
            id: doc._id
        });
    }).catch(er => {
        // A cart already exists for the specified user
        if (er.code === 11000) {
            // Find the cart ID and send it to user
            CartModel.findOne({ userID: req._id }).then(doc => {
                res.status(200).json({
                    status: 'A cart already exists',
                    id: doc._id
                });
            });
        } else {
            console.error(er.code);
            res.status(400).send(er);
        }
    });
});

// Gets an order list ##TESTED
router.get('/cart/:id', VerifyToken, (req, res, next) => {
    CartModel
        .findOne({ _id: req.params.id })
        .then(doc => {
            res.status(200).json(doc);
        })
        .catch(er => {
            res.status(404).json({ 'error': 'Cannot find such order list' });
        });
});

// Updates an order list
router.put('/cart/:id', (req, res) => {
    CartModel.findOneAndUpdate(
        { _id: req.params.id }, req.body, { new: true }).then(doc => {
            return res.status(200).json(doc);
        }).catch(er => {
            return res.status(404).json({ 'status': 'Order list not found' });
        });
});

// Deletes an order list
router.delete('/cart/:id', (req, res) => {
    CartModel.findOneAndDelete(
        { _id: req.params.id }).then(doc => {
            return res.status(200).json(doc);
        }).catch(er => {
            return res.status(404).json({ 'status': 'Order list not found' });
        });
});

// Creates a new order
router.post('/order/new', (req, res) => {
    if (req.body.orders) {
        let o = new OrderModel(req.body);
        o.save().then(doc => {
            res.status(200).json({ id: doc._id });
        }).catch(er => {
            res.status(400).send(er);
        });
    } else {
        res.status(404).json({ 'error': 'Data missing' });
    }
});

// Gets an order
router.get('/order/:id', (req, res) => {
    OrderModel
        .find({ _id: req.params.id })
        .then(doc => {
            res.status(200).json(doc);
        })
        .catch(er => {
            res.status(404).json({ 'error': 'Cannot find such order list' });
        });
});

// Updates an order
router.put('/order/:id', (req, res) => {
    OrderModel.findOneAndUpdate(
        { _id: req.params.id }, req.body, { new: true }).then(doc => {
            return res.status(200).json(doc);
        }).catch(er => {
            return res.status(404).json({ 'status': 'Order list not found' });
        });
});

// Deletes an order
router.delete('/order/:id', (req, res) => {
    OrderModel.findOneAndDelete(
        { _id: req.params.id }).then(doc => {
            return res.status(200).json(doc);
        }).catch(er => {
            return res.status(404).json({ 'status': 'Order list not found' });
        });
});

// Creates a new item
router.post('/item/new', VerifyToken, (req, res, next) => {
    let o = new ItemModel(req.body);
    o.save().then(doc => {
        res.status(200).json({ id: doc._id });
    }).catch(er => {
        res.status(400).send(er);
    });
});

// Gets an item
router.get('/item/:id', VerifyToken, (req, res, next) => {
    ItemModel
        .find({ _id: req.params.id })
        .then(doc => {
            res.status(200).json(doc);
        })
        .catch(er => {
            res.status(404).json({ 'error': 'Cannot find such order list' });
        });
});

// Updates an item
router.put('/item/:id', (req, res) => {
    ItemModel.findOneAndUpdate(
        { _id: req.params.id }, req.body, { new: true }).then(doc => {
            return res.status(200).json(doc);
        }).catch(er => {
            return res.status(404).json({ 'status': 'Order list not found' });
        });
});

// Deletes an item
router.delete('/item/:id', (req, res) => {
    ItemModel.findOneAndDelete(
        { _id: req.params.id }).then(doc => {
            return res.status(200).json(doc);
        }).catch(er => {
            return res.status(404).json({ 'status': 'Order list not found' });
        });
});

module.exports = router