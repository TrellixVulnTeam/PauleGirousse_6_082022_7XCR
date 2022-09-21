// Pour la suppression de fichiers
const fs = require("fs");

// Modèle de sauce
const Sauce = require("../models/Sauce");

// Regex pour les champs de type "chaines de caractères"
const regexp = /^[a-zA-Zàâäéèêëïîôöùüç0-9'\-,!.\s]+$/;

// Création d'une sauce (suppression de l'indentifiant pour en générer un à partir du token)
exports.createSauce = (req, res) => {
  const sauceObject = JSON.parse(req.body.sauce);

  delete sauceObject.id;
  delete sauceObject.userId;
  if (
    regexp.test(sauceObject.name) &&
    regexp.test(sauceObject.manufacturer) &&
    regexp.test(sauceObject.description) &&
    regexp.test(sauceObject.mainPepper)
  ) {
    const sauce = new Sauce({
      ...sauceObject,
      userId: req.auth.userId,
      imageUrl: `${req.protocol}://${req.get("host")}/images/${
        req.file.filename
      }`,
    });

    sauce
      .save()
      .then(() => {
        res.status(201).json({ message: "Sauce enregistrée" });
      })
      .catch((error) => {
        res.status(400).json({ error });
      });
  } else {
    return res.status(400).json({ message: "champs invalides" });
  }
};

// Récupération d'une seule sauce de l'API
exports.getOneSauce = (req, res) => {
  Sauce.findOne({
    _id: req.params.id,
  })
    .then((sauce) => {
      res.status(200).json(sauce);
    })
    .catch((error) => {
      res.status(404).json({ error });
    });
};
// Modification d'une sauce (avant changement, vérification que l'utilisateur soit le créateur de la sauce et création du nouvel objet sauce).
exports.modifySauce = (req, res) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      if (sauce.userId !== req.auth.userId) {
        res.status(403).json({ message: "Non autorisé" });
      } else {
        if (req.file) {
          const filename = sauce.imageUrl.split("/images/")[1];
          fs.unlink(`images/${filename}`, () => {
            const sauceObject = {
              ...JSON.parse(req.body.sauce),
              imageUrl: `${req.protocol}://${req.get("host")}/images/${
                req.file.filename
              }`,
            };
            delete sauceObject.userId;
            Sauce.updateOne(
              { _id: req.params.id },
              { ...sauceObject, _id: req.params.id }
            )
              .then(() => {
                res.status(200).json({ message: "image et sauce modifiées" });
              })
              .catch((error) => res.status(401).json({ error }));
          });
        } else {
          const sauceObject = {
            ...JSON.parse(req.body.sauce),
          };
          delete sauceObject.userId;
          Sauce.updateOne(
            { _id: req.params.id },
            { ...sauceObject, _id: req.params.id }
          )
            .then(() => {
              res.status(200).json({ message: "sauce modifiée" });
            })
            .catch((error) => res.status(401).json({ error }));
        }
      }
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};
//   Sauce.findOne({ _id: req.params.id })
//     .then((sauce) => {
//       if (sauce.userId !== req.auth.userId) {
//         res.status(403).json({ message: "Non autorisé" });
//       } else {
//         if (
//           regexp.test(sauceObject.name) &&
//           regexp.test(sauceObject.manufacturer) &&
//           regexp.test(sauceObject.description) &&
//           regexp.test(sauceObject.mainPepper)
//         ) {
//           Sauce.updateOne(
//             { _id: req.params.id },
//             { ...sauceObject, _id: req.params.id }
//           )
//             .then(() => res.status(200).json({ message: "Sauce modifiée" }))
//             .catch((error) => res.status(401).json({ error }));
//         } else {
//           return res.status(400).json({ message: "champs invalides" });
//         }
//       }
//     })
//     .catch((error) => {
//       res.status(400).json({ error });
//     });
// };

// Suppression d'une sauce (avant suppression, vérification que l'utilisateur soit le créateur de la sauce et de l'image).
exports.deleteSauce = (req, res) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      if (sauce.userId !== req.auth.userId) {
        res.status(403).json({ message: "Non autorisé" });
      } else {
        const filename = sauce.imageUrl.split("/images/")[1];
        fs.unlink(`images/${filename}`, () => {
          Sauce.deleteOne({ _id: req.params.id })
            .then(() => {
              res.status(200).json({ message: "Sauce supprimée" });
            })
            .catch((error) => res.status(401).json({ error }));
        });
      }
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
};

// Récupération de toutes les sauces de l'API
exports.getAllSauces = (req, res) => {
  Sauce.find()
    .then((sauces) => {
      res.status(200).json(sauces);
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

// if (req.file) {
//   Sauce.findOne({ _id: req.params.id })
//   .then((sauce) => {

//     const filename = Sauce.imageUrl.split("/images/")[1];
//     fs.unlink(`images/${filename}`);

//     const sauceObject = {
//       ...JSON.parse(req.body.sauce),
//       imageUrl: `${req.protocol}://${req.get("host")}/images/${
//         req.file.filename
//       }`,
//     };
//     delete sauceObject.userId;}})
//   .catch((error) => res.status(401).json({ error }))
// } else {
//   const sauceObject = { ...req.body };
//   delete sauceObject.userId;
// }

// if (req.file) {
//   Sauce.findOne({ _id: req.params.id });
//   .then((sauce) => {
//     if (sauce.userId !== req.auth.userId) {
//       res.status(403).json({ message: "Non autorisé" });}
//     else{
//     const filename = Sauce.imageUrl.split("/images/")[1];
//     fs.unlink(`images/${filename}`);

//     const sauceObject = {
//       ...JSON.parse(req.body.sauce),
//       imageUrl: `${req.protocol}://${req.get("host")}/images/${
//         req.file.filename
//       }`,
//     };
//     delete sauceObject.userId;}})
//   .catch((error) => res.status(401).json({ error }))
// } else {
//   const sauceObject = { ...req.body };
//   delete sauceObject.userId;

// const sauceObject =
// req.file
//   ? {
//       ...JSON.parse(req.body.sauce),
//       imageUrl: `${req.protocol}://${req.get("host")}/images/${
//         req.file.filename
//       }`,
//     }
//   : { ...req.body };
