import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { createPageUrl } from "@/utils/index.js";
import TopBar from "../components/dashboard/TopBar";
import Sidebar from "../components/dashboard/Sidebar";
import NotificationBar from "../components/notifications/NotificationBar";
import ChatNotificationBar from "../components/notifications/ChatNotificationBar";
import GroupCard from "@/components/groups/GroupCard";
import CreateGroupModal from "@/components/groups/CreateGroupModal";
import GroupDetail from "@/components/groups/GroupDetail";
import InlineChat from "@/components/groups/InlineChat";
import ChatLayout from "@/components/groups/ChatLayout";
import { Plus, Search, BookOpen, Users } from "lucide-react";
import { groupsApi } from "@/services/api";

const COURSES = ["All Courses", "CSE(AIML)", "CSE(DS)", "CSE(Cyber)", "ECE", "EEE", "Mechanical", "Civil", "IT", "MBA", "BBA"];

export default function Groups() {
  const { groupId: urlGroupId } = useParams();
  const [user, setUser] = useState(null);
  const [groups, setGroups] = useState([]);
  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("All Courses");
  const [sizeFilter, setSizeFilter] = useState("All Sizes");
  const [visibilityFilter, setVisibilityFilter] = useState("All");
  const [tab, setTab] = useState("All Groups");
  const [showCreate, setShowCreate] = useState(false);
  const [viewGroupId, setViewGroupId] = useState(null);
  const [chatGroupId, setChatGroupId] = useState(null);
  const [showCourseGroupChat, setShowCourseGroupChat] = useState(false);
  const [autoOpenChat, setAutoOpenChat] = useState(false);
  const [openCourseGroupChat, setOpenCourseGroupChat] = useState(false);

  const normalizeGroup = (g) => ({
    ...g,
    id: g.id,
    name: g.name,
    course: g.course || g.courseName,
    description: g.description,
    max_members: g.max_members || g.maxMembers,
    visibility: g.visibility,
    owner_email: g.owner_email || g.ownerEmail,
    owner_name: g.owner_name || g.ownerName,
    members: g.members || [{ name: g.ownerName || g.owner_name, email: g.ownerEmail || g.owner_email, role: "Owner" }]
  });

  const loadGroups = async () => {
    try {
      const data = await groupsApi.getAll();
      if (Array.isArray(data)) {
        const normalized = data.map(normalizeGroup);
        setGroups(normalized);
        localStorage.setItem("studyconnect_groups", JSON.stringify(normalized));
        return;
      }
    } catch (err) {
      console.warn("Could not fetch groups from backend, falling back to local:", err.message);
    }

    let allGroups = JSON.parse(localStorage.getItem("studyconnect_groups") || "[]");
    setGroups(allGroups.map(normalizeGroup));
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this group?")) return;
    try {
      await groupsApi.delete(id);
    } catch (err) {
      console.warn("Backend delete error:", err.message);
    }
    const allGroups = JSON.parse(localStorage.getItem("studyconnect_groups") || "[]");
    const filtered = allGroups.filter(g => g.id !== id);
    localStorage.setItem("studyconnect_groups", JSON.stringify(filtered));
    loadGroups();
  };

  const handleRequestJoin = async (group) => {
    if (!user) return;

    try {
      const res = await groupsApi.requestJoin(group.id);
      if (res && res.joined) {
        alert(res.message || "You have successfully joined the group! You can now participate in discussions.");
      } else {
        alert(res?.message || "Join request sent to group owner!");
      }
      await loadGroups();
      return;
    } catch (err) {
      console.warn("Backend join request error, updating locally:", err.message);
      const errMsg = err.response?.data?.error || err.response?.data?.message;
      if (errMsg) {
        alert(errMsg);
        return;
      }
    }

    // Local fallback
    const notifications = JSON.parse(localStorage.getItem("studyconnect_notifications") || "[]");
    const existingRequest = notifications.find(n => 
      n.type === 'group_join_request' &&
      n.sender_email === user.email &&
      n.group_id === group.id
    );
    
    if (existingRequest) {
      alert("Connection request already sent!");
      return;
    }

    const notification = {
      id: Date.now(),
      type: 'group_join_request',
      sender_email: user.email,
      sender_name: user.full_name,
      group_id: group.id,
      group_name: group.name,
      message: `${user.full_name} wants to join your group`,
      timestamp: new Date().toISOString(),
      read: false
    };
    
    notifications.push(notification);
    localStorage.setItem("studyconnect_notifications", JSON.stringify(notifications));
    alert("Join request sent to group owner!");
  };

  const handleCreate = async (newGroup) => {
    try {
      const created = await groupsApi.create({
        name: newGroup.name,
        course: newGroup.course,
        description: newGroup.description,
        max_members: newGroup.max_members,
        visibility: newGroup.visibility,
      });
      setShowCreate(false);
      await loadGroups();
      return;
    } catch (err) {
      console.error("Backend group create error:", err);
      const errMsg = err.response?.data?.error || err.response?.data?.message || err.message;
      alert(`Could not create group on server: ${errMsg}`);
    }

    const allGroups = JSON.parse(localStorage.getItem("studyconnect_groups") || "[]");
    allGroups.push(newGroup);
    localStorage.setItem("studyconnect_groups", JSON.stringify(allGroups));
    setShowCreate(false);
    loadGroups();
  };

  useEffect(() => {
    const stored = localStorage.getItem("studyconnect_user");
    if (!stored) { window.location.href = createPageUrl("Auth"); return; }
    setUser(JSON.parse(stored));
    
    // Check URL params for direct group view or chat
    const params = new URLSearchParams(window.location.search);
    const viewParam = params.get("view");
    const openChatParam = params.get("openChat");
    const autoOpenChatParam = params.get("autoOpenChat");
    const openCourseGroupChatParam = params.get("openCourseGroupChat");
    
    if (viewParam) setViewGroupId(viewParam);
    
    // Handle auto-open chat parameter (for course chat icon)
    if (autoOpenChatParam === "true") {
      console.log('Groups: Auto-open chat parameter detected, setting autoOpenChat');
      setAutoOpenChat(true);
    }
    
    // Handle open course group chat parameter (for new course chat icon)
    if (openCourseGroupChatParam === "true") {
      console.log('Groups: Open course group chat parameter detected, setting openCourseGroupChat');
      setOpenCourseGroupChat(true);
    }
    
    if (openChatParam === "true") {
      console.log('Groups: Direct chat parameter detected, setting up chat');
      // Load groups first, then open chat with first available group
      loadGroups();
    }
    
    loadGroups();
  }, []);

  // Open direct chat when groups are loaded
  useEffect(() => {
    console.log('Groups: Checking for auto-open chat, groups:', groups.length, 'user:', !!user, 'chatGroupId:', chatGroupId, 'autoOpenChat:', autoOpenChat, 'openCourseGroupChat:', openCourseGroupChat);
    if (groups.length > 0 && user && !chatGroupId) {
      const params = new URLSearchParams(window.location.search);
      const openDirectChatParam = params.get("openDirectChat");
      const autoOpenChatParam = params.get("autoOpenChat");
      const openCourseGroupChatParam = params.get("openCourseGroupChat");
      
      // Handle direct chat parameter
      if (openDirectChatParam === "true") {
        console.log('Groups: Opening direct chat with first group');
        setChatGroupId(groups[0].id);
        // Clear the parameter to prevent re-opening
        const newUrl = window.location.pathname;
        window.history.replaceState({}, '', newUrl);
        return;
      }
      
      // Handle auto-open chat parameter (for course chat icon)
      if (autoOpenChatParam === "true") {
        console.log('Groups: Auto-opening chat interface (second image)');
        setChatGroupId(groups[0].id);
        // Clear the parameter to prevent re-opening
        const newUrl = window.location.pathname;
        window.history.replaceState({}, '', newUrl);
        return;
      }
      
      // Handle open course group chat parameter (for new course chat icon)
      if (openCourseGroupChatParam === "true") {
        console.log('Groups: Opening course group chat interface directly');
        setChatGroupId(groups[0].id);
        // Clear the parameter to prevent re-opening
        const newUrl = window.location.pathname;
        window.history.replaceState({}, '', newUrl);
        return;
      }
    }
  }, [groups, user, chatGroupId, autoOpenChat, openCourseGroupChat]);

  const userEmail = user?.email?.toLowerCase();
  const myGroups = groups.filter(g => {
    const owner = (g.owner_email || g.ownerEmail || '').toLowerCase();
    const isOwner = userEmail && owner === userEmail;
    const isMember = (g.members || []).some(m => (m.email || m.userEmail || '').toLowerCase() === userEmail);
    return isOwner || isMember;
  });

  const filtered = (tab === "My Groups" ? myGroups : groups).filter(g => {
    const matchSearch = g.name.toLowerCase().includes(search.toLowerCase());
    const matchCourse = courseFilter === "All Courses" || g.course === courseFilter;
    const matchVis = visibilityFilter === "All" || g.visibility === visibilityFilter;
    const size = (g.members || []).length;
    const matchSize = sizeFilter === "All Sizes" || 
      (sizeFilter === "Small (<10)" && size < 10) ||
      (sizeFilter === "Medium (10-20)" && size >= 10 && size <= 20) ||
      (sizeFilter === "Large (>20)" && size > 20);
    return matchSearch && matchCourse && matchVis && matchSize;
  });

  // Handle individual group view
  if (viewGroupId) {
    const group = groups.find(g => String(g.id) === String(viewGroupId));
    if (group) return (
      <div className="min-h-screen bg-gray-50 font-sans">
        <TopBar user={user} extraContent={<ChatNotificationBar user={user} />} />
        <InlineChat 
          group={group} 
          user={user} 
          onClose={() => setViewGroupId(null)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <TopBar user={user} extraContent={<NotificationBar user={user} />} />
      
      {/* Show course group chat interface directly when openCourseGroupChat is true */}
      {openCourseGroupChat ? (
        <div className="min-h-screen bg-gray-50 font-sans">
          <TopBar user={user} extraContent={<ChatNotificationBar user={user} />} />
          <ChatLayout 
            user={user} 
            groupId={chatGroupId}
            onClose={() => {
              setOpenCourseGroupChat(false);
              const newUrl = window.location.pathname;
              window.history.replaceState({}, '', newUrl);
            }}
          />
        </div>
      ) : autoOpenChat && chatGroupId ? (
        /* Show chat interface directly when auto-opening */
        <div className="min-h-screen bg-gray-50 font-sans">
          <TopBar user={user} extraContent={<ChatNotificationBar user={user} />} />
          <InlineChat 
            group={groups.find(g => g.id === chatGroupId)} 
            user={user} 
            onClose={() => setChatGroupId(null)}
          />
        </div>
      ) : (
        /* Show normal Groups page content */
        <div className="flex">
          <Sidebar currentPage="Groups" user={user} />
          <main className="flex-1 p-6 lg:p-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Study Groups <span className="text-orange-500">•</span> Hub
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Connect with classmates taking your exact courses, join real-time study rooms, and share materials.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={() => setChatGroupId("all")}
                  className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold px-4 py-2.5 rounded-xl shadow-2xs text-xs tracking-wide transition-all"
                >
                  <Users className="w-4 h-4 text-orange-500" />
                  <span>Group Chat</span>
                </button>
                <button
                  onClick={() => setShowCreate(true)}
                  className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold px-4.5 py-2.5 rounded-xl shadow-md shadow-orange-500/20 text-xs tracking-wide transition-all hover:scale-105"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Group</span>
                </button>
              </div>
            </div>

            {/* Modern Search & Filters Bar */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-3.5 mb-6 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2.5 bg-slate-50 hover:bg-slate-100/70 focus-within:bg-white border border-slate-200/80 focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-500/20 rounded-xl px-3.5 py-2 flex-1 min-w-[200px] transition-all">
                <Search className="w-4 h-4 text-slate-400" />
                <input
                  placeholder="Search by group name or keyword..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="text-xs sm:text-sm bg-transparent outline-none flex-1 text-slate-800 placeholder:text-slate-400"
                />
              </div>

              <select
                value={courseFilter}
                onChange={e => setCourseFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200/80 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-700 outline-none hover:bg-slate-100/80 cursor-pointer"
              >
                {COURSES.map(c => <option key={c}>{c}</option>)}
              </select>

              <select
                value={sizeFilter}
                onChange={e => setSizeFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200/80 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-700 outline-none hover:bg-slate-100/80 cursor-pointer"
              >
                {["All Sizes", "Small (<10)", "Medium (10-20)", "Large (>20)"].map(s => <option key={s}>{s}</option>)}
              </select>

              <select
                value={visibilityFilter}
                onChange={e => setVisibilityFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200/80 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-700 outline-none hover:bg-slate-100/80 cursor-pointer"
              >
                {["All", "Public", "Private"].map(v => <option key={v}>{v}</option>)}
              </select>
            </div>

            {/* Category Tabs */}
            <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
              {["All Groups", `My Groups (${myGroups.length})`, "Discover"].map(t => {
                const isActive = (t === "All Groups" && tab === "All Groups") ||
                  (t.startsWith("My") && tab === "My Groups") ||
                  (t === "Discover" && tab === "Discover");

                return (
                  <button
                    key={t}
                    onClick={() => setTab(t.startsWith("My") ? "My Groups" : t)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 shrink-0 ${
                      isActive
                        ? "bg-slate-900 text-white shadow-xs"
                        : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 border border-slate-200/70"
                    }`}
                  >
                    {t}
                  </button>
                );
              })}
            </div>

            {/* Group Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map(g => (
                <GroupCard
                  key={g.id}
                  group={g}
                  user={user}
                  onDelete={() => handleDelete(g.id)}
                  onView={() => setViewGroupId(g.id)}
                  onRequestJoin={handleRequestJoin}
                  onChatClick={() => setChatGroupId(g.id)}
                />
              ))}
            </div>

            {filtered.length === 0 && (
              <div className="text-center py-16 px-4 bg-white rounded-3xl border border-dashed border-slate-200 mt-4">
                <div className="w-16 h-16 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center mx-auto mb-3">
                  <Users className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-slate-800">No study groups matched your filter</h3>
                <p className="text-xs text-slate-400 mt-1 mb-4">Try clearing your filters or create a brand new study group!</p>
                <button
                  onClick={() => setShowCreate(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-xl transition"
                >
                  <Plus className="w-4 h-4" /> Create Study Group
                </button>
              </div>
            )}
          </main>
        </div>
      )}
      
      {showCreate && (
        <CreateGroupModal onClose={() => setShowCreate(false)} onCreate={handleCreate} />
      )}
      
      {showCourseGroupChat && (
        <div className="fixed inset-0 bg-white z-50 flex flex-col h-screen">
          <ChatLayout 
            user={user} 
            groupId={chatGroupId}
            onClose={() => setShowCourseGroupChat(false)} 
          />
        </div>
      )}
      
      {chatGroupId && !autoOpenChat && !openCourseGroupChat && (
        <div className="fixed inset-0 bg-white z-50 flex flex-col h-screen">
          <ChatLayout 
            user={user} 
            onClose={() => setChatGroupId(null)} 
            groupId={chatGroupId}
          />
        </div>
      )}
      
      <ChatNotificationBar user={user} />
    </div>
  );
}
