const express = require("express");
const app = express();

const path = require("path"); // voyager dans les fichiers facilement
const helmet = require("helmet"); // failles en-tête

const bodyParser = require("body-parser"); // Analyser les corps de requête entrants dans un middleware avant les gestionnaires, disponible sous la propriété req.body.
const mongoose = require("mongoose");

const saucesRoutes = require("./routes/sauces");
const userRoutes = require("./routes/user");

/////********** Connection au server MongoDB **********/////

mongoose
  .connect(
    "mongodb+srv://romain:projet6@cluster0.obqbs.mongodb.net/myFirstDatabase?retryWrites=true&w=majority",
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

app.use(helmet());

app.use(bodyParser.json());

app.use("/images", express.static(path.join(__dirname, "images")));

app.use("/api/sauces", saucesRoutes);
app.use("/api/auth", userRoutes);

module.exports = app;
