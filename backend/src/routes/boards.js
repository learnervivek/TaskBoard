const express = require("express");

module.exports = function (io) {
  const router = express.Router();
  const boardCtrl = require("../controllers/boardController")(io);
  const auth = require("../middleware/auth");
  const optionalAuth = require("../middleware/optionalAuth");

  // Create a board (requires auth)
  router.post("/", auth, boardCtrl.createBoard);

  // Get all boards for the authenticated user
  router.get("/", auth, boardCtrl.getBoardsForUser);

  // Create a share token for a board (owner only)
  router.post("/:boardId/share", auth, boardCtrl.createShareToken);

  // Delete a board (owner only) - cascade deletes lists and tasks
  router.delete("/:boardId", auth, boardCtrl.deleteBoard);

  // Get users (owner + collaborators) for a board (auth optional - allows share token)
  router.get("/:boardId/users", optionalAuth, boardCtrl.getUsersForBoard);
  // Get activity history for a board (auth optional - allows share token)
  router.get("/:boardId/activities", optionalAuth, boardCtrl.getActivities);
  // Save a shared board to user's boards (requires auth and valid share token)
  router.post("/:boardId/save", auth, boardCtrl.saveSharedBoard);

  return router;
};
