const mongoose = require("mongoose");
const Schema = mongoose.Schema;

//Create Schema
const CustomerSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  // customerdir: {
  //   type: String,
  //   required: true
  // },
  serverip: {
    type: String,
    required: true
  },
  packagename: {
    type: String,
    required: true
  },
  privatekeypath: {
    type: String,
    required: true
  }
});

module.exports = Customer = mongoose.model("customers", CustomerSchema);
