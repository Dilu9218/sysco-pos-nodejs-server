let mongoose = require('mongoose');
mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false);

class Database {
    constructor() {
        this.connectToMongo()
    }

    connectToMongo() {
        mongoose.connect('mongodb://localhost:27017/posdb', { useNewUrlParser: true })
        //mongoose.connect('mongodb+srv://Padmal:abcd@1234@syscoposcluster-triov.mongodb.net/test?retryWrites=true', { useNewUrlParser: true })
            .then(res => { })
            .catch(err => console.log(err));
    }
}

module.exports = new Database()