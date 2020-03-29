const equalOccurence = (arr1, arr2) => {
  //check for which array is longer
  const alreadyCheckedValues = [];
  const longerArray = arr1.length > arr2.length ? arr1 : arr2;
  const shorterArray = arr1.length < arr2.length ? arr2 : arr1;
  const elemThatOccuredTwice = shorterArray.filter(el => {
    if (longerArray.includes(el) && !alreadyCheckedValues.includes(el)) {
      alreadyCheckedValues.push(el);
      return el;
    }
  });
  console.log(elemThatOccuredTwice);
};
equalOccurence([1,1,0], [1, 1,]);
