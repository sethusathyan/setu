const mongoose = require('mongoose');

const BillSchema = mongoose.Schema({
    outstandingAmount: {
        type: Number,
    },
    recurrence: {
        type: String
    },
    amountExactness: {
        type: String
    },
     generatedOn: {
        type: Date,
        required : true,
        default : Date.now

    }, 
    amount: {
        type: Number,
        required : true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId ,
        required : true,
    },
    
});

module.exports = mongoose.model('Bills',BillSchema)