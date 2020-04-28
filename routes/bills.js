const express = require('express');

const router = express.Router();

const User = require('../models/user')
const Bill = require('../models/bill')
const Receipt = require('../models/receipt')

const createErrormessage = (status, message, code) => {
    return ({
            "status"  : status,
            "success" : false,
            "error" : {
                "code"        : code,
                "title"       : message,
                "traceID"     : "",
                "description" : message,
                "param"       : "",
                "docURL"      : "",
            }
        })
}

router.post('/fetch',async (req,res) => {
    const mobileNumber = req.body.customerIdentifiers[0].attributeValue;
    User.findOne({ mobileNumber : mobileNumber}, async (err,user) => {
        console.log(user)
        if(user) {
            const userId = user._id
            const bills = await Bill.find({ user : userId });
            // customer exists
            if(bills.length >= 0) {
                const billFetchStatus = bills.filter(a => a.outstandingAmount > 0 ).length == 0 ? "NO_OUTSTANDING" : "AVAILABLE";
                let finalBillArray = [];
                bills.filter(a => a.outstandingAmount > 0 ).map(singleBill => {
                    const billFormat = {
                                    "billerBillID"    : singleBill._id,
                                    "generatedOn"     : singleBill.generatedOn,
                                    "recurrence"      : singleBill.recurrence,
                                    "amountExactness" : singleBill.amountExactness,
                                    "customerAccount" : {
                                        "id" : user._id
                                    },
                                    "aggregates" : {
                                        "total" : {
                                            "displayName" : "Total Outstanding",
                                            "amount" : {
                                                "value" : singleBill.outstandingAmount
                                            }
                                        }
                                    }
                                }
                    finalBillArray.push(billFormat)
                });
            

                res.send({
                    "status" : 200,
                    "success": true,
                    "data"   : {
                        "customer" : {
                            "name" : user.name
                        },
                        "billDetails" : {
                            "billFetchStatus" : billFetchStatus,
                            "bills"           : finalBillArray
                    }
                }
                });
            }

        } else {

            res.status(404).json({
            "status"  : 404,
            "success" : false,
            "error" : {
                "code"        : "customer-not-found",
                "title"       : "Customer not found",
                "traceID"     : "",
                "description" : "The requested customer was not found in the biller system.",
                "param"       : "",
                "docURL"      : "",
            }
        });
        }
    }) 
})


router.post('/fetchReceipt',async (req,res) => {
    console.log(req.body);
    Bill.findById(req.body.billerBillID, async (err,bill) => {
        if(bill) {
            const newReceipt = new Receipt({
                billerBillID: req.body.billerBillID,
                platformBillID: req.body.platformBillID,
                platformTransactionRefID: req.body.paymentDetails.platformTransactionRefID,
                amountPaid: req.body.paymentDetails.amountPaid.value,
            });
            try {
                const rep = await newReceipt.save();
                try{ 
                    const updatedBill = await Bill.updateOne(
                        { _id: req.body.billerBillID },
                        { $set: { outstandingAmount: ( bill.outstandingAmount - req.body.paymentDetails.amountPaid.value)}}

                    );

                    res.send({
                    "status"  : 200,
                    "success" : true,
                    "data" : {
                        "billerBillID"             : rep.billerBillID,
                        "platformBillID"           : rep.platformBillID,
                        "platformTransactionRefID" : rep.platformTransactionRefID,
                        "receipt" : {
                            "id"   : rep.id,
                            "date" : rep.date,
                        }
                    }
                })

                } catch(err){
                    res.status(500).json(createErrormessage(500, err, 'server-error'));
                }
            } catch(err) {
                res.status(500).json(createErrormessage(500, err, 'server-error'));

            }
        } else {
            res.status(404).json(createErrormessage(404, 'bill not found', 'bill-not-found'));
        }
    })
});

module.exports = router;