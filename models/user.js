const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    mobileNumber: {
        type: Number,
        required : true
    },
    name: {
        type: String,
        required : true
    }
});

module.exports = mongoose.model('Users',userSchema)