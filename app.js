require('dotenv').config();

const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const { Strategy, ExtractJwt } = require('passport-jwt');

const booksApi = require('./booksAPI');
const usersApi = require('./usersAPI');
const users = require('./users');
const codata = require('./csv');

const tokenLifetime = 1500;
const {
  PORT: port = 3000,
  HOST: host = '127.0.0.1',
  JWT_SECRET: jwtSecret,
} = process.env;

const app = express();
app.use(cors());

if (!jwtSecret) {
  console.error('JWT_SECRET not registered in .env');
  process.exit(1);
}

app.use(express.json());

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: jwtSecret,
};

async function strat(data, next) {
  const user = await users.findById(data.id);
  if (user) {
    next(null, user);
  } else {
    next(null, false);
  }
}

passport.use(new Strategy(jwtOptions, strat));

app.use(passport.initialize());

app.post('/login', async (req, res) => {
  const {
    username,
    password,
  } = req.body;

  const user = await users.findByUsername(username);

  if (!user) {
    return res.status(401).json({ error: 'No such user' });
  }
  const passwordIsCorrect = await users.comparePasswords(password, user.password);

  if (passwordIsCorrect) {
    const payload = { id: user.id };
    const tokenOptions = { expiresIn: tokenLifetime };
    const token = jwt.sign(payload, jwtOptions.secretOrKey, tokenOptions);
    return res.status(200).json({ token, name: user.name });
  }

  return res.status(401).json({ error: 'Invalid password' });
});

app.use('/', booksApi);
app.use('/', usersApi);
app.use('/csv', codata);

function notFoundHandler(req, res, next) { // eslint-disable-line
  res.status(404).json({ error: 'Not found' });
}

function errorHandler(err, req, res, next) { // eslint-disable-line
  console.error(err);

  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Invalid json' });
  }

  return res.status(500).json({ error: 'Internal server error' });
}

app.get('/', (req, res) => {
  res.json({
    register: '/register',
    login: '/login',
    user: '/users',
    me: '/users/me',
    profile: '/users/me/profile',
    categories: '/categories',
    books: '/books',
    read: '/users/me/read',
  });
});

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(port, () => {
  console.info(`Server running at http://${host}:${port}/`);
});
