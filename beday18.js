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
  signedUp_at: {
    type: Date,
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
  const user = await User.findOne({ email: sender._id });
  //token must match the user, if not prevent access
  if (!user || req.body.email != user.email) {
    return res
      .status(401)
      .send({ AUTH: false, error: "Not authorized to access this resource" });
  }
  const { name, email, signedUp_at } = user;
  req.user = { _id:user._id,name, email, joined: new Date(signedUp_at).toLocaleString() };
  req.token = token;
  next();
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
      return res.status(401).json({
        success: "false",
        error: "invalid credentials",
      });
    }
    const token = await user.generateAuthToken();
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
  //check if user already exists
  let existingUser = {};
  try {
    existingUser = await User.findOne({
      $or: [{ email: req.body.email }, { name: req.body.username }],
    });
  } catch (err) {
    return res.json({
      success: "false",
      error: "user already exists",
    });
  }
  if (existingUser) {
    return res.json({
      success: "false",
      err: "user already exists",
    });
  }
  const errors = validateInput([
    { type: "password", value: req.body.password },
    { type: "username", value: req.body.username },
  ]);
  if (errors) {
    return res.json({ success: "false", errors });
  }

  try {
    const { username, email, password } = req.body;
    const user = new User({
      name: username,
      email,
      password,
      signedUp_at: new Date().toLocaleString(),
    });
    await user.save();
    const token = await user.generateAuthToken();
    return res.json({
      success: "true",
      message: "Account has been succesfully registered",
    });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});
app.get("/user/profile", authoriser, (req, res) => {
  res.json(req.user);
});

/**************** run APP ****************************/
app.listen(PORT, () => {
  console.log(`app is running on port ${PORT}`);
  connectDb();
});
