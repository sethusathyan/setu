const mongoose = require('mongoose');

const receiptSchema = mongoose.Schema({
    platformBillID: {
        type: String,
        required : true
    },
    platformTransactionRefID: {
        type: String,
        required : true
    },
    billerBillID: {
        type: mongoose.Schema.Types.ObjectId ,
        required : true,
    },
    date : {
        type: Date,
        default: Date.now
    },
    amountPaid: {
        type: Number,
        required: true,
    }
});

module.exports = mongoose.model('Receipt',receiptSchema)