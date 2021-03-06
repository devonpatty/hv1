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

  const q = 'INSERT INTO users (username, password, name, url) VALUES ($1, $2, $3, $4) RETURNING username, name';

  const result = await query(q, [username, hashedPassword, name, url]);
  const data = {
    username: result.rows[0].username,
    password,
    name,
  };

  return data;
}

async function getUsers() {
  const a = 'SELECT username, id FROM users';
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

async function updateUserPass(password, id) {
  const hashedPassword = await bcrypt.hash(password, 11);

  const a = 'UPDATE users SET password=$1 WHERE id=$2';
  const result = await query(a, [hashedPassword, id]);
}

async function updateUsername(name, id) {
  const a = 'UPDATE users SET name=$1 WHERE id=$2 RETURNING name';
  const result = await query(a, [name, id]);
  return result.rows[0];
}

async function readById(id) {
  const a = 'SELECT readbook.bookId, title, star, review FROM readbook LEFT JOIN books ON readbook.bookId = books.bookId WHERE userId = $1';
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
  if (result.rowCount === 1) {
    return {};
  }
  return { error: 'no entry has been found' };
}


module.exports = {
  comparePasswords,
  findByUsername,
  findById,
  createUser,
  getUsers,
  getUserById,
  updateProfilePic,
  updateUserPass,
  updateUsername,
  readById,
  createReadById,
  deleteReadById,
};
