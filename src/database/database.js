let mongoose = require('mongoose');
mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false);

class Database {
    constructor() {
        this.connectToMongo()
    }

    connectToMongo() {
        mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true })
            .then(res => { });
    }
}

module.exports = new Database();
/***************************************************************************************************
 * 'mongodb://localhost:27017/posdb'
 * 'mongodb+srv://Padmal:abcd@1234@syscoposcluster-triov.mongodb.net/test?retryWrites=true'
 **************************************************************************************************/