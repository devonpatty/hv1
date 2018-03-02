require('dotenv').config();

const csvdata = require('csvdata');
const express = require('express');
const { Client } = require('pg');

const router = express.Router();

const booksPath = './data/books.csv';

const connectionString = process.env.DATABASE_URL;

async function query(q, values = []) {
  const client = new Client({ connectionString });
  await client.connect();

  let result;

  try {
    result = await client.query(q, values);
  } catch (err) {
    throw err;
  } finally {
    await client.end();
  }

  return result;
}

async function insertCategory(category) {
  const q = 'INSERT INTO categories (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name=$1 RETURNING *';
  const result = await query(q, [category]);
  return result.rows;
}

async function insertBooks(title, isbn13, author, description, category, isbn10, published, pagecount, language) {
  const q = 'INSERT INTO books (title, isbn13, author, description, category, isbn10, published, pagecount, language) '
          + 'VALUES($1, $2, $3, $4, (SELECT cateid FROM categories WHERE categories.name=$5), $6, $7, $8, $9) '
          + 'RETURNING *';
  const result = await query(q, [title, isbn13, author, description, category, isbn10, published, pagecount, language]);
  return result.rows;
}

router.get('/', (req, res) => {
  csvdata.load(booksPath, { delimiter: ',' })
    .then((result) => {
      Promise.all(result)
        .then(async (data) => {
          for (let i = 0; i !== data.length; i += 1) {
            await insertCategory(data[i].category);
          }
          for (let j = 0; j !== data.length; j += 1) {
            await insertBooks(data[j].title, data[j].isbn13, data[j].author, data[j].description,
              data[j].category, data[j].isbn10, data[j].published, data[j].pagecount, data[j].language);
          }
        })
        .then(() => console.info('insertions has been completed'));
      res.status(200).json(result);
    })
    .catch(err => console.warn(err));
});

module.exports = router;
