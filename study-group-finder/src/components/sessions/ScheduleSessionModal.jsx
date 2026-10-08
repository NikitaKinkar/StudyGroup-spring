import { useState } from "react";
import { X, Calendar, Clock, MapPin, Users, ChevronLeft, ChevronRight } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, addYears, subYears, isSameDay } from "date-fns";

export default function ScheduleSessionModal({ onClose, onSchedule }) {
  const [form, setForm] = useState({
    group: "",
    title: "",
    description: "",
    date: new Date(),
    time: "",
    duration: 60,
    meetingType: "online",
    location: ""
  });

  const [showCalendar, setShowCalendar] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const handleSubmit = (e) => {
    e.preventDefault();
    const sessionData = {
      ...form,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    onSchedule(sessionData);
  };

  const setFormField = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
  };

  const handleDateSelect = (date) => {
    setForm({ ...form, date });
    setShowCalendar(false);
  };

  const getDaysInMonth = () => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of today for comparison
    
    return eachDayOfInterval({ start, end });
  };

  const isDateDisabled = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of today
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0); // Set to start of date
    
    return compareDate < today; // Disable dates before today
  };

  const navigateMonth = (direction) => {
    if (direction === 'prev') {
      setCurrentMonth(subMonths(currentMonth, 1));
    } else {
      setCurrentMonth(addMonths(currentMonth, 1));
    }
  };

  const navigateYear = (direction) => {
    if (direction === 'prev') {
      setCurrentMonth(subYears(currentMonth, 1));
    } else {
      setCurrentMonth(addYears(currentMonth, 1));
    }
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Schedule a Study Session</h2>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-gray-400 hover:text-gray-700" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Group
            </label>
            <select
              value={form.group}
              onChange={setFormField("group")}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
            >
              <option value="">Select a group</option>
              <option value="web-dev">Web Development Study Group</option>
              <option value="data-science">Data Science Group</option>
              <option value="ui-ux">UI/UX Design Group</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Session Title
            </label>
            <input
              type="text"
              placeholder="e.g., React Hooks Deep Dive"
              value={form.title}
              onChange={setFormField("title")}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              placeholder="What will you cover in this session?"
              value={form.description}
              onChange={setFormField("description")}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <button
                type="button"
                onClick={() => setShowCalendar(!showCalendar)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-left focus:outline-none focus:border-orange-400 flex items-center justify-between"
              >
                <span>{format(form.date, "MMM dd, yyyy")}</span>
                <Calendar className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time
              </label>
              <input
                type="time"
                value={form.time}
                onChange={setFormField("time")}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
              />
            </div>
          </div>

          {showCalendar && (
            <div className="mt-2 p-4 border border-gray-200 rounded-lg bg-white">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => navigateYear('prev')}
                    className="p-1 hover:bg-gray-100 rounded transition"
                  >
                    <ChevronLeft className="w-4 h-4 text-gray-600" />
                  </button>
                  <select
                    value={currentMonth.getFullYear()}
                    onChange={(e) => setCurrentMonth(new Date(parseInt(e.target.value), currentMonth.getMonth()))}
                    className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:border-orange-400"
                  >
                    {years.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => navigateYear('next')}
                    className="p-1 hover:bg-gray-100 rounded transition"
                  >
                    <ChevronRight className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => navigateMonth('prev')}
                    className="p-1 hover:bg-gray-100 rounded transition"
                  >
                    <ChevronLeft className="w-4 h-4 text-gray-600" />
                  </button>
                  <select
                    value={currentMonth.getMonth()}
                    onChange={(e) => setCurrentMonth(new Date(currentMonth.getFullYear(), parseInt(e.target.value)))}
                    className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:border-orange-400"
                  >
                    {months.map((month, index) => (
                      <option key={month} value={index}>{month}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => navigateMonth('next')}
                    className="p-1 hover:bg-gray-100 rounded transition"
                  >
                    <ChevronRight className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>
              
              {/* Weekday headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                  <div key={index} className="text-center text-xs font-medium text-gray-500 py-1">
                    {day}
                  </div>
                ))}
              </div>
              
              {/* Calendar days grid */}
              <div className="grid grid-cols-7 gap-1">
                {getDaysInMonth().map((date, index) => {
                  const isSelected = isSameDay(date, form.date);
                  const isToday = isSameDay(date, new Date());
                  const isDisabled = isDateDisabled(date);
                  
                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => !isDisabled && handleDateSelect(date)}
                      disabled={isDisabled}
                      className={`
                        relative p-2 text-sm rounded-lg transition-all
                        ${isSelected ? 'bg-orange-500 text-white font-semibold' : ''}
                        ${!isSelected && isToday ? 'bg-orange-100 text-orange-700 font-medium' : ''}
                        ${!isSelected && !isToday && !isDisabled ? 'hover:bg-gray-100 text-gray-700' : ''}
                        ${isDisabled ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-50' : ''}
                      `}
                    >
                      {format(date, 'd')}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration (minutes)
              </label>
              <input
                type="number"
                min="15"
                max="240"
                step="15"
                value={form.duration}
                onChange={setFormField("duration")}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Meeting Type
              </label>
              <select
                value={form.meetingType}
                onChange={setFormField("meetingType")}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
              >
                <option value="online">Online</option>
                <option value="in-person">In Person</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {form.meetingType === "online" ? "Meeting Link" : "Location"}
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder={form.meetingType === "online" ? "https://zoom.us/meeting/..." : "Room 101, Main Building"}
                value={form.location}
                onChange={setFormField("location")}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400 pl-10"
              />
              <div className="absolute left-3 top-2.5">
                {form.meetingType === "online" ? (
                  <Users className="w-4 h-4 text-gray-400" />
                ) : (
                  <MapPin className="w-4 h-4 text-gray-400" />
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-700 font-medium py-2.5 rounded-lg hover:bg-gray-50 transition text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 rounded-lg transition text-sm"
            >
              Schedule Session
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
