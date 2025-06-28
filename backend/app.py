from flask import Flask, request, jsonify
import json
import os
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

TASK_FILE = 'tasks.json'
GOAL_FILE = 'goals.json'

# === TASK HELPERS ===
def load_tasks():
    if os.path.exists(TASK_FILE):
        with open(TASK_FILE, 'r') as f:
            return json.load(f)
    return []

def save_tasks(tasks):
    with open(TASK_FILE, 'w') as f:
        json.dump(tasks, f, indent=2)

# === GOAL HELPERS ===
def load_goals():
    if os.path.exists(GOAL_FILE):
        with open(GOAL_FILE, 'r') as f:
            return json.load(f)
    return []

def save_goals(goals):
    with open(GOAL_FILE, 'w') as f:
        json.dump(goals, f, indent=2)

# === TASK ROUTES ===
@app.route('/tasks/<int:index>/toggle', methods=['PATCH'])
def toggle_tasks(index):
    tasks = load_tasks()
    if 0 <= index < len(tasks):
        tasks[index]['completed'] = not tasks[index].get('completed', False)
        save_tasks(tasks)
        return jsonify({"message": "Task toggled"}), 200
    return jsonify({"error": "Task not found"}), 404

@app.route('/tasks/<int:index>', methods=['DELETE'])
def delete_task(index):
    tasks = load_tasks()
    if 0 <= index < len(tasks):
        tasks.pop(index)
        save_tasks(tasks)
        return jsonify({"message": "Task deleted"}), 200
    return jsonify({"error": "Task not found"}), 404

@app.route('/tasks', methods=['POST'])
def add_task():
    tasks = load_tasks()
    new_task = request.json
    tasks.append(new_task)
    save_tasks(tasks)
    return jsonify({"message": "Task added"}), 201

@app.route('/tasks', methods=['GET'])
def get_tasks():
    return jsonify(load_tasks())

# === WEEKLY GOAL ROUTES ===
@app.route('/goals', methods=['GET'])
def get_goals():
    return jsonify(load_goals())

@app.route('/goals', methods=['POST'])
def add_goal():
    goals = load_goals()
    new_goal = request.json
    goals.append(new_goal)
    save_goals(goals)
    return jsonify({"message": "Goal added"}), 201

@app.route('/goals/<int:index>', methods=['PUT'])
def update_goal(index):
    goals = load_goals()
    if 0 <= index < len(goals):
        updated = request.json
        goals[index]['title'] = updated.get('title', goals[index]['title'])
        goals[index]['notes'] = updated.get('notes', goals[index]['notes'])
        save_goals(goals)
        return jsonify({"message": "Goal updated"}), 200
    return jsonify({"error": "Goal not found"}), 404

@app.route('/goals/<int:index>', methods=['DELETE'])
def delete_goal(index):
    goals = load_goals()
    if 0 <= index < len(goals):
        goals.pop(index)
        save_goals(goals)
        return jsonify({"message": "Goal deleted"}), 200
    return jsonify({"error": "Goal not found"}), 404

if __name__ == '__main__':
    app.run(debug=True)
