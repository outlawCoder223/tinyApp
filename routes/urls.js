// Routes for /url

const express = require('express');
const router = express.Router();
const { generateUniqueString } = require('../helpers');
const { urlDatabase } = require('../database');
const Url = require('../newURL');


router.get('/', (req, res) => {
  if (req.templateVars.user) {
    res.render('urls_index', req.templateVars);
  } else {
    req.templateVars.message = 'Please log in first!';
    res.status(403).render('urls_error', req.templateVars);
  }
  
});

// Create new short URL
router.post('/', (req, res) => {
  if (req.templateVars.user) {
    const shortURL = generateUniqueString(urlDatabase);
    const longURL = req.body.longURL;
    const userID = req.templateVars.user.id;
    // urlDatabase[shortURL] = {
    //   shortURL,
    //   longURL: req.body.longURL,
    //   date: new Date().toDateString(),
    //   userID: req.templateVars.user.id
    // };
    // userDatabase[id] = new User(id, email, hashedPass);
    urlDatabase[shortURL] = new Url(shortURL, longURL, userID)
    res.redirect(`/urls/${shortURL}`);
  } else {
    req.templateVars.message = 'You do not have permission to do this.';
    res.status(403).render('urls_error', req.templateVars);
  }
});

// create new short URL page
router.get('/new', (req, res) => {
  if (!req.templateVars.user) {
    res.redirect('/login');
  } else {
    res.render('urls_new', req.templateVars);
  }
});

// short URL info page
router.get('/:shortURL', (req, res) => {
  const url = req.params.shortURL;
  if (!urlDatabase[url]) {
    req.templateVars.message = 'Not found';
    res.status(404).render('urls_error.ejs', req.templateVars);
  } else if (!req.templateVars.user) {
    req.templateVars.message = 'Please log-in to view this';
    res.status(403).render('urls_error', req.templateVars);
  } else if (urlDatabase[url].userID === req.templateVars.user.id) {
    const currentUrl = urlDatabase[req.params.shortURL];
    const uniqueVisits = Object.keys(currentUrl.visitors).length;
    const templateVars = {
      ...req.templateVars,
      shortURL: req.params.shortURL,
      longURL: currentUrl.longURL,
      visits: currentUrl.visits,
      date: currentUrl.date,
      uniqueVisits
    };
    res.render('urls_show', templateVars);
  } else {
    req.templateVars.message = 'Access denied';
    res.status(403).render('urls_error', req.templateVars);
  }
  
});

// update short URL to new long URL
router.put('/:shortURL', (req, res) => {
  const url = req.params.shortURL;
  if (!req.templateVars.user) {
    req.templateVars.message = 'You do not have permission to do this.';
    res.status(403).render('urls_error', req.templateVars);
  } else if (urlDatabase[url].userID === req.templateVars.user.id) {
    urlDatabase[req.params.shortURL].longURL = req.body.update;
    res.redirect('/urls');
  } else {
    req.templateVars.message = 'You do not have permission to do this.';
    res.status(403).render('urls_error', req.templateVars);
  }
});

// delete the short URL
router.delete('/:shortURL', (req, res) => {
  const url = req.params.shortURL;
  if (!req.templateVars.user) {
    req.templateVars.message = 'You do not have permission to do this.';
    res.status(403).render('urls_error', req.templateVars);
  } else if (urlDatabase[url].userID === req.templateVars.user.id) {
    delete urlDatabase[req.params.shortURL];
    res.redirect('/urls');
  } else {
    req.templateVars.message = 'You do not have permission to do this.';
    res.status(403).render('urls_error', req.templateVars);
  }
});

module.exports = router;