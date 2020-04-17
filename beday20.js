/********************************************************
 *************** REQUIRED DEPENDENCIES *****************/
const bcrypt = require("bcrypt");
const express = require("express");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const dbUrl = `mongodb://localhost:27017/ecx`;
const saltRounds = 12;
/*********************************************************************
 *************** INITIALISATION OF USEFULL VARIABLEs*****************/
const app = express();
const JWT_KEY = process.env.JWT_KEY || "30_DAYSOF_CODE@_DSC_@2020";
const PORT = process.env.PORT || 3000;

/*********************************************************************
 *************** USER SCHEME  *****************/
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: "true",
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    required: true,
    unique: true,
    validate: (value) => {
      if (!validateInput(null, "email")(value)) {
        throw new Error("inavlid Email");
      }
    },
  },
  password: {
    type: String,
    required: true,
    minLength: 5,
  },
  tokens: [
    {
      token: {
        type: String,
        required: true,
      },
    },
  ],
  names: {
    type: Array,
    default: [],
  },
  occupation: {
    type: String,
    trim: true,
    lowercase: true,
    default: "not stated",
  },
  time: {
    type: String,
    required: true,
  },
  lastLogin: {
    type: String,
    default: "never",
  },
  date: {
    type: String,
    required: true,
  },
  tokenLife: {
    type: Number,
    default: 600,
  },
});
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, saltRounds);
  }
  next();
});
userSchema.methods.generateAuthToken = async function () {
  const token = jwt.sign({ _id: this.email }, JWT_KEY, {
    expiresIn: this.tokenLife,
  });
  this.tokens = this.tokens.concat({ token });
  this.save();
  return token;
};
userSchema.statics.getByValidCredentials = async (username, password) => {
  const user = await User.findOne({
    $or: [{ email: username }, { name: username }],
  });
  if (!user) {
    throw "user not found, please signup or check login details";
  }
  const passwordVerify = await bcrypt.compare(password, user.password);
  if (!passwordVerify) {
    throw "password is invalid";
  }
  return user;
};

const User = mongoose.model("User", userSchema);
/*********************** DATABASE CONNECTION**************************************** */
function connectDb() {
  mongoose
    .connect(dbUrl, { useUnifiedTopology: true }) //{ useUnifiedTopology: true } was passed to monitor mongo server, you can remove it
    .then(() => console.log("DATABASE CONNECTED"))
    .catch((err) => console.log("DB connection error!"));
  mongoose.connection.on("error", (err) =>
    console.error.bind(console, "DB connection error!")
  );
  mongoose.connection.on(
    "disconected",
    console.error.bind(console, "DATABASE DISCONNECTED")
  );
  process.on("SIGINT", () => {
    console.log(
      "mongoose default connection is disconnected due to application termination"
    );
    process.exit(0);
  });
}

/********************************************************
 *************** HELPER FUNCIONS *****************/
function validateInput(arr, expose) {
  let error = "";
  const validatePassword = (password) => {
    if (password.length < 5) {
      error += "password must be a minimum of 5 characters, ";

      return false;
    }
    return true;
  };
  const validateEmail = (email) => {
    let mailFormat = /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/;
    if (!mailFormat.test(email)) {
      error += "invalid email format";
      return false;
    }
    return true;
  };
  const validateUsername = (username) => {
    //only check for length
    if (username == "" || typeof username == "undefined") {
      error += "invalid username";
      return false;
    }
    return true;
  };
  if (arr) {
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
  }
  if (expose) {
    switch (expose) {
      case "all":
        return { validatePassword, validateEmail, validateUsername };
        break;
      case "password":
        return validatePassword;
        break;
      case "email":
        return validateEmail;
        break;
      case "username":
        return validateUsername;
        break;
      default:
        console.error({ error: "please use email,password,username or all" });
        break;
    }
  }
  return error;
}

/********************************************************
 *************** MIDDLEWARES *****************/
const authoriser = async (req, res, next) => {
  let token = req.header("Authorization");
  if (token) {
    token = token.replace("Bearer ", "");
  } else {
    return res
      .status(401)
      .json({ AUTH: false, message: "Not authorized to access this resource" });
  }
  //i would have loved to use the callback but i was avoiding too much callback
  //so i used try..catch instead
  try {
    const sender = jwt.verify(token, JWT_KEY);
    const user = await User.findOne({ email: sender._id });

    //token must match the user, if not prevent access
    if (!user || req.body.email != user.email) {
      throw "Not authorized to access this resource";
    }
    const { name, email, signedUp_at, date, time } = user;
    const day = new Date(signedUp_at);
    req.user = { _id: user._id, name, email, date, time };
    req.token = token;
    next();
  } catch (error) {
    if (error.message.startsWith("jwt")) {
      error = error.message.replace("jwt", "token");
    }
    return res.status(401).json({ AUTH: false, error });
  }
};

