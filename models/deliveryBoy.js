const mongoose = require('mongoose');
const { assignOrder } = require('../controllers/adminController');

const deliveryBoySchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    phoneNumber: { type: Number, required: true, unique: true },
    password: { type: String, required: true },
    vehicleType: { type: String, enum: ['bike', 'car', 'scooter'], required: true },
    vehicleNumber: { type: String, required: true, unique: true },
    role: { type: String, enum: ['deliveryBoy'], default: 'deliveryBoy' },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    deliveryArea: { type: String, required: true },
    assignedOrders: { type: [mongoose.Schema.Types.ObjectId], ref: 'Order', default: [assignOrder] },
    profileImage: { type:String  },
    chat: [
            {
                senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'DeliveryBoy' },
                receiverId: { type: mongoose.Schema.Types.ObjectId }, // or User
                message: { type: String, required: true },
                profileImage: { type: String, default: "" }, 
                timestamp: { type: Date, default: Date.now }
            }
        ]
});

const DeliveryBoy = mongoose.model('DeliveryBoy', deliveryBoySchema);
module.exports = DeliveryBoy;
