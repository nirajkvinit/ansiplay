const express = require("express");
const bodyParser = require("body-parser");
var cors = require("cors");

const ansible = require("./routes/api/ansible");

const app = express();

app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// app.use(function(req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header(
//     "Access-Control-Allow-Headers",
//     "Origin, X-Requested-With, Content-Type, Accept"
//   );
//   next();
// });

app.get("/", (req, res) =>
  res.send("Welcome to ANSIPLAY - MSRIT Server Automation System")
);

// app.post("/", (req, res) => {
//   console.log(req.body);
//   res.json({ action: "success", body: req.body, query: req.query });
// });

app.use("/api/ansible", ansible);

const port = process.env.PORT || 8080;

app.listen(port, () => console.log(`Server running on port ${port}`));
