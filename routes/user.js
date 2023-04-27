const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const requireLogin = require("../middlewares/requireLogin");
const POST = mongoose.model("POST");
const USER = mongoose.model("USER");

router.get("/user/:id", async (req, res) => {
  try {
    const user = await USER.findOne({ _id: req.params.id }).select("-password");
    const post = await POST.find({ postedBy: req.params.id }).populate(
      "postedBy",
      "_id"
    );
    res.status(200).json({ user, post });
  } catch (err) {
    return res.status(404).json({ error: "User not found" });
  }
});
router.put("/follow", requireLogin, (req, res) => {
  USER.findByIdAndUpdate(
    req.body.followId,
    {
      $push: { followers: req.user._id },
    },
    {
      new: true,
      useFindAndModify: false,
    }
  )
    .then((result) => {
      USER.findByIdAndUpdate(
        req.user._id,
        {
          $push: { following: req.body.followId },
        },
        {
          new: true,
          useFindAndModify: false,
        }
      )
        .then((result) => {
          res.json(result);
        })
        .catch((err) => {
          return res.status(422).json({ error: err });
        });
    })
    .catch((err) => {
      return res.status(422).json({ error: err });
    });
});

// to unfollow user
router.put("/unfollow", requireLogin, (req, res) => {
  USER.findByIdAndUpdate(
    req.body.followId,
    {
      $pull: { followers: req.user._id },
    },
    {
      new: true,
      useFindAndModify: false,
    }
  )
    .then((result) => {
      USER.findByIdAndUpdate(
        req.user._id,
        {
          $pull: { following: req.body.followId },
        },
        {
          new: true,
          useFindAndModify: false,
        }
      )
        .then((result) => {
          res.json(result);
        })
        .catch((err) => {
          return res.status(422).json({ error: err });
        });
    })
    .catch((err) => {
      return res.status(422).json({ error: err });
    });
});

router.put("/uploadProfilePic", requireLogin, async (req, res) => {
  try {
    const result = await USER.findByIdAndUpdate(req.user._id, { Photo: req.body.pic }, { new: true, useFindAndModify: false });
    res.json(result);
  } catch (err) {
    res.status(422).json({ error: err.message });
  }
});




module.exports = router;
