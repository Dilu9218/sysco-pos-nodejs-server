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

function isItemInList(Item, List) {
    var index = -1;
    for (var i = 0; i < List.length; i++) {
        if (List[i].productID === Item) {
            index = i;
        }
    }
    return index;
}

function isOrderInList(Order, List) {
    var index = -1;
    for (var i = 0; i < List.length; i++) {
        if (List[i]._id === Order) {
            index = i;
        }
    }
    return index;
}

// Fetches a list of orders ###################################################
router.get('/itemlist', VerifyToken, (req, res, next) => {
    // Each order will have userID as it's cart ID
    OrderModel.find({ cartID: req._id }).then(docs => {
        return res.status(200).json(docs);
    }).catch(err => {
        return res.status(404).json({ error: 'No orders found for this user' });
    });
});

// Creates a new order ########################################################
router.post('/order/new', VerifyToken, (req, res, next) => {
    let o = new OrderModel({
        cartID: req._id
    });
    o.save().then(doc => {
        res.status(200).json({ id: doc._id });
    }).catch(er => {
        res.status(400).send(er);
    });
});

// Gets an order #############################################################
router.get('/order/:id', VerifyToken, (req, res, next) => {
    OrderModel
        .findOne({ _id: req.params.id })
        .then(doc => {
            res.status(200).json(doc);
        })
        .catch(er => {
            res.status(404).json({ 'error': 'Cannot find such order list' });
        });
});

// Updates an order ###########################################################
// Pick the order ID number, Send the item as {productID: __ID__, quantity: __n__}
// This route will add the item to item list and updates the order
router.put('/order/:id', VerifyToken, (req, res, next) => {
    // First find the specific order and save the item list
    OrderModel.findOne({ _id: req.params.id }).then(order => {
        let itemList = order.items;
        let index = isItemInList(req.body.productID, itemList);
        // Fetch the item from item pool
        ItemModel.findOne({ productID: req.body.productID }).then(item => {
            // We need to update the global item quantity; so calculate the new quantity
            let newQuantity = item.quantity - req.body.quantity;
            if (index >= 0) { // If the item is already there, update its count without adding a new item to the list
                itemList[index].quantity += req.body.quantity;
            } else {
                // Clone the item so that we can add it to our order as a seperate item
                let newItem = item;
                // Set it's quantity as the purchased quantity
                newItem.quantity = req.body.quantity;
                // Add the new item to the item list in our order
                itemList.unshift(newItem);
            }
            // Update our order with the new item list
            OrderModel.findOneAndUpdate({ _id: req.params.id }, { $set: { items: itemList } }, { new: true })
                .then(newOrder => {
                    // Now that we have updated our order, update the global item properties
                    ItemModel.findOneAndUpdate({ productID: req.body.productID }, { $set: { quantity: newQuantity } }, { new: true })
                        .then(updatedItem => {
                            return res.status(200).json(newOrder);
                        }).catch(err => {
                            return res.status(500).json({ 'status': 'Error updating item' });
                        });
                }).catch(err => {
                    return res.status(500).json({ 'status': 'Error adding item to list' });
                });
        }).catch(err => {
            // Don't worry this won't happen as I will handle this validation from front end
            return res.status(404).json({ 'status': 'Item not found' });
        });
    }).catch(err => {
        return res.status(404).json({ 'status': 'Order list not found' });
    });
});

// Deletes an order ###########################################################
router.delete('/order/:id', VerifyToken, (req, res, next) => {
    OrderModel.findOneAndDelete(
        { _id: req.params.id }).then(doc => {
            return res.status(200).json(doc);
        }).catch(er => {
            return res.status(404).json({ 'status': 'Order list not found' });
        });
});

// Creates a new item #########################################################
router.post('/item/new', VerifyToken, (req, res, next) => {
    let o = new ItemModel(req.body);
    o.save().then(doc => {
        res.status(200).json({ id: doc._id });
    }).catch(er => {
        res.status(400).send(er);
    });
});

// Gets an item ###############################################################
router.get('/item/:id', VerifyToken, (req, res, next) => {
    ItemModel
        .findOne({ _id: req.params.id })
        .then(doc => {
            res.status(200).json(doc);
        })
        .catch(er => {
            res.status(404).json({ 'error': 'Cannot find such order list' });
        });
});

// Updates an item ############################################################
router.put('/item/:id', VerifyToken, (req, res, next) => {
    ItemModel.findOneAndUpdate(
        { _id: req.params.id }, req.body, { new: true }).then(doc => {
            return res.status(200).json(doc);
        }).catch(er => {
            return res.status(404).json({ 'status': 'Order list not found' });
        });
});

// Gets a list of items in the database #######################################
router.get('/items', VerifyToken, (req, res, next) => {
    ItemModel.find({}).then(docs => {
        return res.status(200).json(docs);
    }).catch(err => {
        console.error(err);
        return res.status(404).json({ 'status': 'No items found' });
    });
});

module.exports = router