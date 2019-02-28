var express = require('express');
var router = express.Router();
var VerifyToken = require('../auth/verifytoken');
var ItemModel = require('../database/models/item.model');
var OrderModel = require('../database/models/order.model');

/**
 * Fetches a list of orders attached to requested user
 * @see https://app.swaggerhub.com/apis/CloudyPadmal/Sysco-POS/1.0.0#/order/orderList
 */
router.get('/list', VerifyToken, (req, res, next) => {
    // Each order will have userID as it's cart ID
    OrderModel.find({ cartID: req._id }).then(docs => {
        return res.status(200).json(docs);
    }).catch(err => {
        return res.status(404).json({ error: 'No orders found for this user' });
    });
});

/**
 * Creates a new blank order for the requested user
 * @see https://app.swaggerhub.com/apis/CloudyPadmal/Sysco-POS/1.0.0#/order/newOrder
 */
router.post('/new', VerifyToken, (req, res, next) => {
    let o = new OrderModel({
        cartID: req._id,
        items: []
    });
    o.save().then(doc => {
        res.status(200).json(doc);
    }).catch(er => {
        res.status(400).send(er);
    });
});

/**
 * Adds a new item to an order
 * @see https://app.swaggerhub.com/apis/CloudyPadmal/Sysco-POS/1.0.0#/order/addItemToOrder
 */
router.post('/add/:id', VerifyToken, (req, res, next) => {
    // Fetch the item from item pool and decrement the amount from item quantity
    ItemModel.findOneAndUpdate({ productID: req.body.productID }, { $inc: { quantity: -req.body.quantity } })
        .then(item => {
            // Clone the item so that we can add it to our order as a seperate item
            let newItem = item;
            // Set it's quantity as the purchased quantity
            newItem.quantity = req.body.quantity;
            // Update our order with the new item
            OrderModel.findOneAndUpdate({ _id: req.params.id }, { $push: { items: newItem } }, { new: true })
                .then(newOrder => {
                    return res.status(200).json(newOrder);
                }).catch(err => {
                    return res.status(500).json({ 'status': 'Error adding item to list' });
                });
        }).catch(err => {
            // Don't worry this won't happen as I will handle this validation from front end
            return res.status(404).json({ 'status': 'Item not found' });
        });
});

/**
 * Checks out an order
 * @see https://app.swaggerhub.com/apis/CloudyPadmal/Sysco-POS/1.0.0#/order/checkoutOrder
 */
router.delete('/checkout/:id', VerifyToken, (req, res, next) => {
    OrderModel.findOneAndDelete(
        { _id: req.params.id }).then(doc => {
            return res.status(200).json(doc);
        }).catch(er => {
            return res.status(404).json({ 'status': 'Order not found' });
        });
});

/**
 * Fetches an order by its ID
 * @see https://app.swaggerhub.com/apis/CloudyPadmal/Sysco-POS/1.0.0#/order/fetchOrder
 */
router.get('/order/:id', VerifyToken, (req, res, next) => {
    OrderModel
        .findOne({ _id: req.params.id })
        .then(doc => {
            res.status(200).json(doc);
        })
        .catch(er => {
            res.status(404).json({ 'error': 'Cannot find such order' });
        });
});

/**
 * Deletes an order and increment count in respective items
 * @see https://app.swaggerhub.com/apis/CloudyPadmal/Sysco-POS/1.0.0#/order/deleteOrder
 */
router.delete('/order/:id', VerifyToken, (req, res, next) => {
    OrderModel.findOneAndDelete(
        { _id: req.params.id }).then(doc => {
            let itemList = doc.items;
            // There are items in the order, We need to add them back to global items
            if (itemList.length > 0) {
                itemList.forEach(item => {
                    ItemModel.findOneAndUpdate({ productID: item.productID },
                        { $inc: { quantity: item.quantity } }, { new: true })
                        .then(item => { })
                        .catch(err => {
                            return res.status(500).json(doc);
                        });
                    return res.status(200).json(itemList);
                });
            } else {
                return res.status(200).json(doc);
            }
        }).catch(er => {
            return res.status(404).end();
        });
});

/**
 * Removes a single item from an order
 * @see https://app.swaggerhub.com/apis/CloudyPadmal/Sysco-POS/1.0.0#/order/removeItemsInOrder
 */
router.put('/order/:id', VerifyToken, (req, res, next) => {
    ItemModel.findOneAndUpdate({ productID: req.body.productID },
        { $inc: { quantity: req.body.quantity } }, { new: true }).then(doc => {
            OrderModel.findOneAndUpdate({ _id: req.params.id },
                { $pull: { items: { productID: req.body.productID } } }, { new: true }).then(updatedOrder => {
                    return res.status(200).json(updatedOrder);
                }).catch(err => {
                    return res.status(404).json({ 'error': 'Cannot find such item' });
                })
        }).catch(err => {
            return res.status(404).json({ 'error': 'Cannot find such item' });
        });
});

/**
 * Updates item quantities in an order
 * @see https://app.swaggerhub.com/apis/CloudyPadmal/Sysco-POS/1.0.0#/order/updateItemsInOrder
 */
router.post('/order/:id', VerifyToken, (req, res, next) => {
    ItemModel.findOneAndUpdate({ productID: req.body.productID },
        { $inc: { quantity: -req.body.difference } }, { new: true }).then(doc => {
            OrderModel.findOneAndUpdate({ _id: req.params.id, "items.productID": req.body.productID },
                { $set: { "items.$.quantity": req.body.quantity } }, { new: true }).then(updatedOrder => {
                    return res.status(200).json(updatedOrder);
                }).catch(err => {
                    return res.status(405).json({ 'error': 'Cannot find such order' });
                })
        }).catch(err => {
            return res.status(404).json({ 'error': 'Cannot find such item' });
        });
});

module.exports = router