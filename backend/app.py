from flask import Flask, request, jsonify
import json
import os
from flask_cors import CORS
import openai

# === INIT ===
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": [
    "http://localhost:3000",
    "http://127.0.0.1:5000",
    "https://avdevplanner.netlify.app"
]}}, supports_credentials=True)

client = openai.OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

# === FILES ===
TASK_FILE = 'tasks.json'
GOAL_FILE = 'goals.json'
LOG_FILE = 'logs.json'
NOTE_FILE = 'notes.json'
FOCUS_FILE = 'focus.json'
LESSON_FILE = 'lessons.json'
SCHEDULE_FILE = 'schedule.json'

# === HELPERS ===
def load_json(filename, default):
    if os.path.exists(filename):
        with open(filename, 'r') as f:
            return json.load(f)
    return default

def save_json(filename, data):
    with open(filename, 'w') as f:
        json.dump(data, f, indent=2)

# === TASKS ===
@app.route('/tasks', methods=['GET'])
def get_tasks():
    return jsonify(load_json(TASK_FILE, []))

@app.route('/tasks', methods=['POST'])
def add_task():
    tasks = load_json(TASK_FILE, [])
    tasks.append(request.json)
    save_json(TASK_FILE, tasks)
    return jsonify({"message": "Task added"}), 201

@app.route('/tasks/<int:index>', methods=['DELETE'])
def delete_task(index):
    tasks = load_json(TASK_FILE, [])
    if 0 <= index < len(tasks):
        tasks.pop(index)
        save_json(TASK_FILE, tasks)
        return jsonify({"message": "Task deleted"}), 200
    return jsonify({"error": "Task not found"}), 404

@app.route('/tasks/<int:index>/toggle', methods=['PATCH'])
def toggle_task(index):
    tasks = load_json(TASK_FILE, [])
    if 0 <= index < len(tasks):
        tasks[index]['completed'] = not tasks[index].get('completed', False)
        save_json(TASK_FILE, tasks)
        return jsonify({"message": "Task toggled"}), 200
    return jsonify({"error": "Task not found"}), 404

# === GOALS ===
@app.route('/goals', methods=['GET'])
def get_goals():
    return jsonify(load_json(GOAL_FILE, []))

@app.route('/goals', methods=['POST'])
def add_goal():
    goals = load_json(GOAL_FILE, [])
    goals.append(request.json)
    save_json(GOAL_FILE, goals)
    return jsonify({"message": "Goal added"}), 201

@app.route('/goals/<int:index>', methods=['PUT'])
def update_goal(index):
    goals = load_json(GOAL_FILE, [])
    if 0 <= index < len(goals):
        updated = request.json
        goals[index]['title'] = updated.get('title', goals[index]['title'])
        goals[index]['notes'] = updated.get('notes', goals[index]['notes'])
        save_json(GOAL_FILE, goals)
        return jsonify({"message": "Goal updated"}), 200
    return jsonify({"error": "Goal not found"}), 404

@app.route('/goals/<int:index>', methods=['DELETE'])
def delete_goal(index):
    goals = load_json(GOAL_FILE, [])
    if 0 <= index < len(goals):
        goals.pop(index)
        save_json(GOAL_FILE, goals)
        return jsonify({"message": "Goal deleted"}), 200
    return jsonify({"error": "Goal not found"}), 404

# === LOGS ===
@app.route('/logs', methods=['GET'])
def get_logs():
    return jsonify(load_json(LOG_FILE, {}))

@app.route('/logs', methods=['POST'])
def add_log():
    logs = load_json(LOG_FILE, {})
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
    save_json(LOG_FILE, logs)
    return jsonify({"message": "Log added"}), 201

@app.route('/logs/<date>/<int:index>', methods=['DELETE'])
def delete_log(date, index):
    logs = load_json(LOG_FILE, {})
    if date in logs and 0 <= index < len(logs[date]):
        logs[date].pop(index)
        if not logs[date]:
            del logs[date]
        save_json(LOG_FILE, logs)
        return jsonify({"message": "Log deleted"}), 200
    return jsonify({"error": "Log not found"}), 404

# === NOTES ===
@app.route('/notes', methods=['GET'])
def get_notes():
    return jsonify(load_json(NOTE_FILE, []))

@app.route('/notes', methods=['POST'])
def add_note():
    notes = load_json(NOTE_FILE, [])
    data = request.json
    notes.append({
        "title": data.get("title", ""),
        "content": data.get("content", ""),
        "date": data.get("date", ""),
        "pinned": data.get("pinned", False),
        "created_at": data.get("created_at", "")
    })
    save_json(NOTE_FILE, notes)
    return jsonify({"message": "Note added"}), 201

