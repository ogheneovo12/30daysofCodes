function checkNextbirday(arg) {
  var dateformat = /^(0?[1-9]|[12][0-9]|3[01])[\/\-](0?[1-9]|1[012])[\/\-]\d{4}$/;
  const birthDay = null,
    nextBirthDay = null,
    thisYearBirthdayHasPassed = null,
    today = new Date(),
    diffTimeStamp = null,
    daysLeftTillNextBirthDay = "";
  let dateString = "";
  //check if date matches dd-mm-yyyy or dd/mm/yyyy format
  if (arg.match(dateformat)) {
    //check which operator was used
    var dash = arg.split("-");
    var forwardSlash = arg.split("/");
    if (dash.length > 1) {
      dateString = arg.split("-").reverse().join("-");
    }
    if (forwardSlash.length > 1) {
      dateString = arg.split("/").reverse().join("/");
    }

    birthDay = new Date(dateString);
    nextBirthDay = new Date(
      `${today.getFullYear()}-${birthDay.getMonth() + 1}-${birthDay.getDate()}`
    );

    thisYearBirthdayHasPassed = today.valueOf() > nextBirthDay.valueOf();
    //check if birthday for current year has passed
    if (thisYearBirthdayHasPassed)
      nextBirthDay.setDate(nextBirthDay.getFullYear() + 1);

    diffTimeStamp = Math.abs(nextBirthDay.valueOf() - today.valueOf());
    daysLeftTillNextBirthDay = Math.ceil(diffTimeStamp / (1000 * 60 * 60 * 24));

    return daysLeftTillNextBirthDay + "days";
  }
  console.log("please enter a valid date");

  return;
}
console.log(checkNextbirday("13-10-1998"));
