import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils/index.js";
import TopBar from "../components/dashboard/TopBar";
import Sidebar from "../components/dashboard/Sidebar";
import NotificationBar from "../components/notifications/NotificationBar";
import ChatNotificationBar from "../components/notifications/ChatNotificationBar";
import { Users, BookOpen } from "lucide-react";
import { groupsApi } from "@/services/api";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem("studyconnect_user") || "null");
    } catch (e) {
      return null;
    }
  });
  const [groups, setGroups] = useState([]);
  const [peers, setPeers] = useState([]);
  const [connectedPeers, setConnectedPeers] = useState([]);

  const handleCourseChatNavigation = () => {
    navigate('/chat');
  };

  const handleConnectPeer = (peer) => {
    // Check if already connected or pending
    const connections = JSON.parse(localStorage.getItem("studyconnect_connections") || "[]");
    const existingConnection = connections.find(
      c => (c.user_email === user.email && c.peer_email === peer.email) ||
           (c.peer_email === user.email && c.user_email === peer.email)
    );

    if (existingConnection) {
      if (existingConnection.status === 'pending') {
        alert('Connection request already sent!');
      } else {
        alert('Already connected to this peer!');
      }
      return;
    }

    // Create connection request
    const connection = {
      id: Date.now().toString(),
      user_email: user.email,
      peer_email: peer.email,
      status: 'pending',
      created_at: new Date().toISOString()
    };

    // Save connection
    const allConnections = [...connections, connection];
    localStorage.setItem("studyconnect_connections", JSON.stringify(allConnections));
    setConnectedPeers([...connectedPeers, { ...peer, status: 'pending' }]);

    alert('Connection request sent successfully!');
  };

  const handleDisconnectPeer = (peerEmail) => {
    const connections = JSON.parse(localStorage.getItem("studyconnect_connections") || "[]");
    const filteredConnections = connections.filter(
      c => !(c.user_email === user.email && c.peer_email === peerEmail) &&
           !(c.peer_email === user.email && c.user_email === peerEmail)
    );
    
    localStorage.setItem("studyconnect_connections", JSON.stringify(filteredConnections));
    
    // Update local state
    setConnectedPeers(connectedPeers.filter(p => p.email !== peerEmail));
  };

  useEffect(() => {
    // Load user data
    let userData = null;
    try {
      userData = JSON.parse(sessionStorage.getItem("studyconnect_user"));
    } catch (e) {}

    if (!userData || (!userData.email && !userData.id)) {
      navigate('/Auth', { replace: true });
      return;
    }
    if (!sessionStorage.getItem("studyconnect_token")) {
      sessionStorage.setItem("studyconnect_token", "session_token_" + Date.now());
    }
    setUser(userData);

    // Load groups from backend with fallback
    const fetchGroups = async () => {
      const userEmail = (userData?.email || '').toLowerCase();
      try {
        const data = await groupsApi.getAll();
        if (Array.isArray(data)) {
          const userGroups = data.filter(g => 
            (g.ownerEmail || g.owner_email || '').toLowerCase() === userEmail || 
            (g.members || []).some(m => (m.email || m.userEmail || '').toLowerCase() === userEmail)
          );
          setGroups(userGroups);
          return;
        }
      } catch (err) {
        console.warn("Could not fetch groups from backend in dashboard:", err.message);
      }

      const allGroups = JSON.parse(localStorage.getItem("studyconnect_groups") || "[]");
      const userGroups = allGroups.filter(g => 
        (g.owner_email || g.ownerEmail || '').toLowerCase() === userEmail || 
        (g.members || []).some(m => (m.email || m.userEmail || '').toLowerCase() === userEmail)
      );
      setGroups(userGroups);
    };

    fetchGroups();

    // Load peers
    const allPeers = JSON.parse(localStorage.getItem("studyconnect_users") || "[]");
    const otherPeers = allPeers.filter(p => p.email !== userData?.email);
    setPeers(otherPeers);

    // Load connections
    const connections = JSON.parse(localStorage.getItem("studyconnect_connections") || "[]");
    const userConnections = connections.filter(
      c => c.user_email === userData?.email || c.peer_email === userData?.email
    );
    
    const connected = userConnections.map(c => {
      const isUser = c.user_email === userData?.email;
      return {
        id: c.id,
        email: isUser ? c.peer_email : c.user_email,
        peer_name: isUser ? c.peer_name : c.user_name,
        peer_university: isUser ? c.peer_university : c.user_university,
        status: c.status
      };
    });
    setConnectedPeers(connected);
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/70 font-sans">
      <TopBar user={user} extraContent={<NotificationBar user={user} />} />
      <div className="flex">
        <Sidebar currentPage="Dashboard" user={user} />
        
        <main className="flex-1 p-6 lg:p-8 max-w-7xl mx-auto">
          {/* Hero Welcome Banner */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 p-7 lg:p-9 text-white shadow-lg shadow-orange-500/15 mb-8">
            <div className="absolute -right-12 -top-12 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
            <div className="absolute right-20 -bottom-16 w-48 h-48 bg-amber-300/20 rounded-full blur-xl pointer-events-none"></div>

            <div className="relative z-10 max-w-2xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-md text-white mb-3">
                ✨ Welcome to StudyConnect
              </span>
              <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-white mb-2 leading-tight">
                Hey {user?.full_name?.split(" ")[0] || "Scholar"}! Ready to crush your study goals?
              </h1>
              <p className="text-orange-100 text-sm leading-relaxed mb-6">
                Collaborate with course peers, join real-time study rooms, share lecture files, and stay ahead in your curriculum.
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <a
                  href={createPageUrl("Groups")}
                  className="inline-flex items-center gap-2 bg-white text-orange-600 hover:bg-orange-50 px-5 py-2.5 rounded-xl font-bold text-xs tracking-wide shadow-md transition-all duration-200 hover:scale-105"
                >
                  <Users className="w-4 h-4" />
                  Explore Study Groups
                </a>
                <a
                  href={createPageUrl("Courses")}
                  className="inline-flex items-center gap-2 bg-orange-700/50 hover:bg-orange-700/70 backdrop-blur-sm border border-white/20 text-white px-5 py-2.5 rounded-xl font-bold text-xs tracking-wide transition-all duration-200 hover:scale-105"
                >
                  Browse Courses
                </a>
                <a
                  href="/chat"
                  className="inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 border border-white/20 text-white px-5 py-2.5 rounded-xl font-bold text-xs tracking-wide transition-all duration-200"
                >
                  Open Live Chat
                </a>
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-400">My Study Groups</p>
                <h3 className="text-2xl font-black text-slate-800 mt-0.5">{groups.length}</h3>
                <span className="text-[11px] font-semibold text-emerald-600">Active rooms</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold">
                <Users className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-400">Study Buddies</p>
                <h3 className="text-2xl font-black text-slate-800 mt-0.5">{connectedPeers.length}</h3>
                <span className="text-[11px] font-semibold text-emerald-600">Peers connected</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <Users className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-400">File Sharing</p>
                <h3 className="text-2xl font-black text-slate-800 mt-0.5">Enabled</h3>
                <span className="text-[11px] font-semibold text-orange-600">Server verified</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <span className="text-xl">📁</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-400">Study Status</p>
                <h3 className="text-2xl font-black text-slate-800 mt-0.5">Online</h3>
                <span className="text-[11px] font-semibold text-emerald-600">Ready to chat</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <span className="text-xl">⚡</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Joined Groups Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
                      <Users className="w-4 h-4" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900">My Study Groups</h3>
                  </div>
                  <a href={createPageUrl("Groups")} className="text-xs font-bold text-orange-600 hover:text-orange-700">
                    View All →
                  </a>
                </div>

                <div className="space-y-3">
                  {groups.length === 0 ? (
                    <div className="text-center py-10 px-4 bg-slate-50/70 rounded-xl border border-dashed border-slate-200">
                      <p className="text-sm font-semibold text-slate-600">No study groups joined yet</p>
                      <p className="text-xs text-slate-400 mt-1 mb-3">Join public groups to chat and share notes with peers.</p>
                      <a href={createPageUrl("Groups")} className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-xl transition">
                        Find Groups to Join
                      </a>
                    </div>
                  ) : (
                    groups.slice(0, 4).map((g) => (
                      <div key={g.id} className="flex items-center justify-between p-3.5 bg-slate-50/70 hover:bg-slate-100/70 border border-slate-100 rounded-xl transition-all">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white font-bold shadow-xs">
                            {(g?.name && g.name.length > 0) ? g.name[0] : 'G'}
                          </div>
                          <div>
                            <p className="font-bold text-sm text-slate-800 leading-snug">{g?.name || 'Study Group'}</p>
                            <p className="text-xs text-slate-400">
                              {g.course || g.courseName || 'General'} • {(g.members || []).length} members
                            </p>
                          </div>
                        </div>

                        <a
                          href={`/chat/${g.id}`}
                          className="flex items-center gap-1 text-xs font-bold text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded-lg transition"
                        >
                          💬 Chat
                        </a>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Connected Peers Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
                      <Users className="w-4 h-4" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900">Connected Study Buddies</h3>
                  </div>
                  <span className="text-xs font-semibold text-slate-400">
                    {connectedPeers.length} Peers
                  </span>
                </div>

                <div className="space-y-3">
                  {connectedPeers.length === 0 ? (
                    <div className="text-center py-10 px-4 bg-slate-50/70 rounded-xl border border-dashed border-slate-200">
                      <p className="text-sm font-semibold text-slate-600">No peers connected yet</p>
                      <p className="text-xs text-slate-400 mt-1 mb-3">Connect with classmates to share resources and tips.</p>
                      <a href={createPageUrl("Courses")} className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 px-4 py-2 rounded-xl transition">
                        Find Classmates
                      </a>
                    </div>
                  ) : (
                    connectedPeers.map((p) => (
                      <div key={p.id} className="flex items-center justify-between p-3.5 bg-slate-50/70 hover:bg-slate-100/70 border border-slate-100 rounded-xl transition-all">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shadow-xs ${
                            p.status === 'accepted' ? 'bg-gradient-to-tr from-emerald-500 to-teal-500' : 'bg-gradient-to-tr from-amber-500 to-orange-400'
                          }`}>
                            {p.peer_name?.[0] || "U"}
                          </div>
                          <div>
                            <p className="font-bold text-sm text-slate-800 leading-snug">{p.peer_name}</p>
                            <p className="text-xs text-slate-400">{p.peer_university || "University"}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            p.status === 'accepted' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                          }`}>
                            {p.status === 'pending' ? 'Pending' : 'Connected'}
                          </span>
                          <button 
                            onClick={() => handleDisconnectPeer(p.email)}
                            className="text-xs font-semibold text-slate-400 hover:text-red-500 p-1 rounded transition"
                            title="Disconnect"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
      <ChatNotificationBar user={user} />
      
      {/* Floating Course Chat Button */}
      <button
        onClick={handleCourseChatNavigation}
        className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-white rounded-full p-4 shadow-xl shadow-orange-500/25 transition-all duration-300 hover:scale-110 hover:shadow-2xl group flex items-center gap-2 cursor-pointer"
        title="Open Course Chat"
      >
        <BookOpen className="w-5 h-5 transition-transform duration-300 group-hover:rotate-12" />
        <span className="text-xs font-bold pr-1">Course Chat</span>
      </button>
    </div>
  );
}
