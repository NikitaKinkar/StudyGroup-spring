import { useState, useEffect } from "react";
import { createPageUrl } from "@/utils/index.js";
import TopBar from "../components/dashboard/TopBar";
import Sidebar from "../components/dashboard/Sidebar";
import NotificationBar from "../components/notifications/NotificationBar";
import ScheduleSessionModal from "../components/sessions/ScheduleSessionModal";
import { Calendar as CalendarIcon, Plus, Clock, Users, MapPin, ChevronLeft, ChevronRight, Trash2, Video, Sparkles, ArrowRight, BookOpen } from "lucide-react";
import { format, isSameDay, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths } from "date-fns";
import { sessionsApi } from "@/services/api";

export default function Sessions() {
  const [user, setUser] = useState(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    const stored = localStorage.getItem("studyconnect_user");
    if (!stored) { 
      window.location.href = createPageUrl("Auth"); 
      return; 
    }
    const userData = JSON.parse(stored);
    setUser(userData);
    
    // Load sessions from backend with local fallback
    const fetchSessions = async () => {
      try {
        const backendSessions = await sessionsApi.getUpcoming();
        if (Array.isArray(backendSessions) && backendSessions.length > 0) {
          const formatted = backendSessions.map(s => ({
            ...s,
            id: s.id?.toString(),
            date: s.sessionDate ? s.sessionDate.split('T')[0] : s.date,
            time: s.sessionTime || s.time,
            title: s.title,
            description: s.description,
            duration: s.duration,
            meetingType: (s.meetingType || 'ONLINE').toLowerCase(),
            location: s.location || '',
            createdBy: s.creatorEmail || s.createdBy || "User"
          }));
          setSessions(formatted);
          localStorage.setItem("study_sessions", JSON.stringify(formatted));
          return;
        }
      } catch (err) {
        console.warn("Could not fetch sessions from backend:", err.message);
      }

      const storedSessions = localStorage.getItem("study_sessions");
      if (storedSessions) {
        setSessions(JSON.parse(storedSessions));
      }
    };

    fetchSessions();
  }, []);

  const handleScheduleSession = async (sessionData) => {
    const newSession = {
      ...sessionData,
      id: Date.now().toString(),
      createdBy: user?.name || user?.email || "User",
      createdAt: new Date().toISOString()
    };
    
    const updatedSessions = [...sessions, newSession];
    setSessions(updatedSessions);
    localStorage.setItem("study_sessions", JSON.stringify(updatedSessions));
    setShowScheduleModal(false);
  };

  const getSessionsForDate = (date) => {
    return sessions.filter(session => 
      isSameDay(parseISO(session.date), date)
    );
  };

  // Dynamic session status calculation - Date-based logic
  const getSessionStatus = (session) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of today
    
    const sessionDate = new Date(session.date);
    sessionDate.setHours(0, 0, 0, 0); // Set to start of session date
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1); // Next day at 12:00 AM

    if (today.getTime() < sessionDate.getTime()) {
      return 'UPCOMING'; // Future date
    } else if (today.getTime() === sessionDate.getTime()) {
      return 'ACTIVE'; // Same date (can join all day)
    } else if (today.getTime() < tomorrow.getTime() && sessionDate.getTime() < today.getTime()) {
      return 'ACTIVE'; // Session date is before today but still same day
    } else {
      return 'COMPLETED'; // Past date (after 12:00 AM of next day)
    }
  };

  const getSessionEndTime = (session) => {
    const sessionDate = new Date(session.date);
    // Return end of session date (23:59:59)
    sessionDate.setHours(23, 59, 59, 999);
    return sessionDate;
  };

  const canJoinSession = (session) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of today
    
    const sessionDate = new Date(session.date);
    sessionDate.setHours(0, 0, 0, 0); // Set to start of session date
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1); // Next day at 12:00 AM

    // Can join if today is same as session date or before session date
    // Cannot join after session date ends (after 12:00 AM next day)
    return today.getTime() <= sessionDate.getTime() || (today.getTime() < tomorrow.getTime() && sessionDate.getTime() < today.getTime());
  };

  const showJoinButton = (session) => {
    // Always show join button for all sessions
    return true;
  };

  const getFormattedStatus = (status) => {
    switch (status) {
      case 'UPCOMING':
        return 'Upcoming';
      case 'ACTIVE':
        return 'Active';
      case 'COMPLETED':
        return 'Completed';
      default:
        return 'Unknown';
    }
  };

  const handleJoinSession = async (sessionId) => {
    try {
      const response = await fetch(`/api/sessions/${sessionId}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Email': user.email
        }
      });

      if (response.ok) {
        const data = await response.json();
        alert(data.message);
        
        // If online session, open meeting link
        if (data.meetingLink) {
          window.open(data.meetingLink, '_blank');
        }
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to join session');
      }
    } catch (error) {
      console.error('Error joining session:', error);
      alert('Failed to join session');
    }
  };

  const getUpcomingSessions = () => {
    return sessions
      .filter(session => new Date(session.date).getTime() >= new Date().getTime())
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 10);
  };

  const formatSessionTime = (time) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getDaysInMonth = () => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  };

  const navigateMonth = (direction) => {
    if (direction === 'prev') {
      setCurrentMonth(subMonths(currentMonth, 1));
    } else {
      setCurrentMonth(addMonths(currentMonth, 1));
    }
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
  };

  const handleViewSession = (session) => {
    // You can implement view functionality here
    // For now, let's show session details in an alert
    alert(`Session Details:\n\nTitle: ${session.title}\nDate: ${format(parseISO(session.date), "MMMM d, yyyy")}\nTime: ${formatSessionTime(session.time)}\nDuration: ${session.duration} minutes\nMeeting Type: ${session.meetingType}\nLocation: ${session.location || 'Online'}\nDescription: ${session.description || 'No description'}\nCreated by: ${session.createdBy}`);
  };

  const handleDeleteSession = (sessionId) => {
    const sessionToDelete = sessions.find(session => session.id === sessionId);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const sessionDate = new Date(sessionToDelete.date);
    sessionDate.setHours(0, 0, 0, 0);
    
    const isTodaySession = today.getTime() === sessionDate.getTime();
    const confirmMessage = isTodaySession 
      ? `Are you sure you want to delete today's session "${sessionToDelete.title}"? This action cannot be undone.`
      : `Are you sure you want to delete the session "${sessionToDelete.title}"? This action cannot be undone.`;
    
    if (window.confirm(confirmMessage)) {
      const updatedSessions = sessions.filter(session => session.id !== sessionId);
      setSessions(updatedSessions);
      localStorage.setItem("study_sessions", JSON.stringify(updatedSessions));
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50/50 font-sans">
      <TopBar user={user} extraContent={<NotificationBar user={user} />} />
      <div className="flex">
        <Sidebar currentPage="Sessions" user={user} />
        <main className="flex-1 p-6 lg:p-8 max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="p-1.5 rounded-lg bg-orange-100 text-orange-600">
                  <CalendarIcon className="w-5 h-5" />
                </span>
                <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-900">Study Sessions</h1>
              </div>
              <p className="text-sm text-slate-500">Plan, schedule, and join interactive group sessions with your peers.</p>
            </div>
            <button
              onClick={() => setShowScheduleModal(true)}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold text-sm rounded-xl shadow-md shadow-orange-500/20 hover:shadow-lg hover:shadow-orange-500/30 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Schedule Session
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Calendar Widget */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 sticky top-24">
                <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
                  <div>
                    <span className="text-xs font-semibold text-orange-500 uppercase tracking-wider block">Calendar</span>
                    <h3 className="text-lg font-bold text-slate-900">
                      {format(currentMonth, "MMMM yyyy")}
                    </h3>
                  </div>
                  <div className="flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl">
                    <button
                      onClick={() => navigateMonth('prev')}
                      className="p-1.5 hover:bg-white text-slate-600 hover:text-slate-900 rounded-lg transition-all shadow-none hover:shadow-sm"
                      title="Previous Month"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => navigateMonth('next')}
                      className="p-1.5 hover:bg-white text-slate-600 hover:text-slate-900 rounded-lg transition-all shadow-none hover:shadow-sm"
                      title="Next Month"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                {/* Weekday headers */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day, index) => (
                    <div key={index} className="text-center text-[11px] font-bold text-slate-400 py-1 uppercase tracking-wider">
                      {day}
                    </div>
                  ))}
                </div>
                
                {/* Calendar days grid */}
                <div className="grid grid-cols-7 gap-1">
                  {getDaysInMonth().map((date, index) => {
                    const hasSessions = getSessionsForDate(date).length > 0;
                    const isSelected = isSameDay(date, selectedDate);
                    const isToday = isSameDay(date, new Date());
                    
                    return (
                      <button
                        key={index}
                        onClick={() => handleDateSelect(date)}
                        className={`
                          relative h-10 flex flex-col items-center justify-center text-xs rounded-xl font-medium transition-all
                          ${isSelected 
                            ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold shadow-md shadow-orange-500/25 scale-105 z-10' 
                            : isToday 
                            ? 'bg-orange-50 text-orange-700 font-bold ring-1 ring-orange-400/50 hover:bg-orange-100/60' 
                            : 'text-slate-700 hover:bg-slate-100/80'
                          }
                          ${hasSessions && !isSelected ? 'font-semibold text-slate-900' : ''}
                        `}
                      >
                        <span>{format(date, 'd')}</span>
                        {hasSessions && (
                          <div className={`
                            w-1 h-1 rounded-full mt-0.5
                            ${isSelected ? 'bg-white' : 'bg-orange-500'}
                          `} />
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                    <span>Session planned</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full ring-1 ring-orange-400 bg-orange-50"></span>
                    <span>Today</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sessions List */}
            <div className="lg:col-span-2 space-y-6">
              {/* Selected Date Session Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6">
                <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
                  <div>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Selected Day</span>
                    <h3 className="text-lg font-bold text-slate-900">
                      {format(selectedDate, "EEEE, MMMM d, yyyy")}
                    </h3>
                  </div>
                  <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-full">
                    {getSessionsForDate(selectedDate).length} {getSessionsForDate(selectedDate).length === 1 ? 'Session' : 'Sessions'}
                  </span>
                </div>
                
                {getSessionsForDate(selectedDate).length > 0 ? (
                  <div className="space-y-4">
                    {getSessionsForDate(selectedDate).map((session) => {
                      const status = getSessionStatus(session);
                      const canJoin = canJoinSession(session);
                      const showButton = showJoinButton(session);
                      
                      return (
                        <div 
                          key={session.id} 
                          className="border border-slate-200/90 rounded-2xl p-5 hover:border-orange-300 hover:shadow-md transition-all duration-200 bg-white group"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 flex-wrap mb-1.5">
                                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200/60">
                                  {session.group}
                                </span>
                                {status === 'ACTIVE' && (
                                  <span className="inline-flex items-center gap-1.5 text-xs bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-2.5 py-0.5 rounded-full font-bold">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                    Live Now
                                  </span>
                                )}
                                {status === 'UPCOMING' && (
                                  <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200/60 px-2.5 py-0.5 rounded-full font-medium">
                                    Upcoming
                                  </span>
                                )}
                                {status === 'COMPLETED' && (
                                  <span className="text-xs bg-slate-100 text-slate-500 border border-slate-200 px-2.5 py-0.5 rounded-full font-medium">
                                    Completed
                                  </span>
                                )}
                              </div>
                              <h4 className="text-base font-bold text-slate-900 group-hover:text-orange-600 transition-colors">
                                {session.title}
                              </h4>
                            </div>
                          </div>
                          
                          {session.description && (
                            <p className="text-sm text-slate-600 mb-4 leading-relaxed">{session.description}</p>
                          )}
                          
                          <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500 bg-slate-50/80 p-3 rounded-xl mb-4">
                            <div className="flex items-center gap-1.5 text-slate-700">
                              <Clock className="w-4 h-4 text-orange-500" />
                              <span>{formatSessionTime(session.time)} ({session.duration} min)</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-slate-700">
                              {session.meetingType === "online" ? (
                                <>
                                  <Video className="w-4 h-4 text-blue-500" />
                                  <span>Online Meeting</span>
                                </>
                              ) : (
                                <>
                                  <MapPin className="w-4 h-4 text-amber-500" />
                                  <span className="truncate max-w-[200px]">{session.location || "Campus"}</span>
                                </>
                              )}
                            </div>
                            <div className="flex items-center gap-1 text-slate-400 ml-auto">
                              <span>By: {session.createdBy}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                            <button 
                              onClick={() => handleViewSession(session)}
                              className="text-xs text-slate-600 hover:text-slate-900 font-semibold px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition"
                            >
                              View Details
                            </button>
                            
                            <div className="flex items-center gap-2">
                              {showButton && (
                                canJoin ? (
                                  <button 
                                    onClick={() => handleJoinSession(session.id)}
                                    className="inline-flex items-center gap-1.5 text-xs bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-4 py-2 rounded-xl font-bold shadow-sm shadow-orange-500/20 hover:shadow-md transition cursor-pointer"
                                  >
                                    <span>Join Session</span>
                                    <ArrowRight className="w-3.5 h-3.5" />
                                  </button>
                                ) : (
                                  <button 
                                    onClick={() => {
                                      alert('This session has ended. You cannot join a completed session.');
                                    }}
                                    className="text-xs text-slate-400 px-3 py-1.5 rounded-xl bg-slate-100 font-medium cursor-not-allowed"
                                  >
                                    Session Completed
                                  </button>
                                )
                              )}
                              
                              {session.createdBy === user?.name && (
                                <button
                                  onClick={() => handleDeleteSession(session.id)}
                                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                  title="Delete Session"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12 px-4">
                    <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-500 mx-auto mb-3 shadow-sm border border-orange-100">
                      <CalendarIcon className="w-7 h-7" />
                    </div>
                    <h4 className="text-base font-bold text-slate-800">No sessions on this date</h4>
                    <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
                      There are no study sessions scheduled for {format(selectedDate, "MMMM d")}. Why not start one?
                    </p>
                    <button
                      onClick={() => setShowScheduleModal(true)}
                      className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-50 text-orange-600 hover:bg-orange-100 font-semibold text-xs transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Schedule a session now
                    </button>
                  </div>
                )}
              </div>

              {/* Upcoming Sessions List */}
              {getUpcomingSessions().length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-orange-500" />
                      <h3 className="text-base font-bold text-slate-900">Next Upcoming Sessions</h3>
                    </div>
                    <span className="text-xs text-slate-400 font-medium">Auto-sorted by date</span>
                  </div>
                  <div className="space-y-3">
                    {getUpcomingSessions().map((session) => (
                      <div 
                        key={session.id} 
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 border border-slate-100 rounded-xl hover:bg-slate-50/80 hover:border-slate-200 transition-all gap-3"
                      >
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-slate-900 text-sm truncate">{session.title}</h4>
                          <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-500 mt-1">
                            <span className="font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                              {format(parseISO(session.date), "MMM d")}
                            </span>
                            <span>{formatSessionTime(session.time)}</span>
                            <span className="bg-orange-50 text-orange-700 font-medium px-2 py-0.5 rounded-full border border-orange-200/50">
                              {session.group}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 self-end sm:self-auto">
                          <button 
                            onClick={() => handleViewSession(session)}
                            className="text-xs text-slate-600 hover:text-slate-900 font-medium px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-white transition"
                          >
                            View
                          </button>
                          {(session.createdBy === user?.name || session.createdBy === user?.email || session.createdBy === "User" || session.createdBy === "Anonymous") && (
                            <button
                              onClick={() => handleDeleteSession(session.id)}
                              className="text-xs text-red-500 hover:text-red-700 p-1.5 hover:bg-red-50 rounded-lg transition"
                              title="Delete Session"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {showScheduleModal && (
        <ScheduleSessionModal
          onClose={() => setShowScheduleModal(false)}
          onSchedule={handleScheduleSession}
        />
      )}
    </div>
    );
}