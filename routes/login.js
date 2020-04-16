// Login
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { checkEmail } = require('../helpers');
const { userDatabase } = require('../database');


router.get('/', (req, res) => {
  req.templateVars.user ? res.redirect('/') : res.render('urls_login', req.templateVars);
});

// User login
router.post('/', (req, res) => {
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

module.exports = router;