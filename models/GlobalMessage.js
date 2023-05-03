const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const GlobalMessageSchema = new Schema({
	from: {
		type: Schema.Types.ObjectId,
		ref: "users",
	},

	message:{
		type: String,
	},
	date: {
		type: String,
		default: Date.now,
	},
});
module.exports = mongoose.model("global_message", GlobalMessageSchema);
