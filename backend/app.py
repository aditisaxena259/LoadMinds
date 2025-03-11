from flask import Flask, request, jsonify
from flask_cors import CORS
import uuid

app = Flask(__name__)
CORS(app)

tasks = []  # Stores tasks as dictionaries

@app.route('/api/tasks', methods=['GET'])
def get_tasks():
    """ Retrieve tasks with optional search functionality """
    search_query = request.args.get("search", "").strip().lower()
    
    if search_query:
        filtered_tasks = [task for task in tasks if search_query in task["title"].lower()]
        return jsonify(filtered_tasks), 200
    
    return jsonify(tasks), 200

@app.route('/api/tasks', methods=['POST'])
def add_task():
    """ Add a new task while preventing duplicates """
    data = request.json
    title = data.get("title", "").strip()

    if not title:
        return jsonify({"error": "Title is required"}), 400
    
    # Check for duplicate task titles (case insensitive)
    if any(task["title"].lower() == title.lower() for task in tasks):
        return jsonify({"error": "Task already exists"}), 409

    new_task = {
        "id": str(uuid.uuid4()),
        "title": title,
        "completed": False  # Track completion status
    }
    tasks.append(new_task)
    return jsonify(new_task), 201

@app.route('/api/tasks/<task_id>', methods=['DELETE'])
def delete_task(task_id):
    """ Delete a task by ID """
    global tasks
    original_length = len(tasks)
    tasks = [task for task in tasks if task["id"] != task_id]

    if len(tasks) == original_length:
        return jsonify({"error": "Task not found"}), 404

    return jsonify({"message": "Task deleted"}), 200

@app.route('/api/tasks/<task_id>', methods=['PATCH'])
def update_task(task_id):
    """ Update a task title """
    data = request.json
    new_title = data.get("title", "").strip()

    if not new_title:
        return jsonify({"error": "New title is required"}), 400

    for task in tasks:
        if task["id"] == task_id:
            if any(t["title"].lower() == new_title.lower() for t in tasks if t["id"] != task_id):
                return jsonify({"error": "A task with this title already exists"}), 409
            
            task["title"] = new_title
            return jsonify(task), 200

    return jsonify({"error": "Task not found"}), 404

@app.route('/api/tasks/<task_id>/complete', methods=['PATCH'])
def mark_task_complete(task_id):
    """ Mark a task as completed """
    for task in tasks:
        if task["id"] == task_id:
            task["completed"] = True
            return jsonify(task), 200

    return jsonify({"error": "Task not found"}), 404

@app.route('/')
def home():
    return "Welcome to the TaskFlow API! Use /api/tasks to interact.", 200

if __name__ == '__main__':
    app.run(debug=True)
