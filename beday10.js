function checkMail(email) {
  let mailFormat = "^.+@[^.].*.[a-z]{2,}$";
  // ( . ) cannot be placed directly after ( @ ).
  return email.match(mailFormat) ? true : false;
}

console.log(checkMail("sam@gmail.com"));
