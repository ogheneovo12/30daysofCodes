function getFibonacci(limit /*or n term*/) {
  //time complexity linear O(N), space : constant
  let lastTerm = 1,
    nextToLastTerm = 0,
    fibo = 0;

  while (limit > 1) {
    fibo = lastTerm + nextToLastTerm;
    // console.log(`${counter}:${lastTerm}`)
    // move upward the series
    nextToLastTerm = lastTerm;
    lastTerm = fibo;
    --limit;
  }
  return fibo;
}

/*mehn i actually thought recursive approach would be faster, but console.time says different*/
const getFibonacci2 = (n, store) => {
  //store result of getFibonnaci, memoisation technique, time complexity 0(2N), space:0(n)
  store = store || {};
  if (store[n]) return store[n];
  if (n <= 1) return n;
  return (store[n] = getFibonacci(n - 1, store) + getFibonacci(n - 2, store));
};

console.log("fibo first approach:" + getFibonacci(30));
console.log("fibo second approach:" + getFibonacci2(30));
