const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const PORT = 8080;

const generateUniqueString = function(databaseObj) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  if (!databaseObj[result]) {
    return result;
  } else {
    return generateUniqueString(databaseObj);
  }
};

// 'Databases'
const urlDatabase = {
  'bwxVn2': {
    longURL: 'http://www.lighthouselabs.ca',
    date: new Date().toDateString()
  },
  '9sm5xK': {
    longURL: 'http://www.google.com',
    date: new Date().toDateString()
  }
};

const userDatabase = {
  user1: {
    id: 1,
    email: 'imauser@fake.com',
    password: 'papabear'
  },
  user2: {
    id: 2,
    email: 'appleguy@hotmail.com',
    password: 'babybear'
  }
};

// middleware & rendering engine
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.set('view engine', 'ejs');

// Routes
app.get('/', (req, res) => {
  res.redirect('/urls');
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/urls', (req, res) => {
  const loggedIn = userDatabase[req.cookies['userID']];
  const templateVars = {
    urls: urlDatabase,
    user: loggedIn
  };
  res.render('urls_index', templateVars);
});

app.post('/urls', (req, res) => {
  const shortURL = generateUniqueString(urlDatabase);
  urlDatabase[shortURL] = {};
  urlDatabase[shortURL].longURL = req.body.longURL;
  urlDatabase[shortURL].date = new Date().toDateString();
  res.redirect(`/urls/${shortURL}`);
});

app.get('/urls/new', (req, res) => {
  const loggedIn = userDatabase[req.cookies['userID']];
  const templateVars = {
    user: loggedIn
  };
  res.render('urls_new', templateVars);
});

app.get('/urls/:shortURL', (req, res) => {
  const loggedIn = userDatabase[req.cookies['userID']];
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: loggedIn
  };
  res.render('urls_show', templateVars);
});

app.post('/urls/:shortURL', (req, res) => {
  urlDatabase[req.params.shortURL].longURL = req.body.update;
  res.redirect('/urls');
});

app.post('/urls/:shortURL/delete', (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});

app.get('/register', (req, res) => {
  const loggedIn = userDatabase[req.cookies['userID']];
  const templateVars = { user: loggedIn };
  res.render('urls_registration', templateVars);
});

app.post('/register', (req, res) => {
  const id = generateUniqueString(userDatabase);
  userDatabase[id] = {};
  userDatabase[id].id = id;
  userDatabase[id].email = req.body.email;
  userDatabase[id].password = req.body.password;
  res.cookie('userID', id);
  res.redirect('/urls');
});

app.post('/login', (req, res) => {
  res.cookie('userID', req.body.username);
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  res.clearCookie('userID');
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
