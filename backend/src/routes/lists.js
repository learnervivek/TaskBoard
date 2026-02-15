const express = require("express");

module.exports = function (io) {
  const router = express.Router({ mergeParams: true });
  const listCtrl = require("../controllers/listController")(io);
  const auth = require("../middleware/auth");
  const optionalAuth = require("../middleware/optionalAuth");

  // POST /api/boards/:boardId/lists  -> create a list in the board
  router.post("/", auth, listCtrl.createList);

  // GET /api/boards/:boardId/lists  -> get lists for board (auth optional - allows share token)
  router.get("/", optionalAuth, listCtrl.getListsForBoard);

  // DELETE /api/boards/:boardId/lists/:listId -> delete a list and its tasks
  router.delete("/:listId", auth, listCtrl.deleteList);

  return router;
};
