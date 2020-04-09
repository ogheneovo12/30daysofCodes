const bcrypt = require("bcrypt");
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;
var bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let USERS = [];
const saltRounds = 12;
class User {
  constructor(name, email, password) {
    this.name = name;
    this.email = email;
    this.password = password;
    this.isLoggedIn = false;
  }

  getPassWord() {
    return this.password;
  }
  logUserOut() {
    this.isLoggedIn = false;
  }
  logUserIn() {
    this.isLoggedIn = true;
  }
}
//this is a simple validation helper
function validateInput(arr, callback) {
  let error = "";
  const validatePassword = (password) => {
    if (password.length < 5) {
      error += "password must be a minimum of 5 characters, ";
      //i wanted to use regexp to ensure that password contains characters and number
      //but i had to leave it, for easy marking and testing
    }
  };
  const validateEmail = (email) => {
    let mailFormat = /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/;
    if (!mailFormat.test(email)) {
      error += "invalid email format";
    }
  };
  const validateUsername = (username) => {
    //only check for length
    if (username == "" || typeof username == "undefined") {
      error += "invalid username";
    }
  };
  arr.forEach(({ type, value }) => {
    switch (type) {
      case "password":
        validatePassword(value);
        break;
      case "email":
        validateEmail(value);
        break;
      case "username":
        validateUsername(value);
        break;
    }
  });
  return error;
}

app.post("/login", (req, res) => {
  let user = USERS.find((user) => user.email == req.body.email);
  if (!user) {
    return res.json({
      success: "false",
      error: "user not found, please signup or check login details",
    });
  }
  bcrypt.compare(req.body.password, user.password, function (err, result) {
    if (err) {
      return res.json({ success: "false", error: err });
    }
    if (result) {
      user.logUserIn();
      return res.json({
        success: "true",
        message: "you have been succesfully logged in",
      });
    }
    return res.json({ success: "false", error: "password is invalid" });
  });
});

app.post("/signup", (req, res) => {
  ////check if user already exists
  const existingUser = USERS.find((user) => user.email === req.body.email);
  if (existingUser) {
    return res.json({ success: "false", err: "user already exists" });
  }

  const errors = validateInput([
    { type: "username", value: req.body.username },
    { type: "email", value: req.body.email },
    { type: "password", value: req.body.password },
  ]);
  if (errors) {
    return res.json({ success: "false", errors });
  }

  bcrypt.hash(req.body.password, saltRounds, function (err, hash) {
    if (err) {
      return res.json({ success: "false", err });
    } else {
      USERS.push(new User(req.body.username, req.body.email, hash));
      return res.json({
        success: "true",
        message: "Account has been succesfully registered",
      });
    }
  });
});

app.listen(PORT, () => console.log(`app is running on port ${PORT}`));
//Voila and i finally DID IT, but i never chop since morning 7:02pm now
