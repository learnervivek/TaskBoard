module.exports = function (io) {
  const express = require("express");
  const router = express.Router();
  const tasksCtrl = require("../controllers/tasksController")(io);
  const auth = require("../middleware/auth");
  const optionalAuth = require("../middleware/optionalAuth");

  router.get("/", tasksCtrl.getTasks);
  router.post("/", auth, tasksCtrl.createTask);
  router.put("/:id", auth, tasksCtrl.updateTask);
  router.delete("/:id", auth, tasksCtrl.deleteTask);
  // move endpoint — updates the `list` field
  router.post("/:id/move", auth, tasksCtrl.moveTask);

  return router;
};
