// Short URL redirection to associated long URL
const express = require('express');
const router = express.Router();
const { urlDatabase } = require('../database');

router.get('/:id', (req, res) => {
  if (req.params.id in urlDatabase) {
    const url = urlDatabase[req.params.id].longURL;
    urlDatabase[req.params.id].visits += 1;
    res.redirect(url);
  } else {
    req.templateVars.message = 'Not found';
    res.status(404).render('urls_error', req.templateVars);
  }
});

module.exports = router;