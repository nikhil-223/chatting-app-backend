//core module
const bodyParser = require("body-parser");

//3rd party module
const express = require("express");
const dotenv = require("dotenv").config();
const cors = require("cors");
const mongoose = require("mongoose");

// own routes import
const user = require("./routes/api/user");
const message = require("./routes/api/message");

// constants
const app = express();
const port = process.env.PORT || 5000;
const mongodbURI =
	process.env.MONGOOSE_URI || "mongodb://localhost:27017/chat-app";

//start server
const server = app.listen(port, () => {
	console.log("server is running on", port);
});

const io = require("socket.io")(server, { cors: { origin: "*" } });

// Assign socket object to every request (middleware)
app.use(function (req, res, next) {
	req.io = io;
	next();
});

//mongoose connect
mongoose
	.connect(mongodbURI)
	.then(() => console.log("mongoDB Successfully connected"))
	.catch((err) => console.log(err));

// middlewares
//cors middleware
app.use(cors());

//Body Parser middleware to parse request bodies
app.use(
	bodyParser.urlencoded({
		extended: false,
	})
);
app.use(bodyParser.json());


//api routes
app.use("/api/users", user);
app.use("/api/messages", message);
