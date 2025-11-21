const Task = require("../models/Task");
const User = require("../models/User");
const redis = require("../utils/redis");


exports.createTask = async (req, res) => {
  try {
    const { title, description, dueDate, priority, assignedTo } = req.body;

    // Manager can assign task ONLY to team users
    if (req.user.role === "MANAGER") {
      const manager = await User.findById(req.user.id).populate("team", "_id");
      const teamIds = manager.team.map((u) => u._id.toString());

      if (!teamIds.includes(assignedTo)) {
        return res
          .status(403)
          .json({ message: "Cannot assign task outside your team" });
      }
    }

    const task = await Task.create({
      title,
      description,
      dueDate,
      priority,
      assignedTo,
      createdBy: req.user.id,
    });

    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getTasks = async (req, res) => {
  try {
    const { status, priority, from, to, search } = req.query;

    const filter = {};

    // RBAC: Users only see their assigned tasks
    if (req.user.role === "USER") {
      filter.assignedTo = req.user.id;
    }

    // Manager sees only team tasks
    else if (req.user.role === "MANAGER") {
      const manager = await User.findById(req.user.id).populate("team");
      filter.assignedTo = { $in: manager.team.map((u) => u._id) };
    }

    if (status) filter.status = status.toUpperCase();
    if (priority) filter.priority = priority.toUpperCase();

    if (search) {
      filter.title = { $regex: search, $options: "i" };
    }
    if (from || to) {
      filter.dueDate = {};
      if (from) filter.dueDate.$gte = new Date(from);
      if (to) filter.dueDate.$lte = new Date(to);
    }

    const cacheKey = `tasks:${req.user.id}:${JSON.stringify(req.query)}`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.json(JSON.parse(cached));
    }

    const tasks = await Task.find(filter)
      .populate("assignedTo", "username email")
      .populate("createdBy", "username email");

    await redis.set(cacheKey, JSON.stringify(tasks), "EX", 600);
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    if (req.user.role === "MANAGER") {
      const manager = await User.findById(req.user.id).populate("team");
      const teamIds = manager.team.map((u) => u._id.toString());

      if (
        task.createdBy.toString() !== req.user.id &&
        !teamIds.includes(task.assignedTo.toString())
      ) {
        return res
          .status(403)
          .json({ message: "Not allowed to update this task" });
      }
    }

    const updated = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    if (req.user.role === "MANAGER") {
      const manager = await User.findById(req.user.id).populate("team");
      const teamIds = manager.team.map((u) => u._id.toString());

      if (
        task.createdBy.toString() !== req.user.id &&
        !teamIds.includes(task.assignedTo.toString())
      ) {
        return res
          .status(403)
          .json({ message: "Not allowed to delete this task" });
      }
    }

    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: "Task deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
