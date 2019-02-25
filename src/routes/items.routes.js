var express = require('express');
var router = express.Router();
var VerifyToken = require('../auth/verifytoken');
var ItemModel = require('../database/models/item.model');

// Gets a list of items in the database #######################################
router.get('/list', VerifyToken, (req, res, next) => {
    ItemModel.find({}).then(docs => {
        return res.status(200).json(docs);
    }).catch(err => {
        console.error(err);
        return res.status(404).json({ 'status': 'No items found' });
    });
});

// Creates a new item #########################################################
router.post('/new', VerifyToken, (req, res, next) => {
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

module.exports = router