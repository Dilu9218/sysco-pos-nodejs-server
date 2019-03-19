var express = require("express");
var router = express.Router();
var AdminModel = require("../database/models/user.model");
var VerifyToken = require("../auth/verifytoken");

/** Tested */
router.post("/user/add", VerifyToken, (req, res, next) => {
    if (!req._admin) {
        return res.status(403).json({ "error": "Not enough priviledges" });
    }
    let t = new AdminModel(req.body);
    t.save().then(() => {
        return res.status(200).json({ "status": "User created" });
    }).catch(err => {
        if (err.name === "MongoError" && err.code === 11000) {
            return res.status(409).json({ "error": "Duplicate user name" });
        } else {
            return res.status(400).json({ "error": "Some fields are missing" });
        }
    });
});

/** Tested */
router.get("/users", VerifyToken, (req, res, next) => {
    if (!req._admin) {
        return res.status(403).json({ "error": "Not enough priviledges" });
    }
    AdminModel
        .find({})
        .then(doc => {
            return res.status(200).json(doc);
        });
});

/** Tested */
router.get("/user/:id", VerifyToken, (req, res, next) => {
    if (!req._admin) {
        return res.status(403).json({ "error": "Not enough priviledges" });
    }
    AdminModel
        .find({ _id: req.params.id })
        .then(doc => {
            return res.status(200).json(doc);
        })
        .catch(err => {
            return res.status(404).json({ "status": "User not found" });
        });
});

/** Tested */
router.put("/user/:id", VerifyToken, (req, res, next) => {
    if (!req._admin) {
        return res.status(403).json({ "error": "Not enough priviledges" });
    }
    AdminModel.findOneAndUpdate(
        { _id: req.params.id }, { username: req.body.username }, { new: true }).then(doc => {
            return res.status(200).json(doc);
        }).catch(er => {
            return res.status(404).json({ "status": "User not found" });
        });
});

/** Tested */
router.delete("/user/:id", VerifyToken, (req, res, next) => {
    if (!req._admin) {
        return res.status(403).json({ "error": "Not enough priviledges" });
    }
    AdminModel.findOneAndDelete(
        { _id: req.params.id }).then(doc => {
            return res.status(200).json(doc);
        }).catch(er => {
            return res.status(404).json({ "status": "User not found" });
        });
});

module.exports = router