function convertToNumerals(arabic) {
  let romanNumerals = "";
  const romanBase = {
    M: 1000,
    CM: 900,
    D: 500,
    CD: 400,
    C: 100,
    XC: 90,
    L: 50,
    XV: 40,
    X: 10,
    IX: 9,
    v: 5,
    IV: 4,
    I: 1
  };

  for (const [key, value ] of Object.entries(romanBase)) {
    const divisible = Math.floor(arabic / value);

    if (divisible >= 0) {
      for (let range = 0; range < divisible; range++) {
        romanNumerals = romanNumerals + key;
      }
    }
    arabic = arabic % value; //break arabic
  }

  console.log(romanNumerals);
  return romanNumerals;
}
convertToNumerals(4500);
