const express = require('express');
const router = express.Router();
const { generateUniqueString } = require('../helpers');
const { urlDatabase } = require('../database');


router.get('/', (req, res) => {
  
  res.render('urls_index', req.templateVars);
});

router.post('/', (req, res) => {
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

router.get('/new', (req, res) => {
  if (!req.templateVars.user) {
    res.redirect('/login');
  } else {
    res.render('urls_new', req.templateVars);
  }
});

router.get('/:shortURL', (req, res) => {
  const url = req.params.shortURL;
  if (!urlDatabase[url]) {
    req.templateVars.message = 'Not found';
    res.status(404).render('urls_error.ejs', req.templateVars);
  } else if (!req.templateVars.user) {
    res.redirect('/login');
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

router.post('/:shortURL', (req, res) => {
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

router.post('/:shortURL/delete', (req, res) => {
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

module.exports = router;