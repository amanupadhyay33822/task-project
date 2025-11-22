const express = require("express");
const router = express.Router();
const {
  authenticate,
  authorizeRoles,
} = require("../middlwares/auth");
const { addTeamMember } = require("../controllers/team");

router.use(authenticate);

router.post("/add-member",addTeamMember);


module.exports = router;
