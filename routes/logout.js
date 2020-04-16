// User logout
const express = require('express');
const router = express.Router();

router.post('/', (req, res) => {
  // delete cookie :
  req.session = null;
  res.redirect('/');
});

module.exports = router;