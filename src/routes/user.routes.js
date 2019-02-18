var express = require('express');
var router = express.Router();
var UserModel = require('../database/models/user.model');

router.post('/login', (req, res) => {
    /* ToDoModel
        .find({})
        .then(doc => {
            res.status(200).json(doc);
        })
        .catch(err => {
            res.status(404).json({ 'error': 'Cannot find any todos' });
        }); */
});

router.get('/logout', (req, res) => {
    /* ToDoModel
        .find({})
        .then(doc => {
            res.status(200).json(doc);
        })
        .catch(err => {
            res.status(404).json({ 'error': 'Cannot find any todos' });
        }); */
});


module.exports = router