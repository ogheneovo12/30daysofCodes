const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;
var bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let data = {};
app.get("/", (req, res) => {
  res.send(`
    <h1>Welcome to my sgpa api calculator</h1>
   <p> please send data in this format</p>
    <p>{
            "courses":[{"course":maths, "units":3, "score":72},{"course":english, "units":2, "score":64}]
    }</p>
    <p>send data to /courses</p>
    <p>immediately after sending get your sgpa  from /sgpa</p>
  `);
});
let error = "";
const getpoints = (score, units, course) => {
  if (score > 70 && score <= 100) {
    return units * 5; //A 70 - 100
  } else if (score >= 60 && score < 70) {
    return units * 4; //B 60 - 69
  } else if (score >= 50 && score < 60) {
    return units * 3; //C 50 - 59
  } else if (score >= 45 && score < 50) {
    return units * 2; //D 45 - 49
  } else if (score >= 40 && score < 45) {
    return units * 1; // E 40 - 44
  } else if (score >= 0 && score < 40) {
    return 0; //F below 40
  } else {
    error =
      error +
      (course
        ? ` score ${score} for ${course} is out of range,`
        : ` the score ${score} is out of range`);
    return undefined;
  }
};

function getSgpa(data) {
  let sgpa = 0;
  if (data) {
    if (data.courses instanceof Array) {
      let totalUnits = data.courses.reduce(
        (courseCurr, courseAdj) => courseCurr.units + courseAdj.units
      );
      let totalPoints = data.courses.reduce(
        (courseCurr, courseAdj) =>
          getpoints(courseCurr.score, courseCurr.units, courseCurr.course) +
          getpoints(courseAdj.score, courseAdj.units, courseAdj.course)
      );
      sgpa = Math.ceil((totalPoints / totalUnits) * 100) / 100; //round up two decimal places
    }
  }
  return sgpa;
}

app.get("/sgpa", (req, res) => {
  const sgpa = getSgpa(data);

  /*
   $ This checks for different kind of possible errors $
    --> error in data format sent
    --> all unit zero entry(this might lead sgpa to be +/-Infinity)
*/
  if (typeof sgpa != "undefined" && sgpa !== null && !Number.isNaN(sgpa)) {
    res.json({ success: "true", sgpa });
  } else {
    res.json({
      success: "false",
      message:
        error ||
        "either no data have been passed, or the data format passed was incorrect, try reviewing your data,(note:at least 1 course unit must be greater than zero) try sending another data again",
    });
    error = "";
    data = {};
  }
});
app.post("/courses", (req, res) => {
  //check if request meets the data structure specification i.e if courses exist
  if (req.body.courses instanceof Array) {
    data = req.body;
    res.json({ success: "true", data: [data] });
  } else {
    res.json({
      success: "false",
      messgage:
        "courses must be more than one and  must be an array of objects(please refer to home to view format)",
    });
  }
});

app.listen(PORT, () => console.log(`app is running on port ${PORT}`));
