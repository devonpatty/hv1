require('dotenv').config();

const express = require('express');
const { singleLink, manyLink } = require('./utils');
const {
  getBooks,
  searchBook,
  readOne,
  updateOne,
  createBook,
  getCategories,
  createCategory,
} = require('./books');

const { port } = process.env;
const router = express.Router();

function catchErrors(fn) {
  return (req, res, next) => fn(req, res, next).catch(next);
}

async function books(req, res) {
  let { offset = 0, limit = 10, search } = req.query;
  offset = Number(offset);
  limit = Number(limit);
  if (search) {
    const searchedBook = await searchBook(search, offset);
    const data = await singleLink(searchedBook, offset, limit, search, port);
    res.status(200).json(data);
  } else {
    const findBook = await getBooks(offset);
    const book = await manyLink(findBook, offset, limit, port);
    res.status(200).json(book);
  }
}

async function booksId(req, res) {
  const { id } = req.params;
  const book = await readOne(id);
  res.status(200).json(book);
}

async function categories(req, res) {
  const category = await getCategories();
  res.status(200).json(category);
}

async function categoriesPost(req, res) {
  const { name } = req.body;
  const category = await createCategory(name);
  res.status(200).json(category);
}

async function booksPost(req, res) {
  const {
    title,
    isbn13,
    author,
    description,
    category,
    isbn10,
    published,
    pagecount,
    language,
  } = req.body;
  const book = createBook(
    title,
    isbn13,
    author,
    description,
    category,
    isbn10,
    published,
    pagecount,
    language,
  );
  res.status(200).json(book);
}

async function booksIdUpdate(req, res) {
  const { id } = req.params;
  const {
    title,
    isbn13,
    author,
    description,
    category,
    isbn10,
    published,
    pagecount,
    language,
  } = req.body;
  const book = await updateOne(
    id,
    title,
    isbn13,
    author,
    description,
    category,
    isbn10,
    published,
    pagecount,
    language,
  );
  res.status(200).json(book);
}

router.get('/books', catchErrors(books));
router.get('/books/:id', catchErrors(booksId));
router.get('/categories', catchErrors(categories));
router.post('/categories', catchErrors(categoriesPost));
router.post('/books', catchErrors(booksPost));
router.patch('/books/:id', catchErrors(booksIdUpdate));

module.exports = router;
