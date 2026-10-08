import { useState, useEffect } from "react";
import { createPageUrl } from "@/utils/index.js";
import TopBar from "../components/dashboard/TopBar";
import Sidebar from "../components/dashboard/Sidebar";
import NotificationBar from "../components/notifications/NotificationBar";

export default function Chat() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("studyconnect_user");
    if (!stored) { window.location.href = createPageUrl("Auth"); return; }
    setUser(JSON.parse(stored));
  }, []);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <TopBar user={user} extraContent={<NotificationBar user={user} />} />
      <div className="flex">
        <Sidebar currentPage="Chat" user={user} />
        <main className="flex-1 p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Chat</h1>
          <p className="text-sm text-gray-500">Direct messages with peers.</p>
          <div className="mt-8 text-gray-400 text-center">No messages yet. Connect with peers to start chatting.</div>
        </main>
      </div>
    </div>
  );
}