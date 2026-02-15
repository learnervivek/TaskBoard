const Task = require("../models/Task");
const Activity = require("../models/Activity");

module.exports = function (io) {
  return {
    getTasks: async (req, res) => {
      try {
        const tasks = await Task.find().sort({ createdAt: -1 });
        res.json(tasks);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    },

    createTask: async (req, res) => {
      try {
        const { title, board, list } = req.body;
        if (!title || !board || !list)
          return res
            .status(400)
            .json({ error: "title, board and list are required" });

        // check access: allow if authenticated OR valid share token provided
        const Board = require("../models/Board");
        const b = await Board.findById(board);
        if (!b) return res.status(404).json({ error: "Board not found" });
        const headerShare =
          req.headers["x-share-token"] || req.headers["x-share"];
        const provided =
          req.body.share ||
          req.body.shareToken ||
          req.query.share ||
          req.query.shareToken ||
          headerShare;
        const ok =
          req.userId ||
          (provided &&
            b.shareToken &&
            String(provided) === String(b.shareToken) &&
            (!b.shareExpires || b.shareExpires > new Date()));
        if (!ok) return res.status(401).json({ error: "unauthorized" });

        const t = new Task(req.body);
        const saved = await t.save();
        // create activity
        try {
          const actorName = req.userId ? undefined : undefined;
          const a = new Activity({
            board: saved.board,
            list: saved.list,
            task: saved._id,
            actor: req.userId,
            actorName,
            type: "task:created",
            data: { title: saved.title },
          });
          await a.save();
          try {
            io.to(String(saved.board)).emit("activity:created", a);
          } catch (e) {
            io.emit("activity:created", a);
          }
        } catch (e) {
          /* ignore activity errors */
        }
        // emit only to users in the board room
        try {
          io.to(String(saved.board)).emit("task:created", saved);
        } catch (e) {
          io.emit("task:created", saved);
        }
        res.status(201).json(saved);
      } catch (err) {
        res.status(400).json({ error: err.message });
      }
    },

    updateTask: async (req, res) => {
      try {
        const payload = req.body || {};
        // if assigning, validate assignee exists and ensure requester is authorized (owner or collaborator)
        if (payload.assignee) {
          const User = require("../models/User");
          const Board = require("../models/Board");
          const user = await User.findById(payload.assignee);
          if (!user)
            return res.status(400).json({ error: "Assignee user not found" });
          // fetch task to know board
          const existing = await Task.findById(req.params.id);
          if (!existing) return res.status(404).end();
          const board = await Board.findById(existing.board);
          // owner or collaborator can assign tasks
          const requesterId = req.userId;
          const isOwner =
            requesterId && String(board.owner) === String(requesterId);
          const isCollaborator =
            requesterId &&
            board.collaborators.some((c) => String(c) === String(requesterId));
          if (!isOwner && !isCollaborator)
            return res
              .status(403)
              .json({
                error: "You must be a member of the board to assign tasks",
              });
        }

        const updated = await Task.findByIdAndUpdate(req.params.id, payload, {
          new: true,
        });
        if (!updated) return res.status(404).end();
        try {
          const Activity = require("../models/Activity");
          let actorName = undefined;
          if (req.userId) {
            try {
              const U = require("../models/User");
              const uu = await U.findById(req.userId);
              if (uu) actorName = uu.name || uu.email;
            } catch (e) {}
          }
          const a = new Activity({
            board: updated.board,
            list: updated.list,
            task: updated._id,
            actor: req.userId,
            actorName,
            type: "task:updated",
            data: payload,
          });
          await a.save();
          try {
            io.to(String(updated.board)).emit("activity:created", a);
          } catch (e) {
            io.emit("activity:created", a);
          }
        } catch (e) {}
        try {
          io.to(String(updated.board)).emit("task:updated", updated);
        } catch (e) {
          io.emit("task:updated", updated);
        }
        res.json(updated);
      } catch (err) {
        res.status(400).json({ error: err.message });
      }
    },

    deleteTask: async (req, res) => {
      try {
        const removed = await Task.findByIdAndDelete(req.params.id);
        if (!removed) return res.status(404).end();
        try {
          const Activity = require("../models/Activity");
          let actorName = undefined;
          if (req.userId) {
            try {
              const U = require("../models/User");
              const uu = await U.findById(req.userId);
              if (uu) actorName = uu.name || uu.email;
            } catch (e) {}
          }
          const a = new Activity({
            board: removed.board,
            list: removed.list,
            task: removed._id,
            actor: req.userId,
            actorName,
            type: "task:deleted",
            data: { id: removed._id, title: removed.title },
          });
          await a.save();
          try {
            io.to(String(removed.board)).emit("activity:created", a);
          } catch (e) {
            io.emit("activity:created", a);
          }
        } catch (e) {}
        try {
          io.to(String(removed.board)).emit("task:deleted", {
            id: req.params.id,
          });
        } catch (e) {
          io.emit("task:deleted", { id: req.params.id });
        }
        res.json({ id: req.params.id });
      } catch (err) {
        res.status(400).json({ error: err.message });
      }
    },

    moveTask: async (req, res) => {
      try {
        const { list } = req.body;
        if (!list)
          return res
            .status(400)
            .json({ error: "list (new list id) is required" });
        const updated = await Task.findByIdAndUpdate(
          req.params.id,
          { list },
          { new: true },
        );
        if (!updated) return res.status(404).end();
        try {
          const Activity = require("../models/Activity");
          let actorName = undefined;
          if (req.userId) {
            try {
              const U = require("../models/User");
              const uu = await U.findById(req.userId);
              if (uu) actorName = uu.name || uu.email;
            } catch (e) {}
          }
          const a = new Activity({
            board: updated.board,
            list: updated.list,
            task: updated._id,
            actor: req.userId,
            actorName,
            type: "task:moved",
            data: { list },
          });
          await a.save();
          try {
            io.to(String(updated.board)).emit("activity:created", a);
          } catch (e) {
            io.emit("activity:created", a);
          }
        } catch (e) {}
        // notify users in the board room about the moved task
        try {
          io.to(String(updated.board)).emit("task:updated", updated);
        } catch (e) {
          io.emit("task:updated", updated);
        }
        res.json(updated);
      } catch (err) {
        res.status(400).json({ error: err.message });
      }
    },
  };
};
