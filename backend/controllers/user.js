const bcrypt = require('bcrypt'); // librairy de hashage
const jwt = require('jsonwebtoken');
const sanitize = require('mongo-sanitize'); // faille XSS, recupère le corp du projet
const buffer = require('buffer/').Buffer; // chaine binaire et peut ensuite les remettres sur une base 64bit
const passwordRegexp = require('password-regexp');

require('dotenv').config();

const User = require('../models/User');

const password = passwordRegexp({
  min: 8,
  max: 18,
  numeric: true,
  uppercase: true,
  symbols: false, // an option for symbols: ! @ # $ % ^ &
});

exports.signup = (req, res) => {
  const buf = new Buffer.from(req.body.email);
  const pass = sanitize(req.body.password);
  if (password.test(pass)) {
    bcrypt.hash(pass, 10)
    .then((hash) => {
      const user = new User({
        email: buf.toString(process.env.DB_Buffer), // email masqué base64
        password: hash
      });
      user.save()
      .then(() => res.status(201).json({ message: 'Utilisateur crée !'}))
      .catch(error => res.status(400).json({ error }));
    })
    .catch(error => res.status(500).json({ error }));
  } else {
    res.status(401).json({ error: "Le mots de passe doit faire min 8 carractère, doit comprendre au moins 1 carractère majuscule, 1 carractère minuscule, 1 carractère numerique" }) 
  }
};

exports.login = (req, res) => {
  const buf = new Buffer.from(req.body.email);
  User.findOne({ email: buf.toString(process.env.DB_Buffer) }) // email masqué base64
    .then(user => {
      if (!user) {
        return res.status(401).json({ error: 'Utilisateur non trouvé !'});
      }
      if (!passwordRegexp){
        return res.status(401).json({ error: 'Mots de passe incorect !'});
      }
      bcrypt.compare(req.body.password, user.password)
        .then(valid => {
          if (!valid) {
            return res.status(401).json({ error: 'Mots de passe incorrect !'})
          }
          res.status(200).json({
            userId: user._id,
            token: jwt.sign(
              { userId: user._id},
              process.env.DB_TokenKey,
              { expiresIn: process.env.DB_Expire}
            )
          });
        })
        .catch(error => res.status(500).json({ error }));
    })
    .catch(error => res.status(500).json({ error }));
};