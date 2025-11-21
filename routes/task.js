const express = require("express");
const router = express.Router();
const {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
} = require("../controllers/task");
const {
  authenticate,
  authorizeRoles,
} = require("../middlwares/auth");

router.use(authenticate);

router.get("/", getTasks);
router.post("/", authorizeRoles("ADMIN", "MANAGER"), createTask);
router.put("/:id", authorizeRoles("ADMIN", "MANAGER"), updateTask);
router.delete("/:id", authorizeRoles("ADMIN", "MANAGER"), deleteTask);

module.exports = router;
