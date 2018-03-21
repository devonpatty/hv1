require('dotenv').config();

const express = require('express');
const {
  createUser,
  getUsers,
  getUserById,
} = require('./users');

const router = express.Router();

function catchErrors(fn) {
  return (req, res, next) => fn(req, res, next).catch(next);
}

async function register(req, res) {
  const {
    username,
    password,
    name,
    url,
  } = req.body;
  const results = await createUser(username, password, name, url);
  res.status(200).json(results);
}

async function users(req, res) {
  const results = await getUsers();
  res.status(200).json(results);
}

async function usersId(req, res) {
  const { id } = req.params;
  const results = await getUserById(id);
  res.status(200).json(results);
}

router.post('/register', catchErrors(register));
router.get('/', catchErrors(users));
router.get('/:id', catchErrors(usersId));

module.exports = router;
