from flask import Flask, request, jsonify
import json
import os
from flask_cors import CORS


app = Flask(__name__)
CORS(app)
DATA_FILE = 'tasks.json'

def load_tasks():
  if os.path.exists(DATA_FILE):
    with open(DATA_FILE, 'r') as f:
      return json.load(f)
    return []
  
def save_tasks(tasks):
  with open(DATA_FILE, 'w') as f:
    json.dump(tasks, f, indent=2)


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
    print("Received new task:", new_task)  # 👈 Debug log

    tasks.append(new_task)
    save_tasks(tasks)
    print("Saved tasks:", tasks)  # 👈 Confirm it saved

    return jsonify({"message": "Task added"}), 201



@app.route('/tasks', methods=['GET'])
def get_tasks():
  tasks = load_tasks()
  return jsonify(tasks)



if __name__ == '__main__':
  app.run(debug=True)