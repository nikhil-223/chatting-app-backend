const validateLoginInput = require("../validation/login");
const validateRegisterInput = require("../validation/register");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;
const mongoose = require("mongoose");

// register call
exports.register = async (req, res) => {
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
};

// login call
exports.login = async (req, res) => {

	//validation
	const { errors, isValid } = validateLoginInput(req.body); //check validation
	if (!isValid) {
		return res.status(400).json(errors);
	}

	// password verification
	let password = req.body.password;
	let user = await User.findOne({ username: req.body.username });
	if (!user) {
		return res.status(200).json("invalid credentials");
	}
	bcrypt.compare(password, user.password).then((isMatch) => {
		if (!isMatch) {
			return res.status(401).json("Invalid credentials");
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
};

// get all other users
exports.getOthers = async (req, res) => {
	
	let user = await User.aggregate()
		.match({ _id: { $not: { $eq: new mongoose.Types.ObjectId(req.user.id) } } })
		.project({
			password: 0,
			date: 0,
		})
		.exec();

	res.json(user);
};