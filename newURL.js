class Url {
  constructor(shortURL, longURL, userID) {
    this.shortURL = shortURL;
    this.longURL = longURL;
    this.userID = userID;
    this.date = new Date().toDateString();
    this.visits = 0;
  }
}

module.exports = Url;