let mongoose = require('mongoose');
mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false);

class Database {
    constructor() {
        this.connectToMongo()
    }

    connectToMongo() {
        mongoose.connect('mongodb://localhost:27017/posdb', { useNewUrlParser: true });
    }
}

module.exports = new Database()