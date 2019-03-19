var express = require("express");
var router = express.Router();
var VerifyToken = require("../auth/verifytoken");
var ItemModel = require("../database/models/item.model");
var OrderModel = require("../database/models/order.model");

/***************************************************************************************************
 * Fetches a list of orders attached to requested user
 * @see https://app.swaggerhub.com/apis/CloudyPadmal/Sysco-POS/1.0.3#/order/order_list
 **************************************************************************************************/
router.get("/list", VerifyToken, (req, res, next) => {
    // Each order will have userID as it"s cart ID
    OrderModel.find({ cartID: req._id }).then(docs => {
        if (docs.length === 0) throw new Error("No orders found for this user");
        return res.status(200).json(docs);
    }).catch(err => {
        return res.status(404).json({ error: "No orders found for this user" });
    });
});

/***************************************************************************************************
 * Creates a new blank order for the requested user
 * @see https://app.swaggerhub.com/apis/CloudyPadmal/Sysco-POS/1.0.3#/order/new_order
 **************************************************************************************************/
router.post("/order", VerifyToken, (req, res, next) => {
    let o = new OrderModel({
        cartID: req._id,
        items: []
    });
    o.save().then(doc => {
        res.status(200).json(doc);
    });
});

/***************************************************************************************************
 * Adds a new item to an order
 * @see https://app.swaggerhub.com/apis/CloudyPadmal/Sysco-POS/1.0.3#/order/order_add_item
 **************************************************************************************************/
router.put("/item/:id", VerifyToken, (req, res, next) => {
    // Fetch the item from item pool and decrement the amount from item quantity
    ItemModel.findOneAndUpdate({ productID: req.body.productID }, { $inc: { quantity: -req.body.quantity } })
        .then(item => {
            // Clone the item so that we can add it to our order as a seperate item
            let newItem = item;
            // Set it"s quantity as the purchased quantity
            newItem.quantity = req.body.quantity;
            // Update our order with the new item
            OrderModel.findOneAndUpdate({ _id: req.params.id }, { $push: { items: newItem } }, { new: true })
                .then(newOrder => {
                    return res.status(200).json(newOrder);
                }).catch(err => {
                    return res.status(500).json({ "error": "Error adding item to list" });
                });
        }).catch(err => {
            // Don"t worry this won"t happen as I will handle this validation from front end
            return res.status(404).json({ "error": "Item not found" });
        });
});

/***************************************************************************************************
 * Adds a set of items to an order
 * @see https://app.swaggerhub.com/apis/CloudyPadmal/Sysco-POS/1.0.3#/order/order_add_items
 **************************************************************************************************/
router.put("/items/:id", VerifyToken, (req, res, next) => {
    // Need to add every item requested to add to this order
    if (req.body.items === undefined || Object.keys(req.body.items).length === 0) {
        return res.status(400).json({ "status": "No items to add to this order" });
    } else {
        let itemPromises = [];
        Object.keys(req.body.items).forEach(productID => {
            itemPromises.push(new Promise((resolve, reject) => {
                ItemModel.findOneAndUpdate(
                    { productID },
                    { $inc: { quantity: -req.body.items[productID] } })
                    .then(item => {
                        // Clone the item so that we can add it to our order as a seperate item
                        let newItem = item;
                        // Set it"s quantity as the purchased quantity
                        newItem.quantity = req.body.items[productID];
                        // Update our order with the new item
                        OrderModel.findOneAndUpdate(
                            { _id: req.params.id },
                            { $push: { items: newItem } }, { new: true })
                            .then(newOrder => { resolve(newOrder); }).catch(e => {
                                reject({ "error": 404 });
                            });
                    }).catch(e => {
                        reject({ "error": 404 });
                    });
            }));
        });
        let errCount = 0;
        let error = undefined;
        Promise.all(
            itemPromises.map(p => p.catch(e => { errCount++; error = e; }))
        ).then(r => {
            if (errCount > 0) {
                res.status(error["error"]).end();
            }
            else {
                res.status(200).json(r[r.length - 1]);
            }
        });
    }
});

/***************************************************************************************************
 * Removes a single item from an order was : put -> order
 * @see https://app.swaggerhub.com/apis/CloudyPadmal/Sysco-POS/1.0.3#/order/delete_item
 **************************************************************************************************/
router.patch("/item/:id", VerifyToken, (req, res, next) => {
    ItemModel.findOneAndUpdate({ productID: req.body.productID },
        { $inc: { quantity: req.body.quantity } }, { new: true }).then(doc => {
            OrderModel.findOneAndUpdate({ _id: req.params.id },
                { $pull: { items: { productID: req.body.productID } } }, { new: true })
                .then(updatedOrder => {
                    return res.status(200).json(updatedOrder);
                });
        }).catch(err => {
            return res.status(404).json({ "error": "Item not found" });
        });
});

/***************************************************************************************************
 * Fetches an order by its ID
 * @see https://app.swaggerhub.com/apis/CloudyPadmal/Sysco-POS/1.0.3#/order/get_this_order
 **************************************************************************************************/
router.get("/order/:id", VerifyToken, (req, res, next) => {
    OrderModel
        .findOne({ _id: req.params.id })
        .then(doc => {
            res.status(200).json(doc);
        })
        .catch(er => {
            res.status(404).json({ "error": "Cannot find such order" });
        });
});

/***************************************************************************************************
 * Deletes an order and increment count in respective items
 * @see https://app.swaggerhub.com/apis/CloudyPadmal/Sysco-POS/1.0.3#/order/delete_this_order
 **************************************************************************************************/
router.delete("/order/:id", VerifyToken, (req, res, next) => {
    OrderModel.findOneAndDelete(
        { _id: req.params.id }).then(doc => {
            let itemList = doc.items;
            // There are items in the order, We need to add them back to global items
            if (itemList.length > 0) {
                itemList.forEach(item => {
                    ItemModel.findOneAndUpdate({ productID: item.productID },
                        { $inc: { quantity: item.quantity } }, { new: true })
                        .then(item => { });
                    return res.status(200).json(itemList);
                });
            } else {
                return res.status(200).json(doc);
            }
        }).catch(er => {
            res.status(404).end();
        });
});

/***************************************************************************************************
 * Updates item quantity in an order
 * @see https://app.swaggerhub.com/apis/CloudyPadmal/Sysco-POS/1.0.3#/order/update_item_quantity
 **************************************************************************************************/
router.patch("/order/:id", VerifyToken, (req, res, next) => {
    ItemModel.findOneAndUpdate({ productID: req.body.productID },
        { $inc: { quantity: -req.body.difference } }, { new: true }).then(doc => {
            OrderModel.findOneAndUpdate({
                _id: req.params.id, "items.productID": req.body.productID
            },
                { $set: { "items.$.quantity": req.body.quantity } }, { new: true })
                .then(updatedOrder => {
                    return res.status(200).json(updatedOrder);
                }).catch(err => {
                    return res.status(405).json({ "error": "Cannot find such order" });
                })
        }).catch(err => {
            return res.status(404).json({ "error": "Item not found" });
        });
});

/***************************************************************************************************
 * Checks out an order
 * @see https://app.swaggerhub.com/apis/CloudyPadmal/Sysco-POS/1.0.3#/order/check_out_order
 **************************************************************************************************/
router.post("/checkout/:id", VerifyToken, (req, res, next) => {
    OrderModel.findOneAndDelete(
        { _id: req.params.id }).then(doc => {
            return res.status(200).json(doc);
        }).catch(er => {
            return res.status(404).json({ "status": "Cannot find such order" });
        });
});

module.exports = router