const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;
let data = [];
const isPalindrome = (str) =>
  str.split("").reverse().join("") === str ? true : false;

var bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/getpali", (req, res) => {
  res.json({ confirmation: "success", words: data.words });
});
app.post("/send", (req, res) => {
  console.log(req.body);
  if (req.body.words instanceof Array) {
    const palindrome = req.body.words.filter((str) => isPalindrome(str));
    if (palindrome.length > 0) {
      data = { words: palindrome };
    }
  }
  res.json({ confirmation: "success" });
});

app.listen(PORT, () => console.log(`app is running on port ${PORT}`));
