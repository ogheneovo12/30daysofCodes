const equalOccurence = (arr1, arr2) => {
  //check for which array is longer

  const elemThatOccuredTwice = [];
  const longerArray = arr1.length > arr2.length ? arr1 : arr2;
  const shorterArray = arr1.length < arr2.length ? arr2 : arr1;
  const equalArray = console.log(shorterArray);
  const alreadyCheckedValues = shorterArray.filter((el) => {
    let bol = longerArray.includes(el) && !elemThatOccuredTwice.includes(el);
    console.log(bol);
    //check if el occurs in longer array (then double occurence ) then check if it has been checked before
    if (longerArray.includes(el) && !elemThatOccuredTwice.includes(el)) {
      elemThatOccuredTwice.push(el);
      console.log(`foundNew: ${el}`);
      return el;
    } else {
      console.log(`rejected: ${el}`);
    }
  });
  console.log(elemThatOccuredTwice);
};
equalOccurence([1, 1, 0, 6, 89, 9, 10], [1, 1, 0, 6, 7, 9]);
