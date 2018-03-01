const csvdata = require('csvdata');
const express = require('express');

const router = express.Router();

const booksPath = './data/books.csv';

router.get('/', (req, res) => {
  csvdata.load(booksPath, { delimiter: ',' })
    .then((result) => {
      res.status(200).json(result);
    });
});

module.exports = router;
