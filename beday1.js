//check if arguement was read from the command line if not ask for it
const input = process.argv.slice(2).map(Number);
const readline = require("readline");
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

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
//this is to pass command from the command line
if (input.length > 0) {
  input.forEach(arg => console.log(testSign(arg)));
  rl.close(); // close stdin
} else {
  rl.question("please enter numbers seperated by space:", input => {
    input = input.split(" ").map(Number);
    input.forEach(arg => console.log(testSign(arg)));
    rl.close();
  });
}
