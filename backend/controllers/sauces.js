const Sauce = require('../models/Sauce');
const fs = require('fs');
const sanitize = require('mongo-sanitize'); // faille XSS, recupère le corp du projet

//**********-- controller Sauces --**********//

exports.createSauce = (req, res) => {
  const SauceObject = JSON.parse(sanitize(req.body.sauce));
  delete SauceObject._id;
  const sauce = new Sauce({
    ...SauceObject,
    imageUrl:
      `${req.protocol}://${req.get('host')}/images/${sanitize(req.file.filename)}`
    });
  sauce.save()
    .then(() => res.status(201).json({ message: "Objet enregistré !"}))
    .catch(error => res.status(400).json({ error }));
};

exports.modifySauce = (req, res) => {
  if (req.file) {
    Sauce.findOne({ _id: sanitize(req.params.id) })
      .then((sauce) => {
        const filename = sauce.imageUrl.split('images')[1];
        fs.unlink(`images/${filename}`, () => {});
      })
      .catch(error => res.status(403).json({ error }));
  }
  const sauceObject = req.file ?
    {
      ...JSON.parse(sanitize(req.body.sauce)),
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };
  Sauce.updateOne({ _id: sanitize(req.params.id) }, { ...sauceObject, _id: sanitize(req.params.id) })
    .then(() => res.status(200).json({ message: 'Objet modifié !'}))
    .catch(error => res.status(400).json({ error }));
};

exports.deleteSauce = (req, res) => {
  Sauce.findOne({ _id: sanitize(req.params.id) })
    .then(sauce => {
      const filename = sauce.imageUrl.split('/images/')[1];
      fs.unlink(`images/${filename}`, () => {
        Sauce.deleteOne({ _id: sanitize(req.params.id) })
          .then(() => res.status(200).json({ message: 'Objet supprimé !'}))
          .catch(error => res.status(400).json({ error }));
      });
    })
    .catch(error => res.status(500).json({ error }));
};

exports.getOneSauce = (req, res) => {
  Sauce.findOne({ _id: sanitize(req.params.id)})
    .then(sauce => res.status(200).json(sauce))
    .catch(error => res.status(404).json({ error }));
};

exports.getAllSauce = (req, res) => {
  Sauce.find()
    .then(sauces => res.status(200).json(sauces))
    .catch(error => res.status(400).json({ error }));
};

//**********-- controller Like --**********//

exports.like = (req, res) => {
  let like = sanitize(req.body.like);
  let user = sanitize(req.body.userId);
  let sauceId = sanitize(req.params.id);
  Sauce.findOne({ _id: sauceId })
    .then((sauce) => {
      switch (like) {
        case 1:
          console.log("sauce liké !");
          Sauce.updateOne({ _id: sauceId }, {
            $inc: {likes: +1},
            $push: {usersLiked: user},
            _id: sauceId
          })
            .then(() => res.status(200).json({ message: 'Like ajouté !'}))
            .catch(error => res.status(403).json({ error }));
          break;

        case 0:
          if (sauce.usersLiked.includes(user)) {
            Sauce.updateOne({ _id: sauceId }, {
              $inc: {likes: -1},
              $pull: {usersLiked: user},
              _id: sauceId
            })
              .then(() => res.status(200).json({ message: 'Like Suprimé !'}))
              .catch(error => res.status(403).json({ error }));
          }
          if (sauce.usersDisliked.includes(user)) {
            Sauce.updateOne({ _id: sauceId }, {
              $inc: {dislikes: -1},
              $pull: {usersDisliked: user},
              _id: sauceId
            })
              .then(() => res.status(200).json({ message: 'Dislikes suprime !'}))
              .catch(error => res.status(403).json({ error }));
          }
          break;

        case -1:
          Sauce.updateOne({ _id: sauceId }, {
            $inc: {dislikes: +1},
            $push: {usersDisliked: user},
            _id: sauceId
          })
            .then(() => res.status(200).json({ message: 'Dislike ajouté !'}))
            .catch(error => res.status(403).json({ error }));
          break;
      
        default:
          console.log("le like a changé" + like);
          break;
      }
    })
    .catch(error => res.status(400).json({ error }));
};