import express from "express";
import user from "../Models/users.js";
import { organization as table } from "../utils/tableNames.js";
import { organization as userConfig } from "../utils/IDConfig.js";

const router = express.Router();
const User = new user(table.organization, userConfig);

router.post("/login", function (req, res) {
  User.loginUser(req, res);
});
router.get("/logout", function (req, res) {
  User.logoutUser(req, res);
});

router.post("/register", function (req, res) {
  User.addUser(req, res);
});

export default router;
