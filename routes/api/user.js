const express = require("express");
const router = express.Router();

const validateRegisterInput = require("../../validation/register");
const validateLoginInput = require("../../validation/login");
const User = require("../../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const JWT_SECRET = process.env.JWT_SECRET;

// api/user/login  to login
router.post("/login", async (req, res) => {
	console.log("login come......");
	//validation
	const { errors, isValid } = validateLoginInput(req.body); //check validation
	if (!isValid) {
		return res.status(400).json(errors);
	}
	let password = req.body.password;
	let user = await User.findOne({ username: req.body.username });
	if (!user) {
		return res.status(200).send("invalid credentials");
	}
	bcrypt.compare(password, user.password).then((isMatch) => {
		if (!isMatch) {
			return res.status(400).json("Invalid credentials");
		} else {
			const payload = {
				id: user._id,
				username: user.username,
			};
			jwt.sign(
				payload,
				JWT_SECRET,
				{
					expiresIn: 31556929,
				},
				(err, token) => {
					if (err) console.log("hello", err);
					res.json({
						success: true,
						id: user._id,
						name: user.name,
						username: user.username,
						token: "Bearer " + token,
					});
				}
			);
		}
	});
});

// api/users/register     to register
router.post("/register", async (req, res) => {
	const { errors, isValid } = validateRegisterInput(req.body);

	//check validation
	if (!isValid) {
		return res.status(400).json(errors);
	}

	//check weather user already exists
	let user = await User.findOne({ username: req.body.username });
	if (user) {
		return res.status(400).json({ error: "this user already exist" });
	}

	const newUser = new User({
		name: req.body.name,
		username: req.body.username,
		password: req.body.password,
	});

	bcrypt.genSalt(Number(process.env.SALT_ROUNDS) || 10, function (err, salt) {
		bcrypt.hash(req.body.password, salt, function (err, hash) {
			newUser.password = hash;
			newUser.save().then((user) => {
				const payload = {
					id: user._id,
					username: user.username,
				};
				jwt.sign(
					payload,
					JWT_SECRET,
					{
						expiresIn: 31556929,
					},
					(err, token) => {
						if (err) console.log(err);
						res.json({
							success: true,
							id: user._id,
							name: user.name,
							username: user.username,
							token: "Bearer " + token,
						});
					}
				);
			});
		});
	});
});

// api/users/     to get all other users
router.get("/", async (req, res) => {
	let token = req.headers.auth;
	//token bearer token....
	if (!token) {
		return res.status(400).json("unauthorized");
	}
	let jwtUser = jwt.verify(token.split(" ")[1], JWT_SECRET);
	if (!jwtUser) {
		return res.status(400).json("unauthorised");
	}

	let user = await User.aggregate()
		.match({ _id: { $not: { $eq: new mongoose.Types.ObjectId(jwtUser.id) } } })
		.project({
			password: 0,
			date: 0,
		})
		.exec();

	res.json(user);
});

// api/users/
module.exports = router;
