from flask import Flask, request, jsonify
import json
import os
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# === Task file paths ===
TASKS_FILE = 'tasks.json'
GOALS_FILE = 'goals.json'

# === Shared helpers ===
def load_json(filename):
    if os.path.exists(filename):
        with open(filename, 'r') as f:
            return json.load(f)
    return []

def save_json(data, filename):
    with open(filename, 'w') as f:
        json.dump(data, f, indent=2)

# === TASK ROUTES (do not touch) ===
@app.route('/tasks/<int:index>/toggle', methods=['PATCH'])
def toggle_tasks(index):
    tasks = load_json(TASKS_FILE)
    if 0 <= index < len(tasks):
        tasks[index]['completed'] = not tasks[index].get('completed', False)
        save_json(tasks, TASKS_FILE)
        return jsonify({"message": "Task toggled"}), 200
    return jsonify({"error": "Task not found"}), 404

@app.route('/tasks/<int:index>', methods=['DELETE'])
def delete_task(index):
    tasks = load_json(TASKS_FILE)
    if 0 <= index < len(tasks):
        tasks.pop(index)
        save_json(tasks, TASKS_FILE)
        return jsonify({"message": "Task deleted"}), 200
    return jsonify({"error": "Task not found"}), 404

@app.route('/tasks', methods=['POST'])
def add_task():
    tasks = load_json(TASKS_FILE)
    new_task = request.json
    tasks.append(new_task)
    save_json(tasks, TASKS_FILE)
    return jsonify({"message": "Task added"}), 201

@app.route('/tasks', methods=['GET'])
def get_tasks():
    tasks = load_json(TASKS_FILE)
    return jsonify(tasks)

# === WEEKLY GOAL ROUTES ===
@app.route('/goals', methods=['GET'])
def get_goals():
    goals = load_json(GOALS_FILE)
    return jsonify(goals)

@app.route('/goals', methods=['POST'])
def add_goal():
    goals = load_json(GOALS_FILE)
    new_goal = request.json
    goals.append(new_goal)
    save_json(goals, GOALS_FILE)
    return jsonify({"message": "Goal added"}), 201

@app.route('/goals/<int:index>', methods=['PUT'])
def update_goal(index):
    goals = load_json(GOALS_FILE)
    if 0 <= index < len(goals):
        updated_goal = request.json
        goals[index] = updated_goal
        save_json(goals, GOALS_FILE)
        return jsonify({"message": "Goal updated"}), 200
    return jsonify({"error": "Goal not found"}), 404

@app.route('/goals/<int:index>', methods=['DELETE'])
def delete_goal(index):
    goals = load_json(GOALS_FILE)
    if 0 <= index < len(goals):
        goals.pop(index)
        save_json(goals, GOALS_FILE)
        return jsonify({"message": "Goal deleted"}), 200
    return jsonify({"error": "Goal not found"}), 404

if __name__ == '__main__':
    app.run(debug=True)
