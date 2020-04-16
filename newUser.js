// New User Class
const { urlDatabase, userDatabase } = require('./database');
class User {
  constructor(id, email, password) {
    this.id = id;
    this.email = email;
    this.password = password;
  }

  urlsForUser() {
    const results = [];
    for (let url in urlDatabase) {
      if (urlDatabase[url].userID === this.id) {
        results.push(urlDatabase[url]);
      }
    }
    return results;
  }
}

module.exports = User;