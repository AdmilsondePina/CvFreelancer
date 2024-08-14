import express from "express";
import passport from "passport";
import { getProfileRouteHandler, patchProfileRouteHandler } from "../../services/me/index.js";
import { findUserByEmail, updateUserProfile } from "../../schemas/user.schema.js";

const router = express.Router();

// get user's profile
router.post("/", passport.authenticate('jwt',{session: false}), async (req, res) => {
  const email = req.user.email;
  const user = await findUserByEmail(email);

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  getProfileRouteHandler(req, res, user);
});

// update user's profile
router.patch("/", passport.authenticate('jwt',{session: false}), async (req, res) => {
  const email = req.user.email;
  const updates = req.body.data.attributes;

  const updatedUser = await updateUserProfile(email, updates);

  if (!updatedUser) {
    return res.status(404).json({ error: "User not found or update failed" });
  }

  patchProfileRouteHandler(req, res, updatedUser);
});

export default router;
