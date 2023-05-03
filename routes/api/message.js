const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();
const GlobalMessage = require("../../models/GlobalMessage");
const Message = require("../../models/Message");
const Conversation = require("../../models/Conversation");
const mongoose = require("mongoose");

let jwtUser;
const JWT_SECRET = process.env.JWT_SECRET || "hello";
// global validation
router.use((req, res, next) => {
	let token = req.headers.auth;
	//token bearer token...
	//check token is present
	if (!token) {
		return res.status(400).json("unauthorised without token");
	}
	// validating token
	jwtUser = jwt.verify(token.split(" ")[1], "hello");
	console.log(jwtUser);
	// jwtUser is a loged in user
	if (!jwtUser) {
		return res.status(400).json("unauthorised");
	} else {
		next();
	}
});

//api/messages/global_message
router.post("/global_message", async (req, res) => {
	let message = new GlobalMessage({
		from: jwtUser.id,
		message: req.body.message,
	});
	// req.io.sockets.emit('messages',req.body.body);
	let saveMessage = await message.save();
	res.json(saveMessage);
});

//api/messages/personalMessage
router.post("/personalMessage", async (req, res) => {
	let from = new mongoose.Types.ObjectId(jwtUser.id);
	let to = new mongoose.Types.ObjectId(req.body.reciever);

	let conversation = await Conversation.findOneAndUpdate(
		{
			recipients: {
				$all: [{ $elemMatch: { $eq: from } }, { $elemMatch: { $eq: to } }],
			},
		},
		{
			recipients: [from, to],
			lastMessage: req.body.message,
		},
		{
			upsert: true,
			new: true,
			setDefaultsOnInsert: true,
		}
	);

	let message = new Message({
		conversation: conversation._id,
		from: from,
		to: to,
		body: req.body.message,
	});

	req.io.sockets.emit("messages", message);
	let saveMessage = await message.save();
	res.json(saveMessage);
});

//api/messages/fetchMessages
router.get("/fetchMessages/query", async (req, res) => {
	const user1 = new mongoose.Types.ObjectId(jwtUser.id);
	const user2 = new mongoose.Types.ObjectId(req.query.to);

	let conversationList = await Message.aggregate([
		{
			$lookup: {
				from: "users",
				localField: "from",
				foreignField: "_id",
				as: "fromObj",
			},
		},
		{
			$lookup: {
				from: "users",
				localField: "to",
				foreignField: "_id",
				as: "toObj",
			},
		},
	])
		.match({
			$or: [
				{ $and: [{ to: user1 }, { from: user2 }] },
				{ $and: [{ to: user2 }, { from: user1 }] },
			],
		})
		.project({
			"toObj.password": 0,
			"toObj.__v": 0,
			"toObj.date": 0,
			"fromObj.password": 0,
			"fromObj.__v": 0,
			"fromObj.date": 0,
		})
		.exec();
	res.send(conversationList);
});

//api/messages/fetchConversationList
router.get("/fetchConversationList", async (req, res) => {
	const from = new mongoose.Types.ObjectId(jwtUser.id);
	const conversations = await Conversation.aggregate([
		{
			$match: {
				recipients: {
					$all: [{ $elemMatch: { $eq: from } }],
				},
			},
		},
		{
			$unwind: "$recipients",
		},
		{
			$match: {
				recipients: { $ne: from },
			},
		},
		{
			$lookup: {
				from: "users",
				localField: "recipients",
				foreignField: "_id",
				as: "chatter",
			},
		},
	]);

	res.json(conversations);
});

//api/messages/fetchGlobalMessages
router.get("/fetchGlobalMessages", async (req, res) => {
	const globalMessages = await GlobalMessage.find();
	res.json(globalMessages);
});

module.exports = router;
