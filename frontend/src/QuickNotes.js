import React, { useEffect, useState } from "react";
import { XCircle } from "lucide-react";
import "./QuickNotes.css"; // Import styles

function QuickNotes({ onClose, updateQuickNotesCount }) {
  const [quickNotes, setQuickNotes] = useState([]);

  // Load Quick Notes from localStorage when component mounts
  useEffect(() => {
    const savedNotes = JSON.parse(localStorage.getItem("quickNotes")) || [];
    setQuickNotes(savedNotes);
  }, []);

  // ✅ Add a Quick Note and instantly update count
  const addQuickNote = (e) => {
    e.preventDefault();
    const noteInput = e.target.elements.note.value.trim();
    if (!noteInput) return;

    const newNotes = [...quickNotes, noteInput];
    setQuickNotes(newNotes);
    localStorage.setItem("quickNotes", JSON.stringify(newNotes));

    updateQuickNotesCount(newNotes.length); // ✅ Instantly update sidebar count

    e.target.reset();
  };

  // ❌ Delete a Quick Note and instantly update count
  const deleteQuickNote = (index) => {
    const newNotes = quickNotes.filter((_, i) => i !== index);
    setQuickNotes(newNotes);
    localStorage.setItem("quickNotes", JSON.stringify(newNotes));

    updateQuickNotesCount(newNotes.length); // ✅ Instantly update sidebar count
  };

  return (
    <div className="quick-notes-overlay">
      <div className="quick-notes-box">
        <div className="quick-notes-header">
          <h3>Quick Notes</h3>
          <button onClick={onClose} className="quick-notes-close">
            <XCircle size={22} />
          </button>
        </div>

        {/* Add Quick Note */}
        <form onSubmit={addQuickNote} className="quick-notes-form">
          <input type="text" name="note" placeholder="Type a note..." />
          <button type="submit">Add</button>
        </form>

        {/* List Notes */}
        <div className="quick-notes-list">
          {quickNotes.length === 0 ? (
            <p className="quick-notes-empty">No notes yet.</p>
          ) : (
            quickNotes.map((note, index) => (
              <div key={index} className="quick-note">
                <span>{note}</span>
                <button onClick={() => deleteQuickNote(index)}>✖</button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default QuickNotes;
