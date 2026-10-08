import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import TopBar from "../components/dashboard/TopBar";
import Sidebar from "../components/dashboard/Sidebar";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [groups, setGroups] = useState([]);
  const [peers, setPeers] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem("studyconnect_user");
    if (!stored) {
      window.location.href = createPageUrl("Auth");
      return;
    }
    const u = JSON.parse(stored);
    setUser(u);
    loadData(u);
  }, []);

  const loadData = async (u) => {
    const allGroups = await base44.entities.StudyGroup.list();
    const myGroups = allGroups.filter(g =>
      g.owner_email === u.email ||
      (g.members || []).some(m => m.email === u.email)
    );
    setGroups(myGroups.slice(0, 4));

    const allUsers = await base44.entities.UserProfile.list();
    const suggested = allUsers.filter(p => p.email !== u.email).slice(0, 4);
    setPeers(suggested);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <TopBar user={user} />
      <div className="flex">
        <Sidebar currentPage="Dashboard" user={user} />
        <main className="flex-1 p-8">
          {/* My Courses */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900">My Courses</h2>
            <p className="text-sm text-gray-500 mt-1">Continue where you left off.</p>
            <p className="text-sm text-gray-600 mt-3">
              You haven't enrolled in any courses yet.{" "}
              <a href={createPageUrl("Courses")} className="text-orange-500 underline">
                Browse courses to enroll!
              </a>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Joined Groups */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Joined Groups</h3>
              <div className="space-y-3">
                {groups.length === 0 && (
                  <p className="text-sm text-gray-400">No groups joined yet.</p>
                )}
                {groups.map((g) => (
                  <div key={g.id} className="flex items-center justify-between bg-white rounded-xl shadow-sm px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 font-bold">
                        {g.name[0]}
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-gray-800">{g.name}</p>
                        <p className="text-xs text-gray-400">{(g.members || []).length} Active Members</p>
                      </div>
                    </div>
                    <a
                      href={createPageUrl(`Groups?view=${g.id}`)}
                      className="bg-orange-500 text-white text-xs font-bold px-4 py-1.5 rounded hover:bg-orange-600 transition"
                    >
                      ENTER
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* Suggested Peers */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Suggested Peers</h3>
              <div className="space-y-3">
                {peers.length === 0 && (
                  <p className="text-sm text-gray-400">No peers found.</p>
                )}
                {peers.map((p) => (
                  <div key={p.id} className="flex items-center justify-between bg-white rounded-xl shadow-sm px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 font-bold">
                        {p.full_name?.[0] || "U"}
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-gray-800">{p.full_name}</p>
                        <p className="text-xs text-gray-400">{p.university || "University"}</p>
                      </div>
                    </div>
                    <button className="border border-orange-400 text-orange-500 text-xs font-bold px-4 py-1.5 rounded hover:bg-orange-50 transition">
                      CONNECT
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}