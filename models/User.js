const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
	name: {
		type: String,
		require: true,
	},
	username: {
		type: String,
		require: true,
		unique: true,
	},
	email: {
		type: String,
		require: true,
	},
	password: {
		type: String,
		require: true,
	},
	imageFile:{
		type: String,
	},
	date: {
		type: String,
		default: Date.now,
	},
});
module.exports = mongoose.model("users", UserSchema);
