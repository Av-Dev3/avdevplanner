from flask import Flask, request, jsonify
import json
import os
from flask_cors import CORS, cross_origin
import openai
from datetime import datetime
from zoneinfo import ZoneInfo
import uuid
from dateutil import parser  # For parsing ISO strings safely

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

# === UTILITIES ===
def load_json(filename, default):
    if os.path.exists(filename):
        with open(filename, 'r') as f:
            return json.load(f)
    return default

def save_json(filename, data):
    with open(filename, 'w') as f:
        json.dump(data, f, indent=2)

def get_vegas_time():
    return datetime.now(ZoneInfo("America/Los_Angeles"))

def format_pretty_date(dt_obj):
    return dt_obj.strftime("%B %-d, %Y").replace(" 0", " ")

def format_pretty_time(dt_obj):
    return dt_obj.strftime("%-I:%M %p").lower()

def parse_datetime_safe(date_str):
    try:
        return parser.parse(date_str)
    except:
        return None
# === TASKS ===
@app.route('/tasks', methods=['GET'])
def get_tasks():
    tasks = load_json(TASK_FILE, [])
    for task in tasks:
        # Safe date parsing
        date_str = task.get("date", "")
        date_obj = None
        if date_str:
            try:
                if "T" in date_str:
                    date_obj = parse_datetime_safe(date_str)
                else:
                    date_obj = datetime.strptime(date_str, "%Y-%m-%d").replace(tzinfo=ZoneInfo("America/Los_Angeles"))
            except Exception as e:
                print("Date parse error:", e)

        # Safe time parsing
        # Safe time parsing
# Safe time parsing
            time_str = task.get("time", "")
            time_obj = None
            if time_str:
                try:
                # Expecting HH:MM format
                    h, m = map(int, time_str.split(":"))
                    now_vegas = datetime.now(ZoneInfo("America/Los_Angeles"))
                    time_obj = now_vegas.replace(hour=h, minute=m, second=0, microsecond=0)
                except Exception as e:
                    print("Time parse error:", e)



        if date_obj:
            if date_obj.tzinfo is None:
                date_obj = date_obj.replace(tzinfo=ZoneInfo("America/Los_Angeles"))
            else:
                date_obj = date_obj.astimezone(ZoneInfo("America/Los_Angeles"))
            task["prettyDate"] = format_pretty_date(date_obj)

        if time_obj:
            if time_obj.tzinfo is None:
                time_obj = time_obj.replace(tzinfo=ZoneInfo("America/Los_Angeles"))
            else:
                time_obj = time_obj.astimezone(ZoneInfo("America/Los_Angeles"))
            task["prettyTime"] = format_pretty_time(time_obj)

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
        # Safe date parsing
        date_str = goal.get("date", "")
        date_obj = None
        if date_str:
            try:
                if "T" in date_str:
                    date_obj = parse_datetime_safe(date_str)
                else:
                    date_obj = datetime.strptime(date_str, "%Y-%m-%d").replace(tzinfo=ZoneInfo("America/Los_Angeles"))
            except Exception as e:
                print("Goal date parse error:", e)

        # Safe time parsing
        time_str = goal.get("time", "")
        time_obj = None
        if time_str:
            try:
                h, m = map(int, time_str.split(":"))
                now_vegas = datetime.now(ZoneInfo("America/Los_Angeles"))
                time_obj = now_vegas.replace(hour=h, minute=m, second=0, microsecond=0)
            except Exception as e:
                print("Goal time parse error:", e)

        if date_obj:
            if date_obj.tzinfo is None:
                date_obj = date_obj.replace(tzinfo=ZoneInfo("America/Los_Angeles"))
            else:
                date_obj = date_obj.astimezone(ZoneInfo("America/Los_Angeles"))
            goal["prettyDate"] = format_pretty_date(date_obj)

        if time_obj:
            if time_obj.tzinfo is None:
                time_obj = time_obj.replace(tzinfo=ZoneInfo("America/Los_Angeles"))
            else:
                time_obj = time_obj.astimezone(ZoneInfo("America/Los_Angeles"))
            goal["prettyTime"] = format_pretty_time(time_obj)

    return jsonify(goals)

