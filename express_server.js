const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const PORT = 8080;

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

// Helper Functions
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

const checkEmail = function(users, email) {
  for (let user in users) {
    if (users[user].email === email) {
      return user;
    }
  }
  return false;
};

// 'Databases'
const urlDatabase = {
  'bwxVn2': {
    shortURL: 'bwxVn2',
    longURL: 'http://www.lighthouselabs.ca',
    date: new Date().toDateString(),
    userID: 1
  },
  '9sm5xK': {
    shortURL: '9sm5xK',
    longURL: 'http://www.google.com',
    date: new Date().toDateString(),
    userID: 2
  }
};

const userDatabase = {
  user1: {
    id: 1,
    email: 'mrpoopybutthole@hotmail.com',
    password: 'morty',
    urlsForUser: function() {
      const results = [];
      for (let url in urlDatabase) {
        if (urlDatabase[url].userID === this.id) {
          results.push(urlDatabase[url]);
        }
      }
      return results;
    }
  },
  user2: {
    id: 2,
    email: 'appleguy@hotmail.com',
    password: 'babybear',
    urlsForUser: function() {
      const results = [];
      for (let url in urlDatabase) {
        if (urlDatabase[url].userID === this.id) {
          results.push(urlDatabase[url]);
        }
      }
      return results;
    }
  }
};

// middleware & rendering engine
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.set('view engine', 'ejs');
app.use((req, res, next) => {
  const loggedIn = userDatabase[req.cookies['userID']];
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
  res.render('urls_registration', req.templateVars);
});

app.post('/register', (req, res) => {
  const id = generateUniqueString(userDatabase);
  const { email, password } = req.body;
  if (!email) {
    req.templateVars.message = 'Enter a valid email';
    res.status(400).render('urls_error', req.templateVars)
  } else if (!password) {
    req.templateVars.message = 'Please enter a password.';
    res.status(400).render('urls_error', req.templateVars)
  } else if (checkEmail(userDatabase, email)) {
    req.templateVars.message = 'That email is already registered to a user!'
    res.status(400).render('urls_error', req.templateVars)
  } else {
    userDatabase[id] = new User(id, email, password);
    res.cookie('userID', id);
    res.redirect('/urls');
  }
  
});

app.get('/login', (req, res) => {
  req.templateVars.user ? res.redirect('/') : res.render('urls_login', req.templateVars);
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const id = checkEmail(userDatabase, email);
  if (!id) {
    req.templateVars.message = 'Did you enter the correct email?';
    res.status(403).render('urls_error', req.templateVars);
  } else {
    const checkPassword = userDatabase[id].password === password;
    if (checkPassword) {
      res.cookie('userID', id);
      res.redirect('/urls');
    } else {
      req.templateVars.message = 'Invalid Password';
      res.status(403).render('urls_error', req.templateVars);
    }
  }
  
});

app.post('/logout', (req, res) => {
  res.clearCookie('userID');
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
