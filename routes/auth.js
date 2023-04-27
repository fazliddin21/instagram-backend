const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const USER = mongoose.model("USER");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Jwt_secret } = require("../keys");
const requireLogin = require("../middlewares/requireLogin");



// registration backend
router.post("/registration", (req, res) => {
  const { name, userName, email, password } = req.body;
  if (!name || !email || !userName || !password) {
    return res.status(422).json({ error: "Please enter all information" });
  }
  USER.findOne({ $or: [{ email: email }, { userName: userName }] }).then(
    (savedUSer) => {
      if (savedUSer) {
        return res
          .status(422)
          .json({ error: "user alreade exist with that email or username" });
      }
      bcrypt.hash(password, 12).then((hashedPassword) => {
        const user = new USER({
          name,
          email,
          userName,
          password: hashedPassword,
        });
        user
          .save()
          .then((user) => {
            res.json({ massage: "Registir successfully" });
          })
          .catch((err) => {
            console.log(err);
          });
      });
    }
  );
});
// Login backend
router.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(422).json({ error: "Please enter email and password" });
  }
  USER.findOne({ email: email }).then((savedUser) => {
    if (!savedUser) {
      return res.status(422).json({ error: "Invalid email or password" });
    }
    bcrypt.compare(password, savedUser.password).then((doMatch) => {
      if (doMatch) {
        //  return res.json({ message: "Login successful" });
        const token = jwt.sign({ _id: savedUser.id }, Jwt_secret);
        const { _id, name, email, userName } = savedUser;
        
        res.json({ token, user: { _id, name, email, userName } });
        console.log({ token, user: { _id, name, email, userName } });
      } else {
        return res.status(422).json({ error: "Invalid email or password" });
      }
    });
  });
});

module.exports = router;
