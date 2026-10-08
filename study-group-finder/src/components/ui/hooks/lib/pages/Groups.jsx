import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import TopBar from "../components/dashboard/TopBar";
import Sidebar from "../components/dashboard/Sidebar";
import GroupCard from "@/components/groups/GroupCard";
import CreateGroupModal from "@/components/groups/CreateGroupModal";
import GroupDetail from "@/components/groups/GroupDetail";
import { Plus, Search } from "lucide-react";

const COURSES = ["All Courses", "CSE(AIML)", "CSE(DS)", "CSE(Cyber)", "ECE", "EEE", "Mechanical", "Civil", "IT", "MBA", "BBA"];

export default function Groups() {
  const [user, setUser] = useState(null);
  const [groups, setGroups] = useState([]);
  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("All Courses");
  const [sizeFilter, setSizeFilter] = useState("All Sizes");
  const [visibilityFilter, setVisibilityFilter] = useState("All");
  const [tab, setTab] = useState("All Groups");
  const [showCreate, setShowCreate] = useState(false);
  const [viewGroupId, setViewGroupId] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("studyconnect_user");
    if (!stored) { window.location.href = createPageUrl("Auth"); return; }
    setUser(JSON.parse(stored));

    // Check URL param for direct group view
    const params = new URLSearchParams(window.location.search);
    const viewParam = params.get("view");
    if (viewParam) setViewGroupId(viewParam);

    loadGroups();
  }, []);

  const loadGroups = async () => {
    const all = await base44.entities.StudyGroup.list();
    setGroups(all);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this group?")) return;
    await base44.entities.StudyGroup.delete(id);
    loadGroups();
  };

  const handleCreate = async (data) => {
    const stored = JSON.parse(localStorage.getItem("studyconnect_user"));
    await base44.entities.StudyGroup.create({
      ...data,
      owner_email: stored.email,
      owner_name: stored.full_name,
      members: [{ name: stored.full_name, email: stored.email, role: "Owner" }],
    });
    setShowCreate(false);
    loadGroups();
  };

  if (!user) return null;

  if (viewGroupId) {
    const group = groups.find(g => g.id === viewGroupId);
    if (group) return (
      <div className="min-h-screen bg-gray-50 font-sans">
        <TopBar user={user} />
        <div className="flex">
          <Sidebar currentPage="Groups" user={user} />
          <main className="flex-1 p-8">
            <GroupDetail
              group={group}
              user={user}
              onBack={() => setViewGroupId(null)}
              onUpdate={loadGroups}
            />
          </main>
        </div>
      </div>
    );
  }

  const myGroups = groups.filter(g =>
    g.owner_email === user.email || (g.members || []).some(m => m.email === user.email)
  );

  const filtered = (tab === "My Groups" ? myGroups : groups).filter(g => {
    const matchSearch = g.name.toLowerCase().includes(search.toLowerCase());
    const matchCourse = courseFilter === "All Courses" || g.course === courseFilter;
    const matchVis = visibilityFilter === "All" || g.visibility === visibilityFilter;
    const size = (g.members || []).length;
    const matchSize =
      sizeFilter === "All Sizes" ||
      (sizeFilter === "Small (<10)" && size < 10) ||
      (sizeFilter === "Medium (10-20)" && size >= 10 && size <= 20) ||
      (sizeFilter === "Large (>20)" && size > 20);
    return matchSearch && matchCourse && matchVis && matchSize;
  });

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <TopBar user={user} />
      <div className="flex">
        <Sidebar currentPage="Groups" user={user} />
        <main className="flex-1 p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <svg width="24" height="24" fill="none" className="text-orange-500" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/><path d="M23 21v-2a4 4 0 0 0-3-3.87" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              <h1 className="text-2xl font-bold text-gray-900">Study Groups</h1>
            </div>
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-5 py-2 rounded transition"
            >
              <Plus className="w-4 h-4" /> Create Group
            </button>
          </div>
          <p className="text-sm text-gray-500 mb-5">Find or create groups to study together</p>

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm p-4 mb-5 flex flex-wrap gap-3">
            <div className="flex items-center gap-2 border rounded-lg px-3 py-2 flex-1 min-w-[160px]">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                placeholder="Search groups..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="text-sm outline-none flex-1"
              />
            </div>
            <select value={courseFilter} onChange={e => setCourseFilter(e.target.value)} className="border rounded-lg px-3 py-2 text-sm outline-none">
              {COURSES.map(c => <option key={c}>{c}</option>)}
            </select>
            <select value={sizeFilter} onChange={e => setSizeFilter(e.target.value)} className="border rounded-lg px-3 py-2 text-sm outline-none">
              {["All Sizes", "Small (<10)", "Medium (10-20)", "Large (>20)"].map(s => <option key={s}>{s}</option>)}
            </select>
            <select value={visibilityFilter} onChange={e => setVisibilityFilter(e.target.value)} className="border rounded-lg px-3 py-2 text-sm outline-none">
              {["All", "Public", "Private"].map(v => <option key={v}>{v}</option>)}
            </select>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-5">
            {["All Groups", `My Groups (${myGroups.length})`, "Discover"].map(t => (
              <button
                key={t}
                onClick={() => setTab(t.startsWith("My") ? "My Groups" : t)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                  (t === "All Groups" && tab === "All Groups") ||
                  (t.startsWith("My") && tab === "My Groups") ||
                  (t === "Discover" && tab === "Discover")
                    ? "bg-orange-500 text-white"
                    : "bg-white text-gray-600 hover:bg-orange-50"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Group Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map(g => (
              <GroupCard
                key={g.id}
                group={g}
                user={user}
                onDelete={() => handleDelete(g.id)}
                onView={() => setViewGroupId(g.id)}
              />
            ))}
            {filtered.length === 0 && (
              <p className="text-gray-400 text-sm col-span-2">No groups found.</p>
            )}
          </div>
        </main>
      </div>

      {showCreate && (
        <CreateGroupModal onClose={() => setShowCreate(false)} onCreate={handleCreate} />
      )}
    </div>
  );
}