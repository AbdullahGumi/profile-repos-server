const express = require("express");
const bodyParser = require("body-parser");
const serverless = require("serverless-http");
const axios = require("axios");
const { client_id, client_secret } = require("../config");

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.json({ type: "text/*" }));
app.use(bodyParser.urlencoded({ extended: false }));

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

app.post("/authenticate", (req, res) => {
  const { code } = req.body.code;

  axios({
    method: "post",
    url: `https://github.com/login/oauth/access_token?client_id=${client_id}&client_secret=${client_secret}&code=${code}`,
    headers: {
      accept: "application/json",
    },
  })
    .then((response) => {
      axios({
        method: "get",
        url: "https://api.github.com/user",
        headers: {
          Authorization: `token ${response.data.access_token}`,
        },
      })
        .then((response) => {
          res.json(response.data);
        })
        .catch((err) => console.log(err));
    })
    .catch((e) => console.log(e));
});

const PORT = process.env.SERVER_PORT || 9000;
app.listen(PORT, () => console.log(`Listening on ${PORT}`));

module.exports.handler = serverless(app);