@app.route('/notes/<int:index>', methods=['PUT'])
def update_note(index):
    notes = load_json(NOTE_FILE, [])
    if 0 <= index < len(notes):
        updated = request.json
        notes[index]['title'] = updated.get('title', notes[index]['title'])
        notes[index]['content'] = updated.get('content', notes[index]['content'])
        notes[index]['pinned'] = updated.get('pinned', notes[index].get('pinned', False))
        save_json(NOTE_FILE, notes)
        return jsonify({"message": "Note updated"}), 200
    return jsonify({"error": "Note not found"}), 404

@app.route('/notes/<int:index>', methods=['DELETE'])
def delete_note(index):
    notes = load_json(NOTE_FILE, [])
    if 0 <= index < len(notes):
        notes.pop(index)
        save_json(NOTE_FILE, notes)
        return jsonify({"message": "Note deleted"}), 200
    return jsonify({"error": "Note not found"}), 404

# === FOCUS ===
@app.route('/focus', methods=['GET'])
def get_focus():
    focus_data = load_json(FOCUS_FILE, {})
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
    focus_data = load_json(FOCUS_FILE, {})
    focus_data[date] = focus
    save_json(FOCUS_FILE, focus_data)
    return jsonify({"message": "Focus saved"}), 201

# === LESSONS ===
@app.route('/lessons', methods=['GET'])
def get_lessons():
    return jsonify(load_json(LESSON_FILE, []))

@app.route('/lessons', methods=['POST'])
def add_lesson():
    lessons = load_json(LESSON_FILE, [])
    data = request.json
    lessons.append({
        "title": data.get("title", ""),
        "description": data.get("description", ""),
        "category": data.get("category", ""),
        "date": data.get("date", ""),
        "priority": data.get("priority", ""),
        "notes": data.get("notes", ""),
        "completed": False
    })
    save_json(LESSON_FILE, lessons)
    return jsonify({"message": "Lesson added"}), 201

@app.route('/lessons/<int:index>', methods=['PUT'])
def update_lesson(index):
    lessons = load_json(LESSON_FILE, [])
    if 0 <= index < len(lessons):
        updated = request.json
        lessons[index]['completed'] = updated.get('completed', lessons[index].get('completed', False))
        save_json(LESSON_FILE, lessons)
        return jsonify({"message": "Lesson updated"}), 200
    return jsonify({"error": "Lesson not found"}), 404

# === AI ROUTE ===
@app.route('/ai', methods=['POST'])
def ai_assistant():
    try:
        data = request.json
        prompt = data.get("prompt", "").strip()
        if not prompt:
            return jsonify({"error": "Prompt is required"}), 400

        system_message = """
You are a helpful productivity assistant.
When the user provides a message, return a structured JSON object with these keys:
- tasks: list of task objects (title, notes, date, completed)
- goals: list of goal objects (title, notes, completed)
- lessons: list of lesson objects (title, description, category, date, priority, notes, completed)
- schedule: list of scheduled items (title, date, time, notes)

Only include keys that apply. Use today's date only if no date is implied. Respond ONLY with valid JSON — no explanation.
        """

        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": system_message},
                {"role": "user", "content": prompt}
            ]
        )

        parsed = json.loads(response.choices[0].message.content.strip())

        # === TASKS ===
        tasks = load_json(TASK_FILE, [])
        for task in parsed.get("tasks", []):
            task["completed"] = task.get("completed", False)
            tasks.append(task)
        save_json(TASK_FILE, tasks)

        # === GOALS ===
        goals = load_json(GOAL_FILE, [])
        for goal in parsed.get("goals", []):
            goal["completed"] = goal.get("completed", False)
            goals.append(goal)
        save_json(GOAL_FILE, goals)

        # === LESSONS ===
        lessons = load_json(LESSON_FILE, [])
        for lesson in parsed.get("lessons", []):
            lesson["completed"] = lesson.get("completed", False)
            lessons.append(lesson)
        save_json(LESSON_FILE, lessons)

        # === SCHEDULE ===
        schedule = load_json(SCHEDULE_FILE, [])
        for item in parsed.get("schedule", []):
            schedule.append(item)
        save_json(SCHEDULE_FILE, schedule)

        # === Summary ===
        summary = {
            "tasks": len(parsed.get("tasks", [])),
            "goals": len(parsed.get("goals", [])),
            "lessons": len(parsed.get("lessons", [])),
            "schedule": len(parsed.get("schedule", []))
        }

        return jsonify({
            "message": f"✅ Added {summary['tasks']} task(s), {summary['goals']} goal(s), {summary['lessons']} lesson(s), {summary['schedule']} schedule item(s)."
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# === RUN ===
if __name__ == '__main__':
    app.run(debug=True)
