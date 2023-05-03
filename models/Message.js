const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MessageSchema = new Schema({
	conversation:{
		type:Schema.Types.ObjectId,
		ref:'conversation'
	},
	to: {
		type: Schema.Types.ObjectId,
		ref: "users",
	},
	from: {
		type: Schema.Types.ObjectId,
		ref: "users",
	},
	body: {
		type: String,
	},
	date: {
		type: String,
		default: Date.now,
	},
});
module.exports = mongoose.model("message", MessageSchema);
