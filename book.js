require('dotenv').config();

const csvdata = require('csvdata');
const express = require('express');
const { Client } = require('pg');

const router = express.Router();

const { port } = process.env;

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

const getBooks = offset => new Promise(async (resolve) => {
  const q = 'SELECT * FROM books ORDER BY bookid LIMIT 10 OFFSET $1';

  const result = await query(q, [offset]);
  if (result) {
    return resolve(result.rows);
  }
  return resolve(null);
});

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

async function replaceSlash(arr) {
  const books = arr;
  for (let i = 0; i !== books.length; i += 1) {
    const str = books[i].description.replace(/[\\"]/g, '');
    books[i].description = str;
  }
  return books;
}

router.get('/csv', (req, res) => {
  csvdata.load(booksPath, { delimiter: ',' })
    .then((result) => {
      Promise.all(result)
        .then(async (data) => {
          const startTime = Math.floor(new Date().getTime() / 1000);
          for (let i = 0; i !== data.length; i += 1) {
            await insertCategory(data[i].category);
          }
          for (let j = 0; j !== data.length; j += 1) {
            await insertBooks(data[j].title, data[j].isbn13, data[j].author, data[j].description,
              data[j].category, data[j].isbn10, data[j].published, data[j].pagecount, data[j].language);
          }
          const endTime = Math.floor(new Date().getTime() / 1000);
          const elapsedTime = endTime - startTime;
          return elapsedTime;
        })
        .then(timer => console.info(`Imported data from .csv took: ${timer} seconds , the data has been added successfully`))
        .catch(err => console.warn(err));
      res.status(200).json(result);
    })
    .catch(err => console.warn(err));
});

router.get('/book', async (req, res) => {
  let { offset = 0, limit = 10 } = req.query;
  offset = Number(offset);
  limit = Number(limit);
  await getBooks(offset)
    .then(async (data) => {
      const books = {
        links: {
          self: {
            href: `http://localhost:${port}/book?offset=${offset}&limit=${limit}`,
          },
        },
        limit,
        offset,
        items: await replaceSlash(data),
      };

      if (offset > 0) {
        books.links['prev'] = {
          href: `http://localhost:${port}/book?offset=${offset-limit}&limit=${limit}`,
        };
      }
  
      if (books.items.length <= limit) {
        books.links['next'] = {
          href: `http://localhost:${port}/book?offset=${Number(offset)+limit}&limit=${limit}`,
        };
      }

      res.status(200).json(books);
    })
    .catch(() => res.status(404).json({ error: 'Not found' }));
});

module.exports = router;