/************************************************
 *************** APP PROCESS  *****************/
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
/****************LOGIN ROUTE ****************************/
app.post("/login", async (req, res) => {
  const username = req.body.username || req.body.email;
  try {
    const user = await User.getByValidCredentials(username, req.body.password);

    if (!user) {
      throw "invalid credentials";
    }
    const day = new Date();
    user.lastLogin = `${day.getDate()}-${
      day.getMonth() + 1
    }-${day.getFullYear()}-${day.toLocaleTimeString()}`;
    const token = await user.generateAuthToken(); //lol generate token automatically saves the user
    return res.json({
      AUTH: "true",
      token,
      message: "you have been succesfully logged in",
    });
  } catch (err) {
    return res.status(401).json({
      success: "false",
      err,
    });
  }
});

/**************** SIGN UP ROUTES ****************************/

app.post("/signup", async (req, res) => {
  const errors = validateInput([
    { type: "password", value: req.body.password },
    { type: "username", value: req.body.username },
  ]);
  if (errors) {
    return res.json({ success: "false", errors });
  }
  //check if user already exists

  try {
    const existingUser = await User.findOne({
      $or: [{ email: req.body.email }, { name: req.body.username }],
    });
    if (existingUser) {
      throw "user already exists";
    }
    const day = new Date();
    const { username, email, password, names, occupation } = req.body;
    const user = new User({
      name: username,
      email,
      password,
      signedUp_at: day.toLocaleString(),
      date: `${day.getDate()}-${day.getMonth() + 1}-${day.getFullYear()}`,
      time: day.toLocaleTimeString(),
      names,
      occupation,
    });
    const itSaved = await user.save();
    if (!itSaved) throw "could not create user";
    const token = await user.generateAuthToken();
    return res.json({
      success: "true",
      message: "Account has been succesfully registered",
    });
  } catch (err) {
    return res.json({
      success: "false",
      error: err,
    });
  }
});

app.get("/user/profile", authoriser, (req, res) => {
  res.json(req.user);
});

app.get("/users", async (req, res) => {
  try {
    const users = await User.find({}, { tokens: 0, tokenLife: 0 });
    res.json({ success: true, users });
  } catch (err) {
    res.json({ success: false, error: err });
  }
});
//update by id in params
app.put("/user/update/:id", async (req, res) => {
  //validate entries
  if (
    req.body.password &&
    !validateInput(null, "password")(req.body.password)
  ) {
    return res.status(401).json({ success: false, error: "invalid password" });
  }
  if (
    req.body.username &&
    !validateInput(null, "username")(req.body.username)
  ) {
    return res.status(401).json({ success: false, error: "invalid username" });
  }
  if (req.body.email && !validateInput(null, "email")(req.body.email)) {
    return res.status(401).json({ success: false, error: "inavlid email" });
  }
  if (req.body.password) {
    req.body.password = await bcrypt.hash(req.body.password, saltRounds);
  }

  try {
    //save user with valid entries
    const user = await User.findOne({ _id: req.params.id });
    if (!user) {
      throw "user does not exist";
    }
    if (req.body.username || req.body.email) {
      const existingUser = await User.find({
        $and: [
          { $or: [{ email: req.body.email }, { name: req.body.username }] },
          { _id: { $ne: user._id } },
        ],
      });
      if (existingUser.length > 0) {
        throw "user with credential already exist";
      }
    }
    user.name = req.body.username || user.name;
    user.email = req.body.email || user.email;
    user.password = req.body.password || user.password;
    user.names = req.body.names || user.names;
    const test = await user.save();
    if (!test) {
      throw "could not update user";
    }
    return res.json({
      success: true,
      user: {
        _id: test._id,
        email: test.email,
        username: test.name,
        date: test.date,
        time: test.time,
        names: test.names,
      },
      message: "user updated succesfully",
    });
  } catch (err) {
    res.json({ success: false, error: err });
  }
});
//delete by id in params
app.delete("/user/delete/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndDelete({ _id: req.params.id });
    if (!user) {
      throw `user ${req.params.id} could not be deleted`;
    }
    return res.json({
      success: true,
      message: `user ${user.name} was deleted successfully`,
    });
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: err,
    });
  }
});
app.get("/users/getuser/:id", (req, res) => {
  User.findById({ _id: req.params.id })
    .then((user) => {
      const { _id, email, name, names, occupation, lastLogin } = user;
      res.json({
        success: true,
        _id,
        email,
        name,
        names,
        occupation,
        lastLogin,
      });
    })
    .catch((err) => {
      return res.status(401).json({
        success: false,
        error: `could not get user ${req.params.id} `,
      });
    });
});
/**************** run APP ****************************/
app.listen(PORT, () => {
  console.log(`app is running on port ${PORT}`);
  connectDb();
});
