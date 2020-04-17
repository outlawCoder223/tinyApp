// Short URL redirection to associated long URL
const express = require('express');
const router = express.Router();
const { urlDatabase } = require('../database');
const { generateUniqueString } = require('../helpers');

router.get('/:id', (req, res) => {
  // sets new visitor cookie
  if (!req.session.visitor_id) {
    const id = generateUniqueString(urlDatabase[req.params.id].visitors);
    req.session.visitor_id = id;
    urlDatabase[req.params.id].visitors[id] = id;
  }
  // updates url object w/ each new visit
  if (req.params.id in urlDatabase) {
    const url = urlDatabase[req.params.id].longURL;
    const visit = {
      visitorID: req.session.visitor_id,
      time: new Date
    }
    urlDatabase[req.params.id].visits.push(visit);
    res.redirect(url);
  } else {
    req.templateVars.message = 'Not found';
    res.status(404).render('urls_error', req.templateVars);
  }
});

module.exports = router;