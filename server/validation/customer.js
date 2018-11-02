const Validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = function validateCustomerInput(data) {
  let errors = {};

  data.name = !isEmpty(data.name) ? data.name : "";
  // data.customerdir = !isEmpty(data.customerdir) ? data.customerdir : "";

  data.serverip = !isEmpty(data.serverip) ? data.serverip : "";
  data.packagename = !isEmpty(data.packagename) ? data.packagename : "";
  data.privatekeypath = !isEmpty(data.privatekeypath)
    ? data.privatekeypath
    : "";

  if (Validator.isEmpty(data.name)) {
    errors.name = "Name field is required";
  }

  // if (Validator.isEmpty(data.customerdir)) {
  //   errors.customerdir = "Customers Directory field is required";
  // }

  if (Validator.isEmpty(data.serverip)) {
    errors.serverip = "IP Address field is required";
  }

  if (!Validator.isIP(data.serverip)) {
    errors.serverip = "IP Address is invalid";
  }

  if (Validator.isEmpty(data.packagename)) {
    errors.packagename = "Package Name field is required";
  }

  if (Validator.isEmpty(data.privatekeypath)) {
    errors.privatekeypath = "Privatekey path field is required";
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
