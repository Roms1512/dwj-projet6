const bcrypt = require('bcrypt'); // librairy de hashage
const jwt = require('jsonwebtoken');
const sanitize = require('mongo-sanitize'); // faille XSS, recupère le corp du projet
const buffer = require('buffer/').Buffer; // chaine binaire 

const User = require('../models/User');

exports.signup = (req, res) => {
  const buf = new Buffer.from(req.body.email);
  bcrypt.hash(sanitize(req.body.password), 10)
    .then((hash) => {
      const user = new User({
        email: buf.toString('base64'),
        password: hash
      });
      user.save()
        .then(() => res.status(201).json({ message: 'Utilisateur crée !'}))
        .catch(error => res.status(400).json({ error }));
    })
    .catch(error => res.status(500).json({ error }));
};

exports.login = (req, res) => {
  const buf = new Buffer.from(req.body.email);
  User.findOne({ email: buf.toString('base64') })
    .then(user => {
      if (!user) {
        return res.status(401).json({ error: 'Utilisateur non trouvé !'});
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
              'RAnd0M_Tok3N_S3cR3T',
              { expiresIn: '24h'}
            )
          });
        })
        .catch(error => res.status(500).json({ error }));
    })
    .catch(error => res.status(500).json({ error }));
};