let mongoose = require("mongoose");
require("dotenv").config();
mongoose.set("useCreateIndex", true);
mongoose.set("useFindAndModify", false);

class Database {
    constructor() {
        this.connectToMongo();
    }

    connectToMongo() {
        try {
            mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true })
                .then(res => { })
                .catch(err => {
                    /* istanbul ignore next */
                    console.error(err)
                });
        } catch (e) {
            /* istanbul ignore next */
            console.log("Hello, Database is not defined. Try the following command in console: export DATABASE_URL=mongodb://localhost:27017/posdb");
        }
    }
}

module.exports = new Database();
/***************************************************************************************************
 * "mongodb://localhost:27017/posdb"
 * "mongodb+srv://Padmal:abcd@1234@syscoposcluster-triov.mongodb.net/test?retryWrites=true"
 * export DATABASE_URL=mongodb://localhost:27017/posdb
 **************************************************************************************************/
