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
    user: loggedIn
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
  const shortURL = generateUniqueString(urlDatabase);
  urlDatabase[shortURL] = {
    shortURL,
    longURL: req.body.longURL,
    date: new Date().toDateString(),
    userID: req.templateVars.user.id
  };
  res.redirect(`/urls/${shortURL}`);
});

app.get('/urls/new', (req, res) => {
  if (!req.templateVars.user) {
    res.redirect('/login');
  }
  res.render('urls_new', req.templateVars);
});

app.get('/urls/:shortURL', (req, res) => {
  const templateVars = {
    ...req.templateVars,
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL
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
  res.render('urls_registration', req.templateVars);
});

app.post('/register', (req, res) => {
  const id = generateUniqueString(userDatabase);
  const { email, password } = req.body;
  if (!email) {
    res.status(400).send('Invalid email');
  } else if (!password) {
    res.status(400).send('Please enter a password.');
  } else if (checkEmail(userDatabase, email)) {
    res.status(400).send("Email already registered to user.");
  } else {
    userDatabase[id] = new User(id, email, password);
    res.cookie('userID', id);
    res.redirect('/urls');
  }
  
});

app.get('/login', (req, res) => {
  res.render('urls_login', req.templateVars);
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const id = checkEmail(userDatabase, email);
  if (!id) {
    res.status(403).send("Did you enter the correct email?");
  } else {
    const checkPassword = userDatabase[id].password === password;
    if (checkPassword) {
      res.cookie('userID', id);
      res.redirect('/urls');
    } else {
      res.status(403).send("Invalid Password!");
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
