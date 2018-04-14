const bcrypt = require('bcrypt');
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

async function comparePasswords(hash, password) {
  const result = await bcrypt.compare(hash, password);

  return result;
}

async function findByUsername(username) {
  const q = 'SELECT * FROM users WHERE username = $1';

  const result = await query(q, [username]);

  if (result.rowCount === 1) {
    return result.rows[0];
  }

  return null;
}

async function findById(id) {
  const q = 'SELECT * FROM users WHERE id = $1';

  const result = await query(q, [id]);

  if (result.rowCount === 1) {
    return result.rows[0];
  }

  return null;
}

async function createUser(username, password, name, url) {
  const hashedPassword = await bcrypt.hash(password, 11);

  const q = 'INSERT INTO users (username, password, name, url) VALUES ($1, $2, $3, $4) RETURNING username';

  const result = await query(q, [username, hashedPassword, name, url]);
  const data = {
    username: result.rows[0].username,
    password,
  };

  return data;
}

async function getUsers() {
  const a = 'SELECT username FROM users';
  const results = await query(a);
  return results.rows;
}

async function getUserById(id) {
  const a = 'SELECT username FROM users WHERE id = ($1)';
  const results = await query(a, [id]);
  return results.rows;
}

async function updateProfilePic(id, url) {
  const q = 'UPDATE users SET url=$1 WHERE id=$2';
  const result = await query(q, [url, id]);
}

async function updateUser(password, name, id) {
  const hashedPassword = await bcrypt.hash(password, 11);
  console.log(hashedPassword);
  const a = 'UPDATE users SET password=$1, name=$2 WHERE id=$3';
  const result = await query(a, [hashedPassword, name, id]);
}

async function readById(id) {
  const a = 'SELECT * FROM books WHERE bookId IN (SELECT bookId FROM readbook WHERE userId = $1)';
  const result = await query(a, [id]);
  return result.rows;
}

async function createReadById(userId, bookId, star, review) {
  const q = 'INSERT INTO readbook (userId, bookId, star, review) VALUES ($1, $2, $3, $4)';
  const result = await query(q, [userId, bookId, star, review]);
  return result.rows;
}

async function deleteReadById(userId, bookId) {
  const q = 'DELETE FROM readbook WHERE userId = ($1) AND bookId = ($2)';
  const result = await query(q, [userId, bookId]);
  return result.rows;
}


module.exports = {
  comparePasswords,
  findByUsername,
  findById,
  createUser,
  getUsers,
  getUserById,
  updateProfilePic,
  updateUser,
  readById,
  createReadById,
  deleteReadById,
};
