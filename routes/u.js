const express = require('express');
const router = express.Router();
const { urlDatabase } = require('../database');

router.get('/:id', (req, res) => {
  if (req.params.id in urlDatabase) {
    const url = urlDatabase[req.params.id].longURL;
    res.redirect(url);
  } else {
    req.templateVars.message = 'Not found';
    res.status(404).render('urls_error', req.templateVars);
  }
});

module.exports = router;