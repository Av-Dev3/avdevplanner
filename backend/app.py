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
]}}, supports_credentials=True)

# === FILES ===
TASK_FILE = 'tasks.json'
GOAL_FILE = 'goals.json'
LOG_FILE = 'logs.json'
NOTE_FILE = 'notes.json'
FOCUS_FILE = 'focus.json'
LESSON_FILE = 'lessons.json'

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

# === LOG HELPERS ===
def load_logs():
    if os.path.exists(LOG_FILE):
        with open(LOG_FILE, 'r') as f:
            return json.load(f)
    return {}

def save_logs(logs):
    with open(LOG_FILE, 'w') as f:
        json.dump(logs, f, indent=2)

# === NOTE HELPERS ===
def load_notes():
    if os.path.exists(NOTE_FILE):
        with open(NOTE_FILE, 'r') as f:
            return json.load(f)
    return []

def save_notes(notes):
    with open(NOTE_FILE, 'w') as f:
        json.dump(notes, f, indent=2)

# === FOCUS HELPERS ===
def load_focus():
    if os.path.exists(FOCUS_FILE):
        with open(FOCUS_FILE, 'r') as f:
            return json.load(f)
    return {}

def save_focus(focus_data):
    with open(FOCUS_FILE, 'w') as f:
        json.dump(focus_data, f, indent=2)

# === LESSON HELPERS ===
def load_lessons():
    if os.path.exists(LESSON_FILE):
        with open(LESSON_FILE, 'r') as f:
            return json.load(f)
    return []

def save_lessons(lessons):
    with open(LESSON_FILE, 'w') as f:
        json.dump(lessons, f, indent=2)

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

# === LOG ROUTES ===
@app.route('/logs', methods=['GET'])
def get_logs():
    return jsonify(load_logs())

@app.route('/logs', methods=['POST'])
def add_log():
    logs = load_logs()
    data = request.json
    date = data.get("date")
    if not date:
        return jsonify({"error": "Date is required"}), 400

    entry = {
        "title": data.get("title", ""),
        "content": data.get("content", ""),
        "timestamp": data.get("timestamp", "")
    }

    if date not in logs:
        logs[date] = []
    logs[date].append(entry)

    save_logs(logs)
    return jsonify({"message": "Log added"}), 201

@app.route('/logs/<date>/<int:index>', methods=['DELETE'])
def delete_log(date, index):
    logs = load_logs()
    if date in logs and 0 <= index < len(logs[date]):
        logs[date].pop(index)
        if not logs[date]:
            del logs[date]
        save_logs(logs)
        return jsonify({"message": "Log deleted"}), 200
    return jsonify({"error": "Log not found"}), 404

# === GOAL ROUTES ===
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

# === NOTE ROUTES ===
@app.route('/notes', methods=['GET'])
def get_notes():
    return jsonify(load_notes())

@app.route('/notes', methods=['POST'])
def add_note():
    notes = load_notes()
    data = request.json

    new_note = {
        "title": data.get("title", ""),
        "content": data.get("content", ""),
        "date": data.get("date", ""),
        "pinned": data.get("pinned", False),
        "created_at": data.get("created_at", "")
    }

    notes.append(new_note)
    save_notes(notes)
    return jsonify({"message": "Note added"}), 201

@app.route('/notes/<int:index>', methods=['PUT'])
def update_note(index):
    notes = load_notes()
    if 0 <= index < len(notes):
        updated = request.json
        notes[index]['title'] = updated.get('title', notes[index]['title'])
        notes[index]['content'] = updated.get('content', notes[index]['content'])
        notes[index]['pinned'] = updated.get('pinned', notes[index].get('pinned', False))
        save_notes(notes)
        return jsonify({"message": "Note updated"}), 200
    return jsonify({"error": "Note not found"}), 404

@app.route('/notes/<int:index>', methods=['DELETE'])
def delete_note(index):
    notes = load_notes()
    if 0 <= index < len(notes):
        notes.pop(index)
        save_notes(notes)
        return jsonify({"message": "Note deleted"}), 200
    return jsonify({"error": "Note not found"}), 404

# === FOCUS ROUTES ===
@app.route('/focus', methods=['GET'])
def get_focus():
    focus_data = load_focus()
    date = request.args.get("date")
    if date:
        return jsonify({"focus": focus_data.get(date, "")}), 200
    return jsonify(focus_data), 200

@app.route('/focus', methods=['POST'])
def save_focus_entry():
    data = request.json
    date = data.get("date")
    focus = data.get("focus", "").strip()

    if not date or not focus:
        return jsonify({"error": "Date and focus are required"}), 400

    focus_data = load_focus()
    focus_data[date] = focus
    save_focus(focus_data)
    return jsonify({"message": "Focus saved"}), 201

# === LESSON ROUTES ===
@app.route('/lessons', methods=['GET'])
def get_lessons():
    return jsonify(load_lessons())

@app.route('/lessons', methods=['POST'])
def add_lesson():
    lessons = load_lessons()
    data = request.json

    new_lesson = {
        "title": data.get("title", ""),
        "description": data.get("description", ""),
        "category": data.get("category", ""),
        "date": data.get("date", ""),
        "priority": data.get("priority", ""),
        "notes": data.get("notes", ""),
        "completed": False
    }

    lessons.append(new_lesson)
    save_lessons(lessons)
    return jsonify({"message": "Lesson added"}), 201

@app.route('/lessons/<int:index>', methods=['PUT'])
def update_lesson(index):
    lessons = load_lessons()
    if 0 <= index < len(lessons):
        updated = request.json
        lessons[index]['completed'] = updated.get('completed', lessons[index].get('completed', False))
        save_lessons(lessons)
        return jsonify({"message": "Lesson updated"}), 200
    return jsonify({"error": "Lesson not found"}), 404

if __name__ == '__main__':
    app.run(debug=True)
