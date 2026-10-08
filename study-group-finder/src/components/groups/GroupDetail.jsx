import { useState, useEffect } from "react";
import { ArrowLeft, Lock, Unlock, Crown, Trash2, UserPlus, Edit2, Check, X } from "lucide-react";

export default function GroupDetail({ group, user, onBack, onUpdate }) {
  const [members, setMembers] = useState(group.members || []);
  const [editingIdx, setEditingIdx] = useState(null);
  const [editName, setEditName] = useState("");
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [activeTab, setActiveTab] = useState("members");

  const isOwner = group.owner_email === user?.email;

  const saveMembers = (updated) => {
    // Update group in localStorage
    const allGroups = JSON.parse(localStorage.getItem("studyconnect_groups") || "[]");
    const groupIndex = allGroups.findIndex(g => g.id === group.id);
    if (groupIndex !== -1) {
      allGroups[groupIndex] = { ...allGroups[groupIndex], members: updated };
      localStorage.setItem("studyconnect_groups", JSON.stringify(allGroups));
    }
    setMembers(updated);
    onUpdate();
  };

  const handleEditMember = (idx) => {
    const updated = [...members];
    updated[idx] = { ...updated[idx], name: editName };
    setEditingIdx(null);
    saveMembers(updated);
  };

  const handleDeleteMember = (idx) => {
    if (!confirm("Remove this member?")) return;
    const updated = members.filter((_, i) => i !== idx);
    saveMembers(updated);
  };

  const handleAddMember = () => {
    if (!newMemberName || !newMemberEmail) return;
    if (members.length >= (group.max_members || 100)) {
      alert("Group is full!");
      return;
    }
    const updated = [...members, { name: newMemberName, email: newMemberEmail, role: "Member" }];
    saveMembers(updated);
    setNewMemberName("");
    setNewMemberEmail("");
    setShowAddMember(false);
  };

  const colorMap = ["bg-purple-400", "bg-blue-400", "bg-green-400", "bg-pink-400", "bg-yellow-400", "bg-orange-400"];

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-5 text-sm font-medium">
        <ArrowLeft className="w-4 h-4" /> Back to Groups
      </button>

      {/* Group Info */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-5">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-2xl font-bold text-gray-900">{group.name}</h2>
              <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${group.visibility === "Public" ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-600"}`}>
                {group.visibility === "Public" ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                {group.visibility}
              </span>
            </div>
            <span className="inline-block bg-purple-100 text-purple-700 text-xs font-semibold px-2 py-0.5 rounded mb-2">{group.course}</span>
            <p className="text-sm text-gray-600">{group.description}</p>
          </div>
          <div className="flex items-center gap-1 text-gray-600 text-sm">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2"/><circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/></svg>
            <span className="font-bold">{members.length}</span>
            <span>/ {group.max_members || 100}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-3 mb-4">
        <button
          onClick={() => setActiveTab("members")}
          className={`px-5 py-2 rounded-full text-sm font-medium transition ${activeTab === "members" ? "bg-orange-500 text-white" : "bg-white text-gray-600 border hover:bg-orange-50"}`}
        >
          Members ({members.length})
        </button>
      </div>

      {activeTab === "members" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900 text-lg">Members ({members.length})</h3>
            {isOwner && members.length < (group.max_members || 100) && (
              <button
                onClick={() => setShowAddMember(!showAddMember)}
                className="flex items-center gap-1 text-sm text-orange-500 border border-orange-400 px-3 py-1 rounded hover:bg-orange-50 transition"
              >
                <UserPlus className="w-4 h-4" /> Add Member
              </button>
            )}
          </div>

          {showAddMember && (
            <div className="flex gap-2 mb-4">
              <input
                placeholder="Name"
                value={newMemberName}
                onChange={e => setNewMemberName(e.target.value)}
                className="border rounded px-2 py-1 text-sm flex-1 focus:outline-none focus:border-orange-400"
              />
              <input
                placeholder="Email"
                value={newMemberEmail}
                onChange={e => setNewMemberEmail(e.target.value)}
                className="border rounded px-2 py-1 text-sm flex-1 focus:outline-none focus:border-orange-400"
              />
              <button onClick={handleAddMember} className="bg-orange-500 text-white px-3 py-1 rounded text-sm font-medium hover:bg-orange-600 transition">Add</button>
              <button onClick={() => setShowAddMember(false)} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
            </div>
          )}

          <div className="space-y-2">
            {members.map((m, idx) => (
              <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm ${colorMap[idx % colorMap.length]}`}>
                    {m.name?.[0]?.toUpperCase() || "U"}
                  </div>
                  <div>
                    {editingIdx === idx ? (
                      <div className="flex items-center gap-2">
                        <input
                          value={editName}
                          onChange={e => setEditName(e.target.value)}
                          className="border rounded px-2 py-0.5 text-sm focus:outline-none focus:border-orange-400"
                        />
                        <button onClick={() => handleEditMember(idx)}><Check className="w-4 h-4 text-green-500" /></button>
                        <button onClick={() => setEditingIdx(null)}><X className="w-4 h-4 text-gray-400" /></button>
                      </div>
                    ) : (
                      <p className="font-medium text-sm text-gray-800">{m.name}</p>
                    )}
                    <p className="text-xs text-gray-400">{m.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {m.role === "Owner" ? (
                    <span className="flex items-center gap-1 text-yellow-500 text-xs font-semibold">
                      <Crown className="w-3 h-3" /> Owner
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400">Member</span>
                  )}
                  {isOwner && m.role !== "Owner" && (
                    <div className="flex items-center gap-2">
                      <button onClick={() => { setEditingIdx(idx); setEditName(m.name); }}>
                        <Edit2 className="w-3 h-3 text-gray-400 hover:text-orange-500" />
                      </button>
                      <button onClick={() => handleDeleteMember(idx)}>
                        <Trash2 className="w-3 h-3 text-gray-400 hover:text-red-500" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}