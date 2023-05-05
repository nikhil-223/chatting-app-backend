const JWT_SECRET = process.env.JWT_SECRET;
const jwt = require("jsonwebtoken");

exports.jwtVerify = (req, res, next) => {
	let token = req.headers.auth;
	//token bearer token....
	if (!token) {
		return res.status(401).json("Please authanticate using a valid token");
	}
	try {
		req.user = jwt.verify(token.split(" ")[1], JWT_SECRET);
		next();
	} catch (error) {
		return res.status(401).json("Please authanticate using a valid token");
	}
};
