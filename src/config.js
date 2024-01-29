const mongoose = require("mongoose");

const connect = mongoose.connect("mongodb://localhost:27017/Hangman", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Check connection
connect.then(() => {
  console.log("Database connected Successfully");
}).catch((err) => {
  console.log("Database cannot be connected", err);
});

// Create a schema
const LoginSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  points: {
    type: Number,
    default: 0
  }
});

// Create a model based on the schema
const User = mongoose.model("Users", LoginSchema);

module.exports = User;
