const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    userId:{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    products:[
    {
        productId:{ type: Number },
        stock:{ type: Number, required: true, min:1 },
    },
    ],
    totalAmount:{ type: Number, required: true },
    address:{type:String,required:true},
    status: {
    type: String,
    enum: ["Pending", "Assigned", "Processing", "OutForDelivery", "Delivered", "Cancelled"],
    default: "Pending"
    },
    orderTracking:{ type: [String], default: ['outofdelivery', 'intransit', 'delivered'] },
    deliveryBoysId:{ type: mongoose.Schema.Types.ObjectId, ref: 'DeliveryBoy', default: null },
    paymentStatus:{ type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
    orderDate:{ type: Date, default: Date.now },
    deliveryDate:{ type: Date },
});

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;