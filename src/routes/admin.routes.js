var express = require('express');
var router = express.Router();
var AdminModel = require('../database/models/user.model');
var VerifyToken = require('../auth/verifytoken');

/** Tested */
router.post('/user/add', VerifyToken, (req, res, next) => {
    if (!req._admin) {
        return res.status(403).json({ 'error': 'Not enough priviledges' });
    }
    try {
        let t = new AdminModel(req.body);
        t.save().then(() => {
            return res.status(200).json({ 'status': 'User created' });
        }).catch(err => {
            if (err.name === 'MongoError' && err.code === 11000) {
                return res.status(409).json({ 'error': 'Duplicate user name' });
            }
            if (err.name === 'ValidationError') {
                return res.status(400).json({ 'error': 'Some fields are missing' });
            }
        });
    } catch (e) {
        if (e instanceof TypeError) {
            return res.status(500).json({ error: "Database seems out of our hands ..." });
        } else {
            return res.status(501).json({ error: "Something went wrong and we don't know what is it, yet ..." });
        }
    }
});

/** Tested */
router.get('/users', VerifyToken, (req, res, next) => {
    if (!req._admin) {
        return res.status(403).json({ 'error': 'Not enough priviledges' });
    }
    AdminModel
        .find({})
        .then(doc => {
            if (doc.length !== 0) {
                return res.status(200).json(doc);
            } else {
                return res.status(204).json({ 'status': 'No users to fetch' });
            }
        })
        .catch(err => {
            return res.status(404).json({ 'error': 'Cannot fetch any users' });
        });
});

/** Tested */
router.get('/user/:id', VerifyToken, (req, res, next) => {
    if (!req._admin) {
        return res.status(403).json({ 'error': 'Not enough priviledges' });
    }
    AdminModel
        .find({ _id: req.params.id })
        .then(doc => {
            return res.status(200).json(doc);
        })
        .catch(err => {
            return res.status(404).json({ 'status': 'User not found' });
        });
});

/** Tested */
router.put('/user/:id', VerifyToken, (req, res, next) => {
    if (!req._admin) {
        return res.status(403).json({ 'error': 'Not enough priviledges' });
    }
    AdminModel.findOneAndUpdate(
        { _id: req.params.id }, { username: req.body.username }, { new: true }).then(doc => {
            return res.status(200).json(doc);
        }).catch(er => {
            return res.status(404).json({ 'status': 'User not found' });
        });
});

/** Tested */
router.delete('/user/:id', VerifyToken, (req, res, next) => {
    if (!req._admin) {
        return res.status(403).json({ 'error': 'Not enough priviledges' });
    }
    AdminModel.findOneAndDelete(
        { _id: req.params.id }).then(doc => {
            return res.status(200).json(doc);
        }).catch(er => {
            return res.status(404).json({ 'status': 'User not found' });
        });
});

module.exports = router