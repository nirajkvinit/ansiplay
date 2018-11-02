const express = require("express");
const router = express.Router();
const os = require("os");
const fs = require("fs");
const yaml = require("write-yaml");
const path = require("path");

//load input validation for login route
const validateCustomerInput = require("../../validation/customer");

//Load Customer Model
const Customer = require("../../models/Customer");
const keys = require("../../config/keys");

// @route   POST api/customers/
// @desc    Create Customer route
// @access  Public
router.post("/", (req, res) => {
  const { errors, isValid } = validateCustomerInput(req.body);
  const homedir = os.homedir();

  // @TODO: Auto fill customer's directory name with the customer name if it is not available

  // check validation
  if (!isValid) {
    return res.status(400).json(errors);
  }

  Customer.findOne({ name: req.body.name })
    .then(customer => {
      if (customer) {
        errors.name = "Customer already exist";
        return res.status(400).json(errors);
      } else {
        const newCustomer = new Customer({
          name: req.body.name,
          // customerdir: req.body.customerdir,
          serverip: req.body.serverip,
          packagename: req.body.packagename,
          privatekeypath: req.body.privatekeypath
        });

        newCustomer
          .save()
          .then(customer => {
            // create customer dir
            const customerDir = path.join(homedir, customer.name);
            console.log(customerDir);

            if (!fs.existsSync(customerDir)) {
              fs.mkdirSync(customerDir);
            }
            return customer;
          })
          .then(customer => {
            // Create SERVER DETAILS FILE and add ip address
            const serverFilePath = path.join(
              homedir,
              customer.name,
              "SERVER_DETAILS"
            );
            fs.writeFile(serverFilePath, customer.serverip, function(err) {
              if (err) throw err;
            });
            return customer;
          })
          .then(customer => {
            // Create vars.yml file
            // const varsYamlFilePath = `${homedir}/${customer.name}/vars.yml`;
            const varsYamlFilePath = path.join(
              homedir,
              customer.name,
              "vars.yml"
            );
            const varsData = {
              package: customer.packagename,
              private: customer.privatekeypath
            };

            yaml(varsYamlFilePath, varsData, function(err) {
              if (err) throw err;
            });

            return customer;
          })
          .then(customer => {
            //get files and upload to the server
            console.log(req.files);
            return customer;
          })
          .then(customer => res.json(customer))
          .catch(err => console.log(err));
      }
    })
    .catch(error => {
      console.log(error);
      return res.status(400).json(error);
    });
});

// @route   GET api/customers
// @desc    Get all Customers
// @access  Public
router.get("/", (req, res) => {
  Customer.find()
    .then(customers => {
      return res.json(customers);
    })
    .catch(err =>
      res.status(404).json({ nocustomerfound: "No Customer found" })
    );
});

module.exports = router;
