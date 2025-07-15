from flask import Flask, request, jsonify
import json
import os
from flask_cors import CORS, cross_origin
from openai import OpenAI
from datetime import datetime
import base64
from werkzeug.utils import secure_filename


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
  # NEW

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
    "text": data.get("text", data.get("title", "")),  # ✅ Add this line
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
    return jsonify(load_json(GOAL_FILE, []))

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
        today = datetime.utcnow().strftime('%Y-%m-%d')

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

@app.route('/chat', methods=['POST'])
def full_chat():
    try:
        data = request.get_json()
        prompt = data.get("prompt", "").strip()
        image_data = data.get("image")

        if not prompt and not image_data:
            return jsonify({"error": "Prompt or image is required"}), 400

        messages = [{
            "role": "system",
            "content": (
                "You are a helpful assistant. Respond ONLY with a valid JSON object.\n"
                "Your JSON must include:\n"
                "- response: your message to the user\n"
                "- tasks (optional): list of {title, notes, date, completed}\n"
                "- goals (optional): list of {title, notes, completed}\n"
                "- lessons (optional): list of {title, description, category, date, priority, notes, completed}\n"
                "- schedule (optional): list of {title, date, time, notes}\n"
                "Only include keys that apply. Use today's date if none is given. Do not include anything outside the JSON."
            )
        }]

        if image_data:
            base64_image = image_data.get("data")
            messages.append({
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt or "Here's an image."},
                    {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"}}
                ]
            })
        else:
            messages.append({"role": "user", "content": prompt})

        response = client.chat.completions.create(
            model="gpt-4-1106-preview",
            messages=messages,
            response_format="json_object"
        )

        reply = response.choices[0].message.content.strip()
        print("RAW GPT RESPONSE:", reply)
        parsed = json.loads(reply)

        parsed["response"] = parsed.get("response", "[Parsed tasks/goals/lessons/schedule]")
        today = datetime.utcnow().strftime('%Y-%m-%d')

        for task in parsed.get("tasks", []):
            task["completed"] = task.get("completed", False)
            task["text"] = task.get("text") or task.get("title", "")
            task["date"] = task.get("date") or today
            all_tasks = load_json(TASK_FILE, [])
            all_tasks.append(task)
            save_json(TASK_FILE, all_tasks)

        for goal in parsed.get("goals", []):
            goal["completed"] = goal.get("completed", False)
            all_goals = load_json(GOAL_FILE, [])
            all_goals.append(goal)
            save_json(GOAL_FILE, all_goals)

        for lesson in parsed.get("lessons", []):
            lesson["completed"] = lesson.get("completed", False)
            all_lessons = load_json(LESSON_FILE, [])
            all_lessons.append(lesson)
            save_json(LESSON_FILE, all_lessons)

        for sched in parsed.get("schedule", []):
            sched["date"] = sched.get("date") or today
            all_sched = load_json(SCHEDULE_FILE, [])
            all_sched.append(sched)
            save_json(SCHEDULE_FILE, all_sched)

        return jsonify(parsed)

    except Exception as e:
        return jsonify({"error": str(e)}), 500




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


if __name__ == '__main__':
    app.run(debug=True)
