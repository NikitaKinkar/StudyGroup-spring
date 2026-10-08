import { useState, useEffect } from "react";
import { createPageUrl } from "@/utils/index.js";
import TopBar from "../components/dashboard/TopBar";
import Sidebar from "../components/dashboard/Sidebar";
import NotificationBar from "../components/notifications/NotificationBar";
import ProfileEdit from "../components/auth/ProfileEdit";
import { User, Mail, GraduationCap, Calendar, Award, ShieldCheck, Edit3, Sparkles } from "lucide-react";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [showEdit, setShowEdit] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("studyconnect_user");
    if (!stored) {
      window.location.href = createPageUrl("Auth");
      return;
    }
    setUser(JSON.parse(stored));
  }, []);

  const handleSaveProfile = (updatedData) => {
    // Update user in localStorage
    localStorage.setItem("studyconnect_user", JSON.stringify(updatedData));
    
    // Update user in users list
    const users = JSON.parse(localStorage.getItem("studyconnect_users") || "[]");
    const userIndex = users.findIndex(u => u.email === updatedData.email);
    if (userIndex !== -1) {
      users[userIndex] = updatedData;
      localStorage.setItem("studyconnect_users", JSON.stringify(users));
    }
    
    // Update local state
    setUser(updatedData);
    setShowEdit(false);
    
    // Show success message
    alert("Profile updated successfully!");
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50/50 font-sans">
      <TopBar user={user} extraContent={<NotificationBar user={user} />} />
      <div className="flex">
        <Sidebar currentPage="Profile" user={user} />
        <main className="flex-1 p-6 lg:p-8 max-w-5xl mx-auto">
          {/* Main Profile Card with Cover Banner */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 overflow-hidden">
            {/* Header Banner */}
            <div className="h-44 sm:h-52 bg-gradient-to-r from-orange-500 via-amber-500 to-rose-500 relative p-6 flex flex-col justify-end">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/20 via-transparent to-black/10"></div>
              <div className="relative z-10 flex justify-end">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/20 backdrop-blur-md text-white text-xs font-medium border border-white/20">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  StudyConnect Member
                </span>
              </div>
            </div>

            {/* Profile Avatar & Primary Info Row */}
            <div className="px-6 sm:px-8 pb-8 pt-0 relative">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-16 sm:-mt-20 mb-6">
                <div className="flex flex-col sm:flex-row sm:items-end gap-5">
                  {/* Avatar */}
                  <div className="relative">
                    {user.profile_image_url ? (
                      <img 
                        src={user.profile_image_url} 
                        alt="Profile" 
                        className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl object-cover ring-4 ring-white shadow-xl bg-white"
                      />
                    ) : (
                      <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 ring-4 ring-white shadow-xl flex items-center justify-center text-white text-4xl font-extrabold">
                        {user.full_name?.charAt(0)?.toUpperCase() || user.name?.charAt(0)?.toUpperCase() || "U"}
                      </div>
                    )}
                  </div>

                  <div className="pb-1">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                      {user.full_name || user.name || "Student User"}
                    </h1>
                    <p className="text-sm font-medium text-slate-500">{user.email}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        Active Student
                      </span>
                      {user.university && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                          <GraduationCap className="w-3.5 h-3.5 text-slate-500" />
                          {user.university}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setShowEdit(true)}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold text-sm rounded-xl shadow-md shadow-orange-500/20 hover:shadow-lg transition-all cursor-pointer self-start sm:self-auto"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit Profile
                </button>
              </div>

              {/* Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 pt-8 border-t border-slate-100">
                {/* Personal Information */}
                <div className="bg-slate-50/70 rounded-2xl p-6 border border-slate-200/60">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 rounded-xl bg-orange-100 text-orange-600">
                      <User className="w-4 h-4" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900">Personal Information</h3>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-white p-3.5 rounded-xl border border-slate-200/60 shadow-2xs">
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Full Name</label>
                      <p className="text-sm font-bold text-slate-800">{user.full_name || user.name || "Not specified"}</p>
                    </div>

                    <div className="bg-white p-3.5 rounded-xl border border-slate-200/60 shadow-2xs">
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Email Address</label>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-slate-400" />
                        <p className="text-sm font-semibold text-slate-800">{user.email}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Academic Information */}
                <div className="bg-slate-50/70 rounded-2xl p-6 border border-slate-200/60">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 rounded-xl bg-amber-100 text-amber-600">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900">Academic Background</h3>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-white p-3.5 rounded-xl border border-slate-200/60 shadow-2xs">
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">University / Institute</label>
                      <p className="text-sm font-bold text-slate-800">{user.university || "University not provided"}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white p-3.5 rounded-xl border border-slate-200/60 shadow-2xs">
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Graduation Year</label>
                        <div className="flex items-center gap-1.5 text-sm font-bold text-slate-800">
                          <Calendar className="w-3.5 h-3.5 text-orange-500" />
                          <span>{user.passing_year || "N/A"}</span>
                        </div>
                      </div>

                      <div className="bg-white p-3.5 rounded-xl border border-slate-200/60 shadow-2xs">
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Cumulative GPA</label>
                        <div className="flex items-center gap-1.5 text-sm font-bold text-slate-800">
                          <Award className="w-3.5 h-3.5 text-amber-500" />
                          <span>{user.passing_gpa || "N/A"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Security & Account Information */}
                <div className="md:col-span-2 bg-slate-50/70 rounded-2xl p-6 border border-slate-200/60">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 rounded-xl bg-emerald-100 text-emerald-600">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900">Account & Verification</h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white p-3.5 rounded-xl border border-slate-200/60 shadow-2xs">
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Account Role</label>
                      <p className="text-sm font-bold text-slate-800">{user.role || "Student"}</p>
                    </div>

                    <div className="bg-white p-3.5 rounded-xl border border-slate-200/60 shadow-2xs">
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Account Status</label>
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        Active & Verified
                      </span>
                    </div>

                    <div className="bg-white p-3.5 rounded-xl border border-slate-200/60 shadow-2xs">
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Member Since</label>
                      <p className="text-sm font-bold text-slate-800">
                        {user.created_at ? new Date(user.created_at).getFullYear() : new Date().getFullYear()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {showEdit && (
        <ProfileEdit
          user={user}
          onSave={handleSaveProfile}
          onCancel={() => setShowEdit(false)}
        />
      )}
    </div>
  );
}
