require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

mongoose.connect("mongodb://localhost:27017/flipkart_data", {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log(" Connected to MongoDB"))
.catch(err => console.error(" MongoDB error:", err));

app.use(cors());
app.use(express.json());

app.use("/deliveryBoyProfile", express.static(path.join(__dirname, "deliveryBoyProfile")));

app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use("/api/admins", require("./routes/adminRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/deliveryBoys", require("./routes/deliveryBoyRoutes"));

io.on("connection", (socket) => {
  console.log(" Socket connected:", socket.id);

  socket.on("chatMessage", (data) => {
    console.log(" Received message:", data);
    io.emit("chatMessage", data);
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
