from flask import Flask, request, jsonify
import json
import os
from flask_cors import CORS, cross_origin
import openai
from datetime import datetime, time
from zoneinfo import ZoneInfo
import uuid

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": [
    "http://localhost:3000",
    "http://127.0.0.1:5000",
    "https://avdevplanner.netlify.app",
    "https://localhost",
    "capacitor://localhost"
]}}, supports_credentials=True)

client = openai.OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

DATA_DIR = "/mnt/data"
TASK_FILE = os.path.join(DATA_DIR, 'tasks.json')
GOAL_FILE = os.path.join(DATA_DIR, 'goals.json')
LOG_FILE = os.path.join(DATA_DIR, 'logs.json')
NOTE_FILE = os.path.join(DATA_DIR, 'notes.json')
FOCUS_FILE = os.path.join(DATA_DIR, 'focus.json')
LESSON_FILE = os.path.join(DATA_DIR, 'lessons.json')
SCHEDULE_FILE = os.path.join(DATA_DIR, 'schedule.json')
TIME_FILE = os.path.join(DATA_DIR, 'time.json')
REFLECTIONS_FILE = os.path.join(DATA_DIR, 'reflections.json')

LV_TZ = ZoneInfo("America/Los_Angeles")

def load_json(filename, default):
    if os.path.exists(filename):
        with open(filename, 'r') as f:
            return json.load(f)
    return default

def save_json(filename, data):
    with open(filename, 'w') as f:
        json.dump(data, f, indent=2)

def format_pretty_date(date_str):
    try:
        date = datetime.strptime(date_str, "%Y-%m-%d").replace(tzinfo=ZoneInfo("UTC")).astimezone(LV_TZ)
        day = date.day
        suffix = "th" if 11 <= day <= 13 else {1:"st", 2:"nd", 3:"rd"}.get(day % 10, "th")
        return date.strftime(f"%B {day}{suffix}, %Y")
    except:
        return date_str

def format_pretty_time(time_str):
    try:
        t = datetime.strptime(time_str, "%H:%M").time()
        return datetime.combine(datetime.today(), t).strftime("%-I:%M %p")
    except:
        return time_str

# === TASKS ===
@app.route('/tasks', methods=['GET'])
def get_tasks():
    tasks = load_json(TASK_FILE, [])
    for task in tasks:
        task["prettyDate"] = format_pretty_date(task.get("date", ""))
        if "time" in task and task["time"]:
            task["prettyTime"] = format_pretty_time(task["time"])
    return jsonify(tasks)

@app.route('/tasks/<int:index>', methods=['PUT'])
def update_task(index):
    tasks = load_json(TASK_FILE, [])
    if 0 <= index < len(tasks):
        updated = request.json
        tasks[index].update(updated)
        save_json(TASK_FILE, tasks)
        return jsonify({"message": "Task updated"}), 200
    return jsonify({"error": "Task not found"}), 404

