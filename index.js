require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const bodyParser = require("body-parser");
const dns = require("dns");
const { URL } = require("url");
const mongoose = require("mongoose");

// Basic Configuration
const port = process.env.PORT || 3000;
mongoose.connect(process.env.URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

var urlSchema = new mongoose.Schema({
  url: String,
  shortUrl: Number,
});

var Url = mongoose.model("URL", urlSchema);

// Your first API endpoint
app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});

app.post("/api/shorturl/", function (req, res) {
  original_url = req.body.url;

  if (
    !original_url.startsWith("http://") &&
    !original_url.startsWith("https://")
  ) {
    res.json({ error: "invalid url" });
    return;
  }

  Url.findOne({ url: original_url })
    .then((data) => {
      if (data) {
        original_url = data.url;
        shortUrl = data.shortUrl;
        res.json({ original_url: original_url, short_url: shortUrl });
      }
    })
    .catch((err) => {
      if (err) {
        parsed_url = new URL(original_url).hostname;

        dns.lookup(parsed_url, (err) => {
          if (err) {
            res.json({ error: "invalid url" });
          } else {
            short_url = Math.floor(Math.random() * 1000000);
            res.json({ original_url: original_url, short_url: short_url });
            var data = new Url({
              url: original_url,
              shortUrl: short_url,
            });
            data.save();
          }
        });
      }
    });
});

app.get("/api/shorturl/:shortUrl", function (req, res) {
  shortUrl = req.params.shortUrl;
  Url.findOne({ shortUrl: shortUrl })
    .then((data) => {
      if (data) {
        res.redirect(data.url);
      }
    })
    .catch((err) => {
      if (err) {
        res.json({ error: "invalid url" });
      }
    });
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
