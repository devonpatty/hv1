require('dotenv').config();

const express = require('express');
const cloudinary = require('cloudinary');
const multer = require('multer');
const passport = require('passport');
const {
  createUser,
  getUsers,
  getUserById,
  updateProfilePic,
  updateUser,
  readById,
  createReadById,
  deleteReadById,
} = require('./users');

const {
  readOne,
} = require('./books');

const uploads = multer({ dest: './temp' });
const {
  CLOUDINARY_CLOUD,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
} = process.env;

const router = express.Router();

if (!CLOUDINARY_CLOUD || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
  console.warn('Missing cloudinary config, uploading images will not work');
}

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

function catchErrors(fn) {
  return (req, res, next) => fn(req, res, next).catch(next);
}

function requireAuthentication(req, res, next) {
  return passport.authenticate(
    'jwt',
    { session: false },
    (err, user, info) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        const error = info.name === 'TokenExpiredError' ? 'expired token' : 'invalid token';
        return res.status(401).json({ error });
      }

      req.user = user;
      next();
    },
  )(req, res, next);
}

async function register(req, res) {
  const {
    username,
    password,
    name,
  } = req.body;
  if (username.length < 3) {
    res.status(400).json({ error: 'Username þarf að vera 3 stafir eða lengra'});
  } else if (password.length < 6) {
    res.status(400).json({ error: 'Password þarf að vera 6 stafir eða lengra'});
  } else {
    const results = await createUser(username, password, name);
    res.status(200).json(results);
  }
}

async function profilePicture(req, res, next) {
  const { file: { path } = {} } = req;
  if (!path) {
    res.status(401).json({ error: 'gat ekki lesið mynd' });
  }
  let upload = null;

  try {
    upload = await cloudinary.v2.uploader.upload(path);
  } catch (err) {
    next(err);
  }
  const { secure_url } = upload;

  const { id } = req.user;
  await updateProfilePic(id, secure_url);
  res.status(200).json({ secure_url });
}

async function users(req, res) {
  const results = await getUsers();
  if (results.length === 0) {
    res.status(400).json({ error: 'Engir skráðir notendur'});
  } else {
    res.status(200).json(results);
  }
}

async function usersId(req, res) {
  const { id } = req.params;
  const results = await getUserById(id);
  if (results.length === 0) {
    res.status(400).json({ error: 'Enginn user með þetta ID'});
  } else {
    res.status(200).json(results);
  }
}

async function userMe(req, res) {
  const { id } = req.user;
  const results = await getUserById(id);
  res.status(200).json(results);
}

async function updateMe(req, res) {
  const { id } = req.user;
  const { password, name } = req.body;
  if (password.length < 6) {
    res.status(400).json({ error: 'Password þarf að vera 6 stafir eða lengra'});
  } else if (!name) {
    res.status(400).json({ error: 'Name má ekki vera null'});
  } else {
    const results = await updateUser(password, name, id);
    res.status(200).json(results);
  }
}

async function readIdGet(req, res) {
  const { id } = req.params;
  const results = await readById(id);
  if (results.length === 0) {
    res.status(400).json({ error: 'Þessi notandi hefur ekki lesið neina bækur'});
  }
  res.status(200).json(results);
}

async function meRead(req, res) {
  const { id } = req.user;
  const results = await readById(id);
  res.status(200).json(results);
}

async function meReadPost(req, res) {
  const { id } = req.user;
  const { bookId, star, review } = req.body;
  const book = await readOne(bookId);
  if (book.length === 0) {
    res.status(400).json({ error: 'Engin bók með þetta ID'});
  } else if (star < 1 || star > 5) {
    res.status(400).json({ error: 'Stjörnur þurfa að vera á milli 1 og 5'});
  } else {
    const results = await createReadById(id, bookId, star, review);
    res.status(200).json({ Skráning: 'Skráning tókst' });
  }
}

async function deleteRead(req, res) {
  const { id } = req.params;
  const userId = req.user.id;

  const results = await deleteReadById(userId, id);
  res.status(200).json(results);
}


router.post('/register', catchErrors(register));
router.get('/users', requireAuthentication, catchErrors(users));
router.get('/users/me', requireAuthentication, catchErrors(userMe));
router.patch('/users/me', requireAuthentication, catchErrors(updateMe));
router.get('/users/me/read', requireAuthentication, catchErrors(meRead));
router.post('/users/me/read', requireAuthentication, catchErrors(meReadPost));
router.delete('/users/me/read/:id', requireAuthentication, catchErrors(deleteRead));
router.get('/users/:id/read', requireAuthentication, catchErrors(readIdGet));
router.get('/users/:id', requireAuthentication, catchErrors(usersId));
router.post('/users/me/profile', requireAuthentication, uploads.single('url'), catchErrors(profilePicture));

module.exports = router;
