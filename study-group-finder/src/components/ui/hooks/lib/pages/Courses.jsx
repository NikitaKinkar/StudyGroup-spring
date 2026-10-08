import { useState, useEffect } from "react";
import { createPageUrl } from "@/utils";
import TopBar from "../components/dashboard/TopBar";
import Sidebar from "../components/dashboard/Sidebar";

export default function Courses() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("studyconnect_user");
    if (!stored) { window.location.href = createPageUrl("Auth"); return; }
    setUser(JSON.parse(stored));
  }, []);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <TopBar user={user} />
      <div className="flex">
        <Sidebar currentPage="Courses" user={user} />
        <main className="flex-1 p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Courses</h1>
          <p className="text-sm text-gray-500">Browse and enroll in courses.</p>
          <div className="mt-8 text-gray-400 text-center">No courses available yet.</div>
        </main>
      </div>
    </div>
  );
}