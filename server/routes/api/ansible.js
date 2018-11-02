const express = require("express");
const router = express.Router();
const os = require("os");
const fs = require("fs");
const yaml = require("write-yaml");
const path = require("path");
const serializeError = require("serialize-error");

const shell = require("shelljs");
const safeJsonStringify = require("safe-json-stringify");

const multer = require("multer");
const upload = multer({ dest: "uploads/" });

//load input validation for login route
const validateAnsibleInput = require("../../validation/ansible");

// @route   POST api/ansible/
// @desc    Create Customer route
// @access  Public
router.post("/", upload.single("playbookfile"), (req, res) => {
  const { errors, isValid } = validateAnsibleInput(req.body);
  const homedir = os.homedir();
  console.log("hitting api");
  console.log(res.body);
  // check validation
  if (!isValid) {
    return res.status(400).json({ error: errors });
  }

  const name = req.body.name;
  const serverip = req.body.serverip;
  const packagename = req.body.packagename;
  const privatekeypath = req.body.privatekeypath;

  const customerDir = path.join(homedir, name);

  const uploadedFile = req.file;

  let serverDetailsFilePath = null;
  let playbookFilename = null;

  createCustomerDirectory(customerDir)
    .then(req => {
      // Create SERVER DETAILS FILE and add ip address
      serverDetailsFilePath = path.join(homedir, name, "SERVER_DETAILS");
      fs.writeFile(serverDetailsFilePath, serverip, function(err) {
        if (err) throw err;
      });
    })
    .then(() => {
      // Create vars.yml file
      const varsYamlFilePath = path.join(homedir, name, "vars.yml");
      const varsData = {
        PACKAGE_NAME: packagename,
        PRIVATE_KEY_PATH: privatekeypath
      };

      yaml(varsYamlFilePath, varsData, function(err) {
        if (err) throw err;
      });
    })
    .then(() => {
      // get the uploaded file and store in the directory

      if (uploadedFile) {
        let { originalname, filename } = uploadedFile;
        playbookFilename = path.join(homedir, name, originalname);
        filename = path.join("uploads", filename);

        fs.rename(filename, playbookFilename, err => {
          if (err) throw err;
        });
      } else {
        throw new Error(
          "Playbook File was not provided! Please upload the playbook file."
        );
      }
      return playbookFilename;
    })
    .then(playbookFilename => {
      // create shell script command
      let shellCommand = `ansible-playbook -i ${serverDetailsFilePath} ${playbookFilename}`;
      const serverFilePath = path.join("uploads", "shellcommand");
      fs.writeFile(serverFilePath, shellCommand, function(err) {
        if (err) throw err;
      });
    })
    .then(() =>
      res.json({ success: "Files were created and uploaded successfully!" })
    )
    .catch(err => {
      const newerror = serializeError(err);
      errors.error = newerror.message;

      return res.status(400).json(errors);
    });
});

function createCustomerDirectory(path) {
  return new Promise(function(resolve, reject) {
    if (!fs.existsSync(path)) {
      fs.mkdir(path, { recursive: true }, err => {
        if (err) {
          reject(err);
        }
      });
    }
    resolve();
  });
}

// @route   POST api/ansible/run
// @desc    Run Ansible Playbook route
// @access  Public
router.post("/run", (req, res) => {
  const errors = {};

  let filename = path.join("uploads", "shellcommand");
  // console.log(filename);

  readAnsibleCommand(filename)
    .then(commandString => {
      console.log(commandString);
      shell.exec(commandString, { silent: true }, function(code, out, err) {
        if (code === 0) {
          return res.json({
            output: out
          });
        } else {
          return res.json({
            error: serializeError(err)
              .toString()
              .replace(/(\r\n\t|\n|\r\t)/gm, "")
          });
        }
      });
    })
    .catch(err => {
      let newerror = serializeError(err);
      console.log(newerror);

      // return res.status(400).json(errors);
      return res.status(400).json(err);
    });

  // return res.json({ success: "Running Command" });
});

function readAnsibleCommand(path) {
  console.log(path);
  return new Promise(function(resolve, reject) {
    if (fs.existsSync(path)) {
      // Read command file
      const data = fs.readFileSync(path, "utf8");
      resolve(data);
    } else {
      reject(
        new Error(
          "Command File could not be created! Please upload the playbook again."
        )
      );
    }
    resolve();
  });
}

module.exports = router;
