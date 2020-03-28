function monoTong(arg) {
  const vowels = ["a", "e", "i", "o", "u"];
  const numOfVowels = [...arg].filter(alpha => vowels.includes(alpha)).length;
  console.log(numOfVowels);
}

monoTong("abca");
