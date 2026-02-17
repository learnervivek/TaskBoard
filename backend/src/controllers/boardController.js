const Board = require("../models/Board");
const crypto = require("crypto");
const url = require("url");

module.exports = function (io) {
  return {
    createBoard: async (req, res) => {
      try {
        const { title } = req.body;
        if (!title) return res.status(400).json({ error: "title is required" });

        const owner = req.userId || req.body.owner;
        if (!owner)
          return res.status(400).json({ error: "owner (user) is required" });

        const b = new Board({ title, owner });
        await b.save();

        // Automatically create default lists: To Do, In Progress, Done
        const List = require('../models/List');
        const defaultLists = [
          { title: 'To Do', board: b._id, position: 0 },
          { title: 'In Progress', board: b._id, position: 1 },
          { title: 'Done', board: b._id, position: 2 }
        ];
        
        await List.insertMany(defaultLists);

        res.status(201).json({ board: b });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    },

    getBoardsForUser: async (req, res) => {
      try {
        const userId = req.userId || req.query.userId;
        if (!userId) return res.status(400).json({ error: "userId required" });

        // get boards where user is owner OR collaborator
        const boards = await Board.find({
          $or: [{ owner: userId }, { collaborators: userId }],
        }).sort({ createdAt: -1 });
        res.json({ boards });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    },

    createShareToken: async (req, res) => {
      try {
        const { boardId } = req.params;
        const userId = req.userId;
        if (!boardId)
          return res.status(400).json({ error: "boardId required" });

        const board = await Board.findById(boardId);
        if (!board) return res.status(404).json({ error: "Board not found" });
        if (String(board.owner) !== String(userId))
          return res
            .status(403)
            .json({ error: "Only owner can create share links" });

        const token = crypto.randomBytes(16).toString("hex");
        // default expiry: 7 days
        const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        board.shareToken = token;
        board.shareExpires = expires;
        await board.save();

        // return a path-only share link; frontend will construct full origin when copying
        const sharePath = `/board/${board._id}?share=${token}`;
        res.json({ sharePath, token, expires });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    },

    deleteBoard: async (req, res) => {
      try {
        const { boardId } = req.params;
        const userId = req.userId;
        if (!boardId)
          return res.status(400).json({ error: "boardId required" });

        const board = await Board.findById(boardId);
        if (!board) return res.status(404).json({ error: "Board not found" });
        if (String(board.owner) !== String(userId))
          return res
            .status(403)
            .json({ error: "Only owner can delete the board" });

        // record activity: board deleted
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
          const act = new Activity({
            board: board._id,
            actor: req.userId,
            actorName,
            type: "board:deleted",
            data: { title: board.title },
          });
          await act.save();
          try {
            io.to(String(board._id)).emit("activity:created", act);
          } catch (e) {
            io.emit("activity:created", act);
          }
        } catch (e) {}
        // notify connected clients in the board room that the board is deleted
        try {
          io.to(String(board._id)).emit("board:deleted", {
            boardId: board._id,
          });
        } catch (e) {
          io.emit("board:deleted", { boardId: board._id });
        }

        // cascade delete lists and tasks belonging to this board
        const List = require("../models/List");
        const Task = require("../models/Task");

        await Task.deleteMany({ board: board._id });
        await List.deleteMany({ board: board._id });
        await Board.deleteOne({ _id: board._id });

        return res.json({ success: true });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    },

    getActivities: async (req, res) => {
      try {
        const { boardId } = req.params;
        if (!boardId)
          return res.status(400).json({ error: "boardId required" });
        const provided = req.query.share || req.query.shareToken;
        const board = await Board.findById(boardId);
        if (!board) return res.status(404).json({ error: "Board not found" });
        const ok =
          req.userId ||
          (provided &&
            board.shareToken &&
            String(provided) === String(board.shareToken) &&
            (!board.shareExpires || board.shareExpires > new Date()));
        if (!ok) return res.status(401).json({ error: "unauthorized" });

        const Activity = require("../models/Activity");
        const activities = await Activity.find({ board: boardId })
          .sort({ createdAt: -1 })
          .limit(100);
        res.json({ activities });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    },

    getUsersForBoard: async (req, res) => {
      try {
        const { boardId } = req.params;
        if (!boardId)
          return res.status(400).json({ error: "boardId required" });
        const board = await Board.findById(boardId).populate(
          "owner collaborators",
          "name email",
        );
        if (!board) return res.status(404).json({ error: "Board not found" });

        const provided = req.query.share || req.query.shareToken;
        const ok =
          req.userId ||
          (provided &&
            board.shareToken &&
            String(provided) === String(board.shareToken) &&
            (!board.shareExpires || board.shareExpires > new Date()));
        if (!ok) return res.status(401).json({ error: "unauthorized" });

        const users = [];
        if (board.owner)
          users.push({
            _id: board.owner._id,
            name: board.owner.name,
            email: board.owner.email,
            role: "owner",
          });
        if (board.collaborators && board.collaborators.length) {
          board.collaborators.forEach((c) => {
            users.push({
              _id: c._id,
              name: c.name,
              email: c.email,
              role: "collaborator",
            });
          });
        }

        res.json({ ownerId: board.owner._id, users });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    },

    saveSharedBoard: async (req, res) => {
      try {
        const { boardId } = req.params;
        const userId = req.userId;
        if (!boardId)
          return res.status(400).json({ error: "boardId required" });
        if (!userId)
          return res
            .status(401)
            .json({ error: "Must be logged in to save shared boards" });

        const board = await Board.findById(boardId);
        if (!board) return res.status(404).json({ error: "Board not found" });

        // check if user has valid share access
        const provided = req.body.share || req.query.share;
        const ok =
          provided &&
          board.shareToken &&
          String(provided) === String(board.shareToken) &&
          (!board.shareExpires || board.shareExpires > new Date());
        if (!ok)
          return res
            .status(401)
            .json({ error: "Invalid or expired share token" });

        // check if already a collaborator
        if (String(board.owner) === String(userId))
          return res.status(400).json({ error: "You already own this board" });
        if (board.collaborators.some((c) => String(c) === String(userId)))
          return res.status(400).json({ error: "Already saved" });

        // add as collaborator
        board.collaborators.push(userId);
        await board.save();

        res.json({ board });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    },
  };
};
