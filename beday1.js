

const testSign = argv => {
  switch (Math.sign(argv)) {
    case 1:
      return `${argv}:positive`;
      break;
    case -1:
      return `${argv}:negative`;
      break;
    case 0:
      return `${argv}: +/-0`;
      break;
    default:
      return "please enter a valid Number";
      break;
  }
};
console.log(testSign(-2));
