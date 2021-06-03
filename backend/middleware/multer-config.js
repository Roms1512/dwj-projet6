const multer = require("multer"); // permet de gérer les fichiers entrants dans les requêtes HTTP

const MIME_TYPES = {
  "image/jpg": "jpg",
  "image/jpeg": "jpg",
  "image/png": "png",
};

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, "images");
  },
  filename: (req, file, callback) => {
    const name = file.originalname.split(" ").join("_");
    callback(null, Date.now() + name);
  },
});

module.exports = multer({ storage }).single("image");
