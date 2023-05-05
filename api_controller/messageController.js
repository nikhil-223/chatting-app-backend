const express = require("express");
const GlobalMessage = require("../models/GlobalMessage");
const Message = require("../models/Message");
const Conversation = require("../models/Conversation");
const mongoose = require("mongoose");

exports.getConversations = async (req, res) => {
	const from = new mongoose.Types.ObjectId(req.user.id);
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
};

exports.sendGlobalMessage = async (req, res) => {
	let message = new GlobalMessage({
		from: req.user.id,
		message: req.body.message,
	});
	// req.io.sockets.emit('messages',req.body.body);
	let saveMessage = await message.save();
	res.json(saveMessage);
};

exports.sendPersonalMessage = async (req, res) => {
	let from = new mongoose.Types.ObjectId(req.user.id);
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
};

exports.getPersonalMessages = async (req, res) => {
	const user1 = new mongoose.Types.ObjectId(req.user.id);
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
};

exports.getGlobalMessages = async (req, res) => {
	const globalMessages = await GlobalMessage.aggregate([
		{
			$lookup: {
				from: "users",
				localField: "from",
				foreignField: "_id",
				as: "sender",
			},
		},
	]).project({
		__v: 0,
		from: 0,
		"sender.username": 0,
		"sender.password": 0,
		"sender.date": 0,
		"sender.__v": 0,
	});

	res.json(globalMessages);
};