@app.route('/goals', methods=['POST'])
@cross_origin()
def add_goal():
    try:
        data = request.json
        if not data:
            return jsonify({"error": "Missing JSON data"}), 400

        goals = load_json(GOAL_FILE, [])
        goal = {
            "title": data.get("title", ""),
            "notes": data.get("notes", ""),
            "date": data.get("date", ""),
            "time": data.get("time", ""),
            "completed": data.get("completed", False)
        }
        goals.append(goal)
        save_json(GOAL_FILE, goals)
        return jsonify({"message": "Goal added"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/goals/<int:index>', methods=['PUT'])
def update_goal(index):
    goals = load_json(GOAL_FILE, [])
    if 0 <= index < len(goals):
        updated = request.json
        goals[index]['title'] = updated.get('title', goals[index]['title'])
        goals[index]['notes'] = updated.get('notes', goals[index]['notes'])
        goals[index]['date'] = updated.get('date', goals[index].get('date'))
        goals[index]['time'] = updated.get('time', goals[index].get('time', ""))
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


# === LOGS ===
@app.route('/logs', methods=['GET'])
def get_logs():
    return jsonify(load_json(LOG_FILE, {}))

@app.route('/logs', methods=['POST'])
def add_log():
    try:
        data = request.json
        date = data.get("date")
        if not date:
            return jsonify({"error": "Date is required"}), 400

        logs = load_json(LOG_FILE, {})
        entry = {
            "title": data.get("title", ""),
            "content": data.get("content", ""),
            "timestamp": data.get("timestamp", "")
        }

        logs.setdefault(date, []).append(entry)
        save_json(LOG_FILE, logs)
        return jsonify({"message": "Log added"}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500

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
from uuid import uuid4
# === NOTES ROUTES ===
@app.route('/notes', methods=['GET'])
def get_notes():
    notes = load_json(NOTE_FILE, [])
    for note in notes:
        date_str = note.get("date") or note.get("created_at", "")
        date_obj = None

        if date_str:
            try:
                if "T" in date_str:
                    date_obj = parse_datetime_safe(date_str)
                else:
                    date_obj = datetime.strptime(date_str, "%Y-%m-%d").replace(tzinfo=ZoneInfo("America/Los_Angeles"))
            except Exception as e:
                print("Note date parse error:", e)

        if date_obj:
            if date_obj.tzinfo is None:
                date_obj = date_obj.replace(tzinfo=ZoneInfo("America/Los_Angeles"))
            else:
                date_obj = date_obj.astimezone(ZoneInfo("America/Los_Angeles"))
            note["prettyDate"] = format_pretty_date(date_obj)
            note["prettyTime"] = format_pretty_time(date_obj)
        else:
            note["prettyDate"] = date_str
            note["prettyTime"] = ""

    return jsonify(notes)

@app.route('/notes', methods=['POST'])
def add_note():
    notes = load_json(NOTE_FILE, [])
    data = request.json

    new_id = max([n.get("id", -1) for n in notes], default=-1) + 1

    notes.append({
        "id": new_id,
        "title": data.get("title", ""),
        "content": data.get("content", ""),
        "date": data.get("date", ""),
        "pinned": data.get("pinned", False),
        "created_at": data.get("created_at", ""),
        "tags": data.get("tags", []),
        "notebook": data.get("notebook", "")
    })
    save_json(NOTE_FILE, notes)
    return jsonify({"message": "Note added", "id": new_id}), 201

@app.route('/notes/<int:note_id>', methods=['PUT'])
def update_note(note_id):
    notes = load_json(NOTE_FILE, [])
    for note in notes:
        if note.get("id") == note_id:
            updated = request.json
            note["title"] = updated.get("title", note["title"])
            note["content"] = updated.get("content", note["content"])
            note["pinned"] = updated.get("pinned", note.get("pinned", False))
            note["tags"] = updated.get("tags", note.get("tags", []))
            note["notebook"] = updated.get("notebook", note.get("notebook", ""))
            save_json(NOTE_FILE, notes)
            return jsonify({"message": "Note updated"}), 200
    return jsonify({"error": "Note not found"}), 404

@app.route('/notes/<int:note_id>', methods=['DELETE'])
def delete_note(note_id):
    notes = load_json(NOTE_FILE, [])
    updated_notes = [note for note in notes if note.get("id") != note_id]
    if len(updated_notes) < len(notes):
        save_json(NOTE_FILE, updated_notes)
        return jsonify({"message": "Note deleted"}), 200
    return jsonify({"error": "Note not found"}), 404



# === REFLECTIONS ===
@app.route('/reflections', methods=['GET'])
def get_reflections():
    return jsonify(load_json(REFLECTIONS_FILE, {}))

@app.route('/reflections', methods=['POST'])
def save_reflections():
    data = request.json
    week = data.get("week")  # e.g., "2025-07-14"
    if not week:
        return jsonify({"error": "Week is required"}), 400

    reflections = load_json(REFLECTIONS_FILE, {})
    reflections[week] = {
        "what_went_well": data.get("what_went_well", ""),
        "what_to_improve": data.get("what_to_improve", "")
    }

    save_json(REFLECTIONS_FILE, reflections)
    return jsonify({"message": "Reflection saved"}), 201

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

        vegas = ZoneInfo("America/Los_Angeles")
        today = datetime.now(vegas).strftime('%Y-%m-%d')

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

# === LESSONS ===
@app.route('/lessons', methods=['GET'])
def get_lessons():
    lessons = load_json(LESSON_FILE, [])
    for lesson in lessons:
        # === Safe date parsing ===
        date_str = lesson.get("date", "")
        date_obj = None
        if date_str:
            try:
                if "T" in date_str:
                    date_obj = parse_datetime_safe(date_str)
                else:
                    date_obj = datetime.strptime(date_str, "%Y-%m-%d").replace(tzinfo=ZoneInfo("America/Los_Angeles"))
            except Exception as e:
                print("Lesson date parse error:", e)

        # === Safe time parsing ===
        time_str = lesson.get("time", "")
        time_obj = None
        if time_str:
            try:
                h, m = map(int, time_str.split(":"))
                now_vegas = datetime.now(ZoneInfo("America/Los_Angeles"))
                time_obj = now_vegas.replace(hour=h, minute=m, second=0, microsecond=0)
            except Exception as e:
                print("Lesson time parse error:", e)

        # === Format date/time ===
        if date_obj:
            if date_obj.tzinfo is None:
                date_obj = date_obj.replace(tzinfo=ZoneInfo("America/Los_Angeles"))
            else:
                date_obj = date_obj.astimezone(ZoneInfo("America/Los_Angeles"))
            lesson["prettyDate"] = format_pretty_date(date_obj)

        if time_obj:
            if time_obj.tzinfo is None:
                time_obj = time_obj.replace(tzinfo=ZoneInfo("America/Los_Angeles"))
            else:
                time_obj = time_obj.astimezone(ZoneInfo("America/Los_Angeles"))
            lesson["prettyTime"] = format_pretty_time(time_obj)

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
        "time": data.get("time", ""),  # time now supported
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
            lessons[i] = {
                **lesson,
                **updated_data
            }
            save_json(LESSON_FILE, lessons)
            return jsonify({"message": "Lesson updated"}), 200

    return jsonify({"error": "Lesson not found"}), 404

@app.route('/schedule', methods=['GET'])
def get_schedule():
    return jsonify(load_json(SCHEDULE_FILE, []))

# === COLLECTIONS ===
@app.route('/collections', methods=['GET'])
def get_collections():
    return jsonify(load_json("collections.json", {}))

@app.route('/collections', methods=['POST'])
def add_to_collection():
    data = request.json
    collection = data.get("collection")
    note_id = data.get("note_id")

    if not collection or note_id is None:
        return jsonify({"error": "Missing data"}), 400

    collections = load_json("collections.json", {})
    if collection not in collections:
        collections[collection] = []

    if note_id not in collections[collection]:
        collections[collection].append(note_id)

    save_json("collections.json", collections)
    return jsonify({"message": "Added to collection"}), 200
