import Note from "../models/noteModel.js";

// Create or update a note
export const createOrUpdateNote = async (req, res) => {
  try {
    const { taskId, content } = req.body;
    const owner = req.user.id;

    if (!taskId) {
      return res.status(400).json({
        success: false,
        message: "Task ID is required"
      });
    }

    // Try to find existing note
    let note = await Note.findOne({ taskId, owner });

    if (note) {
      // Update existing note
      note.content = content;
      note = await note.save();
    } else {
      // Create new note
      note = await Note.create({
        taskId,
        content,
        owner
      });
    }

    res.status(200).json({
      success: true,
      note
    });
  } catch (error) {
    console.error("Error creating/updating note:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// Get note by task ID
export const getNoteByTaskId = async (req, res) => {
  try {
    const { taskId } = req.params;
    const owner = req.user.id;

    const note = await Note.findOne({ taskId, owner });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found"
      });
    }

    res.status(200).json({
      success: true,
      note
    });
  } catch (error) {
    console.error("Error fetching note:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// Update note
export const updateNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const owner = req.user.id;

    const note = await Note.findOneAndUpdate(
      { _id: id, owner },
      { content, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found or not yours"
      });
    }

    res.status(200).json({
      success: true,
      note
    });
  } catch (error) {
    console.error("Error updating note:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// Delete note
export const deleteNote = async (req, res) => {
  try {
    const { id } = req.params;
    const owner = req.user.id;

    const note = await Note.findOneAndDelete({ _id: id, owner });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found or not yours"
      });
    }

    res.status(200).json({
      success: true,
      message: "Note deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting note:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// Get all notes for a user
export const getAllNotes = async (req, res) => {
  try {
    const owner = req.user.id;

    const notes = await Note.find({ owner })
      .populate('taskId', 'title description priority dueDate completed')
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      notes
    });
  } catch (error) {
    console.error("Error fetching notes:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};
