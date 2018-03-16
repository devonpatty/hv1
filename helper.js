require('dotenv').config();
const { Client } = require('pg');

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

async function getBooks(offset) {
  const q = 'SELECT * FROM books ORDER BY bookid LIMIT 10 OFFSET $1';
  const result = await query(q, [offset]);
  return result.rows;
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

async function searchBook(val, offset) {
  const a = 'SELECT * FROM books WHERE to_tsvector(title) @@ to_tsquery($1) ORDER BY bookid LIMIT 10 OFFSET $2';
  const result = await query(a, [val, offset]);
  return result.rows;
}

async function readOne(id) {
  const a = 'SELECT * FROM books WHERE bookId = $1';
  const result = await query(a, [id]);
  return result.rows;
}

async function updateOne(bookid, title, isbn13, author, description, category, isbn10, published, pagecount, language) {
  const a = 'UPDATE books SET title = $1, isbn13 = $2, author = $3, description = $4, category = $5, isbn10 = $6, published = $7, pagecount = $8, language = $9 WHERE bookId = $10 RETURNING *';
  const values = [title, isbn13, author, description, category, isbn10, published, pagecount, language, bookid];
  
  const result = await query(a, values);
  
  return result.row;
}

async function createBook(title, isbn13, author, description, category, isbn10, published, pagecount, language) {
  const a = 'insert into books(title, isbn13, author, description, category, isbn10, publised, pagecount, language) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *';
  const values = [title, isbn13, author, description, category, isbn10, published, pagecount, language];

  const result = await query(a, values);
  return result.row;
}

async function getCategories(){
  const a = 'SELECT * FROM categories';
  const result = await query(a, []);
  return result.rows;
}

async function createCategory(name) {
  const a = 'INSERT INTO categories(name) VALUES($1) RETURNING *'
  const result = await query(a,[name]);
  return result.row;
}

module.exports = {
  getBooks,
  insertCategory,
  insertBooks,
  searchBook,
  readOne,
  updateOne,
  createBook,
  getCategories,
  createCategory,
};
