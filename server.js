require("dotenv").config();
const mongoose= require('mongoose');
const express = require("express");
const cors = require("cors");


const app = express();

mongoose.connect('mongodb://localhost:27017/flipkart_data', { 
    useNewUrlParser: true, 
    useUnifiedTopology: true
})
.then(()=>console.log('Connected to MongoDB'))
.catch(err=>console.error('Error connecting to MOngoDB',err));

app.use(cors());
app.use(express.json());

// Routes
const adminRoutes = require("./routes/adminRoutes");
app.use("/api/admins", adminRoutes);

const userRoutes = require("./routes/userRoutes");
app.use("/api/users", userRoutes);


const deliveryBoyRoutes=require("./routes/deliveryBoyRoutes");
app.use("/api/deliveryBoys", deliveryBoyRoutes);

const PORT=process.env.PORT || 5000;
app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
});
