class Url {
  constructor(shortURL, longURL, userID) {
    this.shortURL = shortURL;
    this.longURL = longURL;
    this.userID = userID;
    this.date = new Date().toDateString();
    this.visits = [];
    this.visitors = {};
  }
}

module.exports = Url;