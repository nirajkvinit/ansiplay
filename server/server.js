const express = require("express");
const bodyParser = require("body-parser");
const ansible = require("./routes/api/ansible");

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get("/", (req, res) =>
  res.send("Welcome to ANSIPLAY - MSRIT Server Automation System")
);

app.use("/api/ansible", ansible);

const port = process.env.PORT || 8080;

app.listen(port, () => console.log(`Server running on port ${port}`));

app.post("/", (req, res) => {
  console.log(req.body);
  res.json({ action: "success", body: req.body, query: req.query });
});
