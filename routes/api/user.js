const express = require("express");
const router = express.Router();

const { login, register, getOthers, getMydetails } = require("../../api_controller/userController");
const { jwtVerify } = require("../../middlewares/JWTverification");


// api/user/login  to login
router.post("/login", login); 

// api/users/register     to register
router.post("/register", register);

// api/users/     to get all other users
router.get("/",jwtVerify, getOthers);

// api/users/
router.get("/userDetails", jwtVerify, getMydetails);

module.exports = router;
