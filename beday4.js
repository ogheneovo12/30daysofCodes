const equalOccurence = (arr1, arr2) => {
  //check for which array is longer
  const alreadyCheckedValues = [];
  const longerArray = arr1.length > arr2.length ? arr1 : arr2;
  const shorterArray = arr1.length < arr2.length ? arr1 : arr2;
  const elemThatOccuredTwice = shorterArray.filter(el => {
    if (longerArray.includes(el) && !alreadyCheckedValues.includes(el)) {
      alreadyCheckedValues.push(el);
      return el;
    }
  });
  console.log(elemThatOccuredTwice);
};
equalOccurence([1, 4, 5, 7, 7, 8], [1, 1, 5, 5, 6, 7]);
