const validateType = arg => {
  if (
    typeof arg == "string" ||
    typeof arg == "number" ||
    typeof arg == "bolean" ||
    typeof arg == "undefined"
  ) {
    console.log(typeof arg);
  } else if (arg === null) {
    console.log("null");
  } else if (arg instanceof Array && arg.constructor === Array) {
    console.log("Array");
  } else if (arg instanceof Object && arg.constructor === Object) {
    console.log("Obect");
  } else {
    console.log("Error");
  }
};
validateType([]);
