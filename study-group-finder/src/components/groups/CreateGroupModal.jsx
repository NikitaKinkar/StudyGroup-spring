import { useState } from "react";
import { X } from "lucide-react";

const COURSES = ["Web Development", "UI/UX", "Data Science", "CSE(AIML)", "CSE(Cyber)", "CSE(DS)", "EEE", "EIE", "IT", "MBA", "BBA", "Civil", "Other"];

export default function CreateGroupModal({ onClose, onCreate }) {
  const [form, setForm] = useState({
    name: "", course: "Web Development", description: "", max_members: 100, visibility: "Public"
  });
  const [showCustomCourse, setShowCustomCourse] = useState(false);
  const [customCourse, setCustomCourse] = useState("");

  const set = (k) => (e) => {
    if (k === "course" && e.target.value === "Other") {
      setShowCustomCourse(true);
    } else {
      setShowCustomCourse(false);
      setForm({ ...form, [k]: e.target.value });
    }
  };

  const handleCustomCourseSubmit = () => {
    if (!customCourse.trim()) {
      alert("Please enter a course name");
      return;
    }
    setForm({ ...form, course: customCourse });
    setShowCustomCourse(false);
  };

  const handleCustomCourseCancel = () => {
    setShowCustomCourse(false);
    setCustomCourse("");
    setForm({ ...form, course: "Web Development" });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreate({ 
      ...form, 
      max_members: String(form.max_members || "100")
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-gray-900">Create Study Group</h2>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-400 hover:text-gray-700" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            placeholder="Group Name"
            value={form.name}
            onChange={set("name")}
            required
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
          />
          {!showCustomCourse ? (
            <select value={form.course} onChange={set("course")} className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-orange-400">
              {COURSES.map(c => <option key={c}>{c}</option>)}
            </select>
          ) : (
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Enter your course name..."
                value={customCourse}
                onChange={(e) => setCustomCourse(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCustomCourseSubmit}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 rounded text-sm transition"
                >
                  ✓ Save
                </button>
                <button
                  type="button"
                  onClick={handleCustomCourseCancel}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 rounded text-sm transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
          <textarea
            placeholder="Description"
            value={form.description}
            onChange={set("description")}
            rows={3}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-orange-400 resize-none"
          />
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Max Members (1–100)</label>
            <input
              type="number"
              min={1}
              max={100}
              value={form.max_members}
              onChange={set("max_members")}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
            />
          </div>
          <select value={form.visibility} onChange={set("visibility")} className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-orange-400">
            <option>Public</option>
            <option>Private</option>
          </select>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 border border-gray-300 text-gray-700 font-medium py-2 rounded hover:bg-gray-50 transition text-sm">
              Cancel
            </button>
            <button type="submit" className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 rounded transition text-sm">
              Create Group
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}