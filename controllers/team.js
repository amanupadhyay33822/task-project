const User = require("../models/User");

// ADD USER TO MANAGER'S TEAM
exports.addTeamMember = async (req, res) => {
  try {
    const { managerId, userId } = req.body;

    // Only admin or the manager himself can add team members
    if (req.user.role !== "ADMIN" && req.user._id !== managerId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const manager = await User.findById(managerId);
    const user = await User.findById(userId);

    if (!manager || !user) {
      return res.status(404).json({ message: "Manager or User not found" });
    }

    // Only MANAGERS can have teams
    if (manager.role !== "MANAGER") {
      return res
        .status(400)
        .json({ message: "Selected user is not a manager" });
    }

    // Prevent duplicates
    if (manager.team.includes(userId)) {
      return res.status(400).json({ message: "User already in team" });
    }

    manager.team.push(userId);
    await manager.save();

    res.json({ message: "Team member added", manager });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
