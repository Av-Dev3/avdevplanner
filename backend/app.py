from flask import Flask, request, jsonify
import json
import os
from flask_cors import CORS

app = Flask(__name__)

# === CORS CONFIG FOR PRODUCTION ===
CORS(app, resources={r"/*": {"origins": [
    "http://localhost:3000",
    "http://127.0.0.1:5000",
    "https://avdevplanner.netlify.app"
]}})

TASK_FILE = 'tasks.json'
GOAL_FILE = 'goals.json'
LOG_FILE = 'logs.json'

# === HELPERS ===
def load_data(file_path, default):
    if os.path.exists(file_path):
        with open(file_path, 'r') as f:
            try:
                return json.load(f)
            except json.JSONDecodeError:
                return default
    return default

def save_data(file_path, data):
    with open(file_path, 'w') as f:
        json.dump(data, f, indent=2)

# === TASK ROUTES ===
@app.route('/tasks/<int:index>/toggle', methods=['PATCH'])
def toggle_tasks(index):
    tasks = load_data(TASK_FILE, [])
    if 0 <= index < len(tasks):
        tasks[index]['completed'] = not tasks[index].get('completed', False)
        save_data(TASK_FILE, tasks)
        return jsonify({"message": "Task toggled"}), 200
    return jsonify({"error": "Task not found"}), 404

@app.route('/tasks/<int:index>', methods=['DELETE'])
def delete_task(index):
    tasks = load_data(TASK_FILE, [])
    if 0 <= index < len(tasks):
        tasks.pop(index)
        save_data(TASK_FILE, tasks)
        return jsonify({"message": "Task deleted"}), 200
    return jsonify({"error": "Task not found"}), 404

@app.route('/tasks', methods=['POST'])
def add_task():
    tasks = load_data(TASK_FILE, [])
    new_task = request.json
    tasks.append(new_task)
    save_data(TASK_FILE, tasks)
    return jsonify({"message": "Task added"}), 201

@app.route('/tasks', methods=['GET'])
def get_tasks():
    return jsonify(load_data(TASK_FILE, []))

# === GOAL ROUTES ===
@app.route('/goals', methods=['GET'])
def get_goals():
    return jsonify(load_data(GOAL_FILE, []))

@app.route('/goals', methods=['POST'])
def add_goal():
    goals = load_data(GOAL_FILE, [])
    new_goal = request.json
    goals.append(new_goal)
    save_data(GOAL_FILE, goals)
    return jsonify({"message": "Goal added"}), 201

@app.route('/goals/<int:index>', methods=['PUT'])
def update_goal(index):
    goals = load_data(GOAL_FILE, [])
    if 0 <= index < len(goals):
        updated = request.json
        goals[index]['title'] = updated.get('title', goals[index]['title'])
        goals[index]['notes'] = updated.get('notes', goals[index]['notes'])
        save_data(GOAL_FILE, goals)
        return jsonify({"message": "Goal updated"}), 200
    return jsonify({"error": "Goal not found"}), 404

@app.route('/goals/<int:index>', methods=['DELETE'])
def delete_goal(index):
    goals = load_data(GOAL_FILE, [])
    if 0 <= index < len(goals):
        goals.pop(index)
        save_data(GOAL_FILE, goals)
        return jsonify({"message": "Goal deleted"}), 200
    return jsonify({"error": "Goal not found"}), 404

# === LOG ROUTES ===
@app.route('/logs', methods=['GET'])
def get_logs():
    return jsonify(load_data(LOG_FILE, {}))

@app.route('/logs', methods=['POST'])
def add_log():
    logs = load_data(LOG_FILE, {})
    data = request.json
    date = data.get("date")
    if not date:
        return jsonify({"error": "Date is required"}), 400

    entry = {
        "title": data.get("title", ""),
        "content": data.get("content", ""),
        "timestamp": data.get("timestamp", "")
    }

    logs.setdefault(date, []).append(entry)
    save_data(LOG_FILE, logs)
    return jsonify({"message": "Log added"}), 201

if __name__ == '__main__':
    app.run(debug=True)
