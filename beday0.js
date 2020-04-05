function printDate() {
  const daysOfTheWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednessday",
    "Thursday",
    "Friday",
    "Saturday"
  ];
  const today = new Date();
  const dayOftheWeek = daysOfTheWeek[today.getDay()];
  let Hours = today.getHours();
  let Minutes = today.getMinutes();
  let Seconds = today.getSeconds();
  //format the time to know if it is am or pm
  let formattedTime = "";
  var timeOfDay = Hours >= 12 ? "pm" : "am";
  Hours = Hours % 12;
  Hours = Hours ? Hours : 12;
  Minutes = Minutes < 10 ? `0${Minutes}` : Minutes;
  Seconds = Seconds < 10 ? `0${Seconds}` : Seconds;
  formattedTime = Hours + ":" + Minutes + ":" + Seconds + " " + timeOfDay;
  //print out info
  console.log(`Today is ${dayOftheWeek}\nCurrent time is ${formattedTime}`);
}

const today = new Date();
console.log(today.toLocaleString());
printDate();