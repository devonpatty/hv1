require('dotenv').config();

const express = require('express');
const csvdata = require('csvdata');
const {
  insertCategory,
  insertBooks,
} = require('./helper');

const booksPath = './data/books.csv';
const router = express.Router();

function catchErrors(fn) {
  return (req, res, next) => fn(req, res, next).catch(next);
}

async function csv(req, res) {
  csvdata.load(booksPath, { delimiter: ',' })
    .then((result) => {
      Promise.all(result)
        .then(async (data) => {
          const startTime = Math.floor(new Date().getTime() / 1000);
          for (let i = 0; i !== data.length; i += 1) {
              await insertCategory(data[i].category); //eslint-disable-line
          }
          for (let j = 0; j !== data.length; j += 1) {
              await insertBooks( data[j].title, data[j].isbn13, data[j].author, data[j].description, // eslint-disable-line
              data[j].category, data[j].isbn10, data[j]
                .published, data[j].pagecount, data[j].language,
            );
          }
          const endTime = Math.floor(new Date().getTime() / 1000);
          const elapsedTime = endTime - startTime;
          return elapsedTime;
        })
        .then(timer => console.info(`Imported data from .csv took: ${timer} seconds , the data has been added successfully`))
        .catch(err => console.warn(err));
      res.status(200).json(result);
    });
}

router.get('/csv', catchErrors(csv));

module.exports = router;
