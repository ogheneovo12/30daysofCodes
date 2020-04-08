const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;
var bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let data = {};

const getpoints = ({ score, units }) => {
  if (score > 70 && score <= 100) {
    return units * 5; //A 70 - 100
  } else if (score >= 60) {
    return units * 4; //B 60 - 69
  } else if (score >= 50) {
    return units * 3; //C 50 - 59
  } else if (score >= 45) {
    return units * 2; //D 45 - 49
  } else if (score >= 40) {
    return units * 1; // E 40 - 44
  } else if (score < 40) {
    return 0; //F below 40
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
        (courseCurr, courseAdj) => getpoints(courseCurr) + getpoints(courseAdj)
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
  if (typeof sgpa != "undefines" && sgpa !== null && !Number.isNaN(sgpa)) {
    res.json({ success: "true", sgpa });
  } else {
    res.json({
      success: "false",
      message:
        "either no data have been passed, or the data format passed was incorrect, try reviewing your data,(note:at least 1 course unit must be greater than zero) try sending another data again",
    });
  }
});
app.post("/courses", (req, res) => {
  //check if request meets the data structure specification i.e if courses exist
  if (req.body.courses instanceof Array) {
    data = req.body;
    res.json({ success: "true", data: [data] });
  } else {
    res.json({ success: "false", messgage: "courses were not specified" });
  }
});

app.listen(PORT, () => console.log(`app is running on port ${PORT}`));
