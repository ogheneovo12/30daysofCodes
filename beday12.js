function convertToNumber(str) {
  try {
    let castVar = Number(str);
    if (Number.isNaN(castVar)) {
      throw new SyntaxError("arguement passed is not a valid number");
    }
    console.log(castVar);
    return typeof castVar;
  } catch (err) {
    console.log("Error");
    console.log(err.message);
  }
}

convertToNumber("[2,4]");
