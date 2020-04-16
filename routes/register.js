// Register a new user 
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { generateUniqueString, checkEmail } = require('../helpers');
const { urlDatabase, userDatabase } = require('../database');
const User = require('../newUser');

router.get('/', (req, res) => {
  req.templateVars.user ? res.redirect('/') : res.render('urls_registration', req.templateVars);
});

// Create new User 
router.post('/', (req, res) => {
  const id = generateUniqueString(userDatabase);
  // Password must be hashed before saving in database:
  const hashedPass = bcrypt.hashSync(req.body.password, 10);
  const email = req.body.email;
  // new User checks
  if (!email) {
    req.templateVars.message = 'Enter a valid email';
    res.status(400).render('urls_error', req.templateVars);
  } else if (!hashedPass) {
    req.templateVars.message = 'Please enter a password.';
    res.status(400).render('urls_error', req.templateVars);
  } else if (checkEmail(userDatabase, email)) {
    req.templateVars.message = 'That email is already registered to a user!';
    res.status(400).render('urls_error', req.templateVars);
  } else {
    userDatabase[id] = new User(id, email, hashedPass);
    req.session.user_id = id;
    res.redirect('/urls');
  }
});

module.exports = router;