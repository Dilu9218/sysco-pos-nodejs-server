var express = require('express');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var config = require('../auth/config');
var router = express.Router();

var UserModel = require('../database/models/user.model');

/** 
 * Registers a new user with the system
 * @see https://app.swaggerhub.com/apis/CloudyPadmal/Sysco-POS/1.0.1#/user/user_register
 */
router.post('/register', function (req, res) {
    if (req.body.username && req.body.password) {
        var pwd_hashed = bcrypt.hashSync(req.body.password, 10);
        let u = new UserModel({
            username: req.body.username,
            password: pwd_hashed,
            isAdmin: false
        });
        u.save().then(savedUser => {
            return res.status(200).send({ 'status': 'User created successfully' });
        }).catch(err => {
            return res.status(409).json({ 'error': 'Duplicate user name' });
        });
    } else {
        return res.status(406).json({ 'error': 'User data missing' });
    }
});

/** 
 * Logs user in with correct username and password
 * @see https://app.swaggerhub.com/apis/CloudyPadmal/Sysco-POS/1.0.1#/user/user_login
 * */
router.post('/login', function (req, res) {
    if (req.body.username && req.body.password) {
        UserModel.findOne({ username: req.body.username }).then(user => {
            if (!user) {
                return res.status(404).json({ 'error': 'No user with provided username' });
            }
            if (!bcrypt.compareSync(req.body.password, user.password)) {
                return res.status(401).json({ 'error': 'Incorrect password' });
            }
            var token = jwt.sign({ id: user._id }, config.secret, {
                expiresIn: (24 * 60 * 60)
            });
            return res.status(200).json({ 'status': 'Logged in successfully', token: token });
        });
    } else {
        res.status(406).json({ 'error': 'User data missing' });
    }
});

module.exports = router