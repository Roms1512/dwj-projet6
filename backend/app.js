const express = require("express");
const app = express();

const path = require("path"); // voyager dans les fichiers facilement
const helmet = require("helmet"); // failles en-tête

const mongoose = require("mongoose");
const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // limit each IP to 100 requests per windowMs
  message: "Trop de tentavie de mots de passe, réessayer dans 15min"
});

require('dotenv').config();

const saucesRoutes = require("./routes/sauces");
const userRoutes = require("./routes/user");

/////********** Connection au server MongoDB **********/////

mongoose
  .connect(
    `mongodb+srv://${process.env.DB_Name}:${process.env.DB_Project}.obqbs.mongodb.net/${process.env.DB_DataBase}?retryWrites=true&w=majority`,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => console.log("Connection à MongoDB réussie!"))
  .catch(() => console.error("Connection à MongoDB échouée !"));

/////********** En-tête de l'application **********/////

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  next();
});

app.use(limiter);

app.use(helmet());

app.use(express.json());

app.use("/images", express.static(path.join(__dirname, "images"))); // défini le dossier pour les images

/////********** Les Différentes Routes **********/////

app.use("/api/sauces", saucesRoutes);
app.use("/api/auth", userRoutes);

module.exports = app;
