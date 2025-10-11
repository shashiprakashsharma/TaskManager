import express from "express";
import authMiddleware from "../middleware/auth.js";
import {
  createOrUpdateNote,
  getNoteByTaskId,
  updateNote,
  deleteNote,
  getAllNotes
} from "../controllers/noteController.js";

const noteRouter = express.Router();

// All routes are protected
noteRouter.use(authMiddleware);

// Create or update note
noteRouter.post("/", createOrUpdateNote);

// Get all notes for user
noteRouter.get("/", getAllNotes);

// Get note by task ID
noteRouter.get("/:taskId", getNoteByTaskId);

// Update note by ID
noteRouter.put("/:id", updateNote);

// Delete note by ID
noteRouter.delete("/:id", deleteNote);

export default noteRouter;