@app.route('/tasks', methods=['POST'])
@cross_origin()
def add_task():
    try:
        data = request.json
        if not data:
            return jsonify({"error": "Missing JSON data"}), 400

        tasks = load_json(TASK_FILE, [])
        task = {
            "title": data.get("title", ""),
            "notes": data.get("notes", ""),
            "date": data.get("date", ""),
            "time": data.get("time", ""),
            "completed": data.get("completed", False),
            "subtasks": data.get("subtasks", [])
        }
        tasks.append(task)
        save_json(TASK_FILE, tasks)
        return jsonify({"message": "Task added"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

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
    goals = load_json(GOAL_FILE, [])
    for goal in goals:
        goal["prettyDate"] = format_pretty_date(goal.get("date", ""))
    return jsonify(goals)

@app.route('/goals', methods=['POST'])
def add_goal():
    goals = load_json(GOAL_FILE, [])
    new_goal = request.json
    new_goal["completed"] = new_goal.get("completed", False)
    goals.append(new_goal)
    save_json(GOAL_FILE, goals)
    return jsonify({"message": "Goal added"}), 201

@app.route('/goals/<int:index>', methods=['PUT'])
def update_goal(index):
    goals = load_json(GOAL_FILE, [])
    if 0 <= index < len(goals):
        updated = request.json
        goals[index]['title'] = updated.get('title', goals[index]['title'])
        goals[index]['notes'] = updated.get('notes', goals[index]['notes'])
        goals[index]['date'] = updated.get('date', goals[index].get('date'))
        goals[index]['completed'] = updated.get('completed', goals[index].get('completed', False))
        save_json(GOAL_FILE, goals)
        return jsonify({"message": "Goal updated"}), 200
    return jsonify({"error": "Goal not found"}), 404

@app.route('/goals/<int:index>/toggle', methods=['PATCH'])
def toggle_goal(index):
    goals = load_json(GOAL_FILE, [])
    if 0 <= index < len(goals):
        goals[index]['completed'] = not goals[index].get('completed', False)
        save_json(GOAL_FILE, goals)
        return jsonify({"message": "Goal toggled"}), 200
    return jsonify({"error": "Goal not found"}), 404

@app.route('/goals/<int:index>', methods=['DELETE'])
def delete_goal(index):
    goals = load_json(GOAL_FILE, [])
    if 0 <= index < len(goals):
        goals.pop(index)
        save_json(GOAL_FILE, goals)
        return jsonify({"message": "Goal deleted"}), 200
    return jsonify({"error": "Goal not found"}), 404

# === LESSONS ===
@app.route('/lessons', methods=['GET'])
def get_lessons():
    lessons = load_json(LESSON_FILE, [])
    for lesson in lessons:
        lesson["prettyDate"] = format_pretty_date(lesson.get("date", ""))
    return jsonify(lessons)

@app.route('/lessons', methods=['POST'])
def add_lesson():
    lessons = load_json(LESSON_FILE, [])
    data = request.json
    lessons.append({
        "id": str(uuid.uuid4()),
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

@app.route("/lessons/<string:lesson_id>", methods=["DELETE"])
def delete_lesson(lesson_id):
    lessons = load_json(LESSON_FILE, [])
    updated_lessons = [lesson for lesson in lessons if lesson.get("id") != lesson_id]
    if len(updated_lessons) == len(lessons):
        return jsonify({"error": "Lesson not found"}), 404
    save_json(LESSON_FILE, updated_lessons)
    return jsonify({"message": "Lesson deleted"}), 200

@app.route('/lessons/<string:lesson_id>', methods=['PUT'])
def update_lesson(lesson_id):
    lessons = load_json(LESSON_FILE, [])
    updated_data = request.json
    for i, lesson in enumerate(lessons):
        if lesson.get("id") == lesson_id:
            lessons[i] = {**lesson, **updated_data}
            save_json(LESSON_FILE, lessons)
            return jsonify({"message": "Lesson updated"}), 200
    return jsonify({"error": "Lesson not found"}), 404

# === SCHEDULE ===
@app.route('/schedule', methods=['GET'])
def get_schedule():
    return jsonify(load_json(SCHEDULE_FILE, []))

# === TIME TRACKER ===
@app.route('/time', methods=['GET'])
def get_time_data():
    return jsonify(load_json(TIME_FILE, {}))

@app.route('/time', methods=['POST'])
def add_time_entry():
    data = request.json
    date = data.get("date")
    minutes = data.get("minutes")

    if not date or minutes is None:
        return jsonify({"error": "Date and minutes are required"}), 400

    time_data = load_json(TIME_FILE, {})
    time_data[date] = time_data.get(date, 0) + minutes
    save_json(TIME_FILE, time_data)

    return jsonify({"message": "Time updated"}), 201

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
        today = datetime.now(ZoneInfo("America/Los_Angeles")).strftime('%Y-%m-%d')

        tasks = load_json(TASK_FILE, [])
        for task in parsed.get("tasks", []):
            task["completed"] = task.get("completed", False)
            task["text"] = task.get("text", task.get("title", ""))
            task["date"] = task.get("date") or today
            tasks.append(task)
        save_json(TASK_FILE, tasks)

        goals = load_json(GOAL_FILE, [])
        for goal in parsed.get("goals", []):
            goal["completed"] = goal.get("completed", False)
            goals.append(goal)
        save_json(GOAL_FILE, goals)

        lessons = load_json(LESSON_FILE, [])
        for lesson in parsed.get("lessons", []):
            lesson["completed"] = lesson.get("completed", False)
            lessons.append(lesson)
        save_json(LESSON_FILE, lessons)

        schedule = load_json(SCHEDULE_FILE, [])
        for item in parsed.get("schedule", []):
            item["date"] = item.get("date") or today
            schedule.append(item)
        save_json(SCHEDULE_FILE, schedule)

        parts = []
        if parsed.get("tasks"): parts.append(f"{len(parsed['tasks'])} task{'s' if len(parsed['tasks']) != 1 else ''}")
        if parsed.get("goals"): parts.append(f"{len(parsed['goals'])} goal{'s' if len(parsed['goals']) != 1 else ''}")
        if parsed.get("lessons"): parts.append(f"{len(parsed['lessons'])} lesson{'s' if len(parsed['lessons']) != 1 else ''}")
        if parsed.get("schedule"): parts.append(f"{len(parsed['schedule'])} schedule item{'s' if len(parsed['schedule']) != 1 else ''}")

        if parts:
            message = f"All set! I added {', '.join(parts)} to your planner."
        else:
            message = "I didn't find anything to add. Try giving me a task, goal, or lesson to help you plan."

        return jsonify({
            "response": message,
            "tasks": parsed.get("tasks", []),
            "goals": parsed.get("goals", []),
            "lessons": parsed.get("lessons", []),
            "schedule": parsed.get("schedule", [])
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# === REFLECTIONS ===
@app.route('/reflections', methods=['GET'])
def get_reflections():
    return jsonify(load_json(REFLECTIONS_FILE, {}))

@app.route('/reflections', methods=['POST'])
def save_reflections():
    data = request.json
    week = data.get("week")
    if not week:
        return jsonify({"error": "Week is required"}), 400

    reflections = load_json(REFLECTIONS_FILE, {})
    reflections[week] = {
        "what_went_well": data.get("what_went_well", ""),
        "what_to_improve": data.get("what_to_improve", "")
    }

    save_json(REFLECTIONS_FILE, reflections)
    return jsonify({"message": "Reflection saved"}), 201

if __name__ == '__main__':
    app.run(debug=True)
