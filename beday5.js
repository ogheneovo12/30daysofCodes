const isPalindrome = (str) =>
  console.log(str.split("").reverse().join("") === str ? true : false);
isPalindrome("level");
let error = "";
const getpoints = (score, units, course) => {
  if (score > 70 && score <= 100) {
    return units * 5; //A 70 - 100
  } else if (score >= 60 && score <= 69) {
    return units * 4; //B 60 - 69
  } else if (score >= 50 && score <= 69) {
    return units * 3; //C 50 - 59
  } else if (score >= 45 && score <= 49) {
    return units * 2; //D 45 - 49
  } else if (score >= 40 && score <= 44) {
    return units * 1; // E 40 - 44
  } else if (score < 40) {
    return 0; //F below 40
  } else {
    error = error + `score for ${course} is out of range`;
    return null;
  }
};
console.log(getpoints(101, 55, "maths"));
console.log(error);
