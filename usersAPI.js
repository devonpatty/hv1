require('dotenv').config();

const express = require('express');
const cloudinary = require('cloudinary');
const multer = require('multer');
const {
  createUser,
  getUsers,
  getUserById,
  updateProfilePic,
} = require('./users');

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

async function register(req, res) {
  const {
    username,
    password,
    name,
  } = req.body;
  const results = await createUser(username, password, name);
  res.status(200).json(results);
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
  res.status(200).json(results);
}

async function usersId(req, res) {
  const { id } = req.params;
  const results = await getUserById(id);
  res.status(200).json(results);
}

router.post('/register', catchErrors(register));
router.get('/users', catchErrors(users));
router.get('/users/:id', catchErrors(usersId));
router.post('/users/me/profile', uploads.single('url'), catchErrors(profilePicture));
module.exports = router;
