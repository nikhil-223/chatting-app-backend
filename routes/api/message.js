const express = require("express");
const router = express.Router();
const { sendGlobalMessage, sendPersonalMessage, getPersonalMessages, getConversations, getGlobalMessages, deleteMessage } = require("../../api_controller/messageController");
const { jwtVerify } = require("../../middlewares/JWTverification");

// global validation
router.use(jwtVerify);

//api/messages/global_message
router.post("/global_message", sendGlobalMessage);

//api/messages/personalMessage
router.post("/personalMessage", sendPersonalMessage);

//api/messages/fetchMessages
router.get("/fetchMessages/query", getPersonalMessages);

//api/messages/fetchConversationList
router.get("/fetchConversationList", getConversations);

//api/messages/fetchGlobalMessages
router.get("/fetchGlobalMessages", getGlobalMessages);

router.delete("/deleteMessage", deleteMessage);

module.exports = router;
