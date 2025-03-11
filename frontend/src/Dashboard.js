import React, { useEffect, useState } from "react";
import axios from "axios";
import { CheckCircle, Trash2, PlusCircle, Search, Menu, ChevronRight, MoreHorizontal } from "lucide-react";
import QuickNotes from "./QuickNotes"
import "./Dashboard.css"; 

const API_URL = "http://127.0.0.1:5000/api/tasks";

function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [taskTitle, setTaskTitle] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");
  const [showSidebar, setShowSidebar] = useState(true);
  const [showQuickNotes, setShowQuickNotes] = useState(false);
  const [quickNotesCount, setQuickNotesCount] = useState([]);

  useEffect(() => {
    fetchTasks();
  }, []);
  useEffect(() => {
    const savedNotes = JSON.parse(localStorage.getItem("quickNotes")) || [];
    setQuickNotesCount(savedNotes.length);
  }, []);

  const updateQuickNotesCount = (count) => {
    setQuickNotesCount(count);
  };

  
  const fetchTasks = async () => {
    try {
      const response = await axios.get(API_URL, {
        params: searchQuery ? { search: searchQuery } : {},
      });
      setTasks(response.data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  const addTask = async (e) => {
    e.preventDefault();
    if (!taskTitle.trim()) {
      setError("Task title cannot be empty.");
      return;
    }
    try {
      const response = await axios.post(API_URL, { title: taskTitle });
      setTasks([...tasks, response.data]);
      setTaskTitle("");
      setError("");
    } catch (error) {
      if (error.response?.status === 409) {
        setError("Task already exists.");
      } else {
        setError("Error adding task.");
      }
    }
  };

  const deleteTask = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      setTasks(tasks.filter((task) => task.id !== id));
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const updateTaskTitle = async (id, newTitle) => {
    if (!newTitle.trim()) return;
    try {
      const response = await axios.patch(`${API_URL}/${id}`, { title: newTitle });
      setTasks(tasks.map((task) => (task.id === id ? response.data : task)));
    } catch (error) {
      if (error.response?.status === 409) {
        setError("A task with this title already exists.");
      } else {
        setError("Error updating task.");
      }
    }
  };

  const markTaskComplete = async (id) => {
    try {
      const response = await axios.patch(`${API_URL}/${id}/complete`);
      setTasks(tasks.map((task) => (task.id === id ? response.data : task)));
    } catch (error) {
      console.error("Error marking task as complete:", error);
    }
  };

  return (
    <div className="notion-app">
      {/* Sidebar */}
      <div className="notion-sidebar" style={{ width: showSidebar ? '250px' : '0' }}>
        <div className="notion-sidebar-content">
          <div className="notion-sidebar-section">
            <div className="mb-6">
              <h3 className="font-semibold text-base">Workspace</h3>
            </div>
            <div className="notion-sidebar-heading">PRIVATE</div>
            <div className="notion-sidebar-item" onClick={() => setShowQuickNotes(true)}>
            📌 Quick Notes <span className="note-count">({quickNotesCount})</span>
          </div>
          </div>
        </div>
      </div>
      {showQuickNotes && <QuickNotes onClose={() => setShowQuickNotes(false)} updateQuickNotesCount={updateQuickNotesCount} />}

      {/* Main Content */}
      <div className="notion-main">
        <div className="notion-navbar">
          <button 
            onClick={() => setShowSidebar(!showSidebar)} 
            className="notion-menu-button"
          >
            <Menu size={20} />
          </button>
          <div className="notion-breadcrumb">
            <div className="notion-breadcrumb-item">
              <ChevronRight size={16} className="text-gray-400" />
              <span className="font-medium ml-2">Tasks</span>
            </div>
          </div>
          <div style={{ flex: 1 }}></div>
          <div className="notion-search">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchTasks()}
              placeholder="Search tasks..."
              className="notion-search-input"
            />
            <Search size={16} className="notion-search-icon" />
          </div>
        </div>

        {/* Content */}
        <div className="notion-content notion-fade-in">
          <h1 className="notion-title">Tasks</h1>
          
        
          {error && <p className="notion-error">{error}</p>}

          {/* Add Task */}
          <form onSubmit={addTask} className="notion-add-task">
            <div className="notion-add-task-input-container">
              <PlusCircle size={18} className="mr-4 text-gray-400" />
              <input
                type="text"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="Add a task..."
                className="notion-add-task-input"
              />
            </div>
            <button type="submit" className="notion-add-button">
              Add
            </button>
          </form>

          {/* Task List */}
          <div className="notion-task-list">
            {tasks.length === 0 ? (
              <div className="notion-empty-state">
                <p>No tasks yet. Add one to get started!</p>
              </div>
            ) : (
              tasks.map((task) => (
                <div key={task.id} className="notion-task-item">
                  <div 
                    onClick={() => markTaskComplete(task.id)} 
                    className={`notion-task-checkbox ${task.completed ? 'checked' : ''}`}
                  >
                    {task.completed && <CheckCircle size={14} />}
                  </div>
                  <input
                    type="text"
                    defaultValue={task.title}
                    onBlur={(e) => updateTaskTitle(task.id, e.target.value)}
                    className={`notion-task-text ${task.completed ? 'completed' : ''}`}
                  />
                  <div className="notion-task-actions">
                    <div 
                      onClick={() => deleteTask(task.id)}
                      className="notion-task-action-button"
                    >
                      <Trash2 size={16} />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
