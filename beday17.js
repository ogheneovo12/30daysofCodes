const bcrypt = require("bcrypt");
const express = require("express");
const app = express();
const JWT_KEY = process.env.JWT_KEY || "30_DAYSOF_CODE@_DSC_@2020";
const PORT = process.env.PORT || 3000;
const jwt = require("jsonwebtoken");
var bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let USERS = [];
const saltRounds = 12;
class User {
  constructor(name, email, password, token) {
    this.name = name;
    this.email = email;
    this.password = password;
    this.isLoggedIn = false;
    this.tokens = [];
    this.tokenLife = 5 * 60; //5 minutes
    this.signedUp_at = new Date().toLocaleString();
  }
  generateAuthToken() {
    const token = jwt.sign({ _id: this.email }, JWT_KEY, {
      expiresIn: this.tokenLife,
    });
    this.tokens = this.tokens.concat({ token });
    return token;
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
/************************************************
 *************** MIDDLE WARES *****************/
const authoriser = (req, res, next) => {
  let sender = {};
  let token = req.header("Authorization");
  if (token) {
    token = token.replace("Bearer ", "");
  } else {
    return res
      .status(401)
      .send({ AUTH: false, message: "Not authorized to access this resource" });
  }
  //i would have loved to use the callback but i was avoiding too much callback
  //so i used try..catch instead
  try {
    sender = jwt.verify(token, JWT_KEY);
  } catch (error) {
    if (error.message.startsWith("jwt")) {
      error.message = error.message.replace("jwt", "token");
    }
    return res.status(401).send({ AUTH: false, message: error.message });
  }
  const user = USERS.find(
    (user) =>
      user.email == sender._id && user.tokens.filter((tk) => tk.token == token)
  );
  //token must match the user, if not prevent access
  if (!user || req.body.email != user.email) {
    return res
      .status(401)
      .send({ AUTH: false, error: "Not authorized to access this resource" });
  }
  const { name, email, signedUp_at } = user;
  req.user = { name, email, signedUp_at };
  req.token = token;
  next();
};

/************************************************
 *************** SIMPLY_ROUTERS  *****************/

app.post("/login", (req, res) => {
  let user = USERS.find(
    (user) => user.name == req.body.username || user.email == req.body.email
  );
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
      const token = user.generateAuthToken();
      return res.json({
        AUTH: "true",
        token,
        message: "you have been succesfully logged in",
      });
    }
    return res.json({ success: "false", error: "password is invalid" });
  });
});

app.post("/signup", (req, res) => {
  ////check if user already exists
  const existingUser = USERS.find(
    (user) => user.email == req.body.email || user.name == req.body.username
  );
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
      const user = new User(req.body.username, req.body.email, hash);
      USERS.push(user);
      return res.json({
        success: "true",
        message: "Account has been succesfully registered",
      });
    }
  });
});
app.get("/user/profile", authoriser, (req, res) => {
  res.json(req.user);
});
app.listen(PORT, () => console.log(`app is running on port ${PORT}`));
//Voila and i finally DID IT, but i never chop since morning 7:02pm nowno
