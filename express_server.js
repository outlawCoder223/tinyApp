const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const { generateUniqueString, checkEmail } = require('./helpers');
const PORT = 8080;
const KEY = 'woeir@mc289ruq%qcrm93';
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



// 'Databases'
const urlDatabase = {};

const userDatabase = {};

// middleware & rendering engine
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: [KEY],
}))
app.set('view engine', 'ejs');
app.use((req, res, next) => {
  const loggedIn = userDatabase[req.session.user_id];
  req.templateVars = {
    urls: urlDatabase,
    user: loggedIn,
    message: null
  };

  next();
});

// Routes
app.get('/', (req, res) => {
  res.redirect('/urls');
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/urls', (req, res) => {
  
  res.render('urls_index', req.templateVars);
});

app.post('/urls', (req, res) => {
  if (req.templateVars.user) {
    const shortURL = generateUniqueString(urlDatabase);
    urlDatabase[shortURL] = {
      shortURL,
      longURL: req.body.longURL,
      date: new Date().toDateString(),
      userID: req.templateVars.user.id
    };
    res.redirect(`/urls/${shortURL}`);
  } else {
    req.templateVars.message = 'You do not have permission to do this.';
    res.status(403).render('urls_error', req.templateVars);
  }
  
});

app.get('/urls/new', (req, res) => {
  if (!req.templateVars.user) {
    res.redirect('/login');
  } else{
    res.render('urls_new', req.templateVars);
  }
});

app.get('/urls/:shortURL', (req, res) => {
  const url = req.params.shortURL;
  if (!urlDatabase[url]) {
    req.templateVars.message = 'Not found';
    res.status(404).render('urls_error.ejs', req.templateVars)
  } else if (!req.templateVars.user) {
    res.redirect('/login')
  } else if (urlDatabase[url].userID === req.templateVars.user.id) {
    const templateVars = {
      ...req.templateVars,
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL].longURL
    };
    res.render('urls_show', templateVars);
  } else {
    req.templateVars.message = 'Access denied';
    res.status(403).render('urls_error', req.templateVars);
  }
  
});

app.post('/urls/:shortURL', (req, res) => {
  const url = req.params.shortURL;
  if (!req.templateVars.user) {
    res.redirect('/login');
  } else if (urlDatabase[url].userID === req.templateVars.user.id) {
    urlDatabase[req.params.shortURL].longURL = req.body.update;
    res.redirect('/urls');
  } else {
    req.templateVars.message = 'You do not have permission to do this.';
    res.status(403).render('urls_error', req.templateVars);
  }
});

app.post('/urls/:shortURL/delete', (req, res) => {
  const url = req.params.shortURL;
  if (!req.templateVars.user) {
    res.redirect('/login');
  } else if (urlDatabase[url].userID === req.templateVars.user.id) {
    delete urlDatabase[req.params.shortURL];
    res.redirect('/urls');
  } else {
    req.templateVars.message = 'You do not have permission to do this.';
    res.status(403).render('urls_error', req.templateVars);
  }
});

app.get('/u/:id', (req, res) => {
  if (req.params.id in urlDatabase) {
    const url = urlDatabase[req.params.id].longURL;
    res.redirect(url);
  } else {
    req.templateVars.message = 'Not found';
    res.status(404).render('urls_error', req.templateVars);
  }
});

app.get('/register', (req, res) => {
  req.templateVars.user ? res.redirect('/') : res.render('urls_registration', req.templateVars);
});

app.post('/register', (req, res) => {
  const id = generateUniqueString(userDatabase);
  const hashedPass = bcrypt.hashSync(req.body.password, 10);
  const email = req.body.email;
  if (!email) {
    req.templateVars.message = 'Enter a valid email';
    res.status(400).render('urls_error', req.templateVars)
  } else if (!hashedPass) {
    req.templateVars.message = 'Please enter a password.';
    res.status(400).render('urls_error', req.templateVars)
  } else if (checkEmail(userDatabase, email)) {
    req.templateVars.message = 'That email is already registered to a user!'
    res.status(400).render('urls_error', req.templateVars)
  } else {
    userDatabase[id] = new User(id, email, hashedPass);
    req.session.user_id = id;
    res.redirect('/urls');
  }
  
});

app.get('/login', (req, res) => {
  req.templateVars.user ? res.redirect('/') : res.render('urls_login', req.templateVars);
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const id = checkEmail(userDatabase, email);
  const hash = userDatabase[id].password;
  if (!id) {
    req.templateVars.message = 'Did you enter the correct email?';
    res.status(403).render('urls_error', req.templateVars);
  } else {
    const checkPassword = bcrypt.compareSync(password, hash);
    if (checkPassword) {
      req.session.user_id = id;
      res.redirect('/urls');
    } else {
      req.templateVars.message = 'Invalid Password';
      res.status(403).render('urls_error', req.templateVars);
    }
  }
  
});

app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
