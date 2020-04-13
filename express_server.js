const express = require('express');
const app = express();
const PORT = 8080;

const urlDatabase = {
  'bwxVn2': 'http://www.lighthouselabes.ca',
  '9sm5xK': 'http://www.google.com'
};

app.get('/', (req, res) => {
  res.send('Hello!');
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/hello', (req,res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n');
});

app.listen(PORT, () => {
console.log(`Exampe app listening on port ${PORT}!`);
});