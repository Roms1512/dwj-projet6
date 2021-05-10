const mongoose = require('mongoose');

const sauceShema = mongoose.Schema({
  userId: { type: String, require: true}, // identifiant unique pour l'utilisateur qui a créé la sauce
  name: { type: String, require: true}, // nom de la sauce
  manufacturer: { type: String, require: true}, // fabricant de la sauce
  description: { type: String, require: true}, // description de la sauce
  mainPepper: { type: String, require: true}, // principal ingrédient dans la sauce
  imageUrl: { type: String, require: true}, // string de l'image de la sauce téléchargée par l'utilisateur
  heat: { type: Number, require: true}, // nombre entre 1 et 10 décrivant la sauce
  likes: { type: Number, require: true}, // nombre d'utilisateurs qui aiment la sauce
  dislikes: { type: Number, require: true}, // nombre d'utilisateurs qui n'aiment pas la sauce
  usersLiked: { type: [String], require: true}, // tableau d'identifiants d'utilisateurs ayant aimé la sauce
  usersDisliked: { type: [String], require: true} // tableau d'identifiants d'utilisateurs n'ayant pas aimé la sauce
});

module.exports = mongoose.model('Sauce', sauceShema);