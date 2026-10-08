import { useNavigate } from 'react-router-dom';
import { Users, Lock, Globe, MessageSquare, Check, Trash2, ArrowRight, ShieldCheck } from 'lucide-react';

export default function GroupCard({ group, user, onDelete, onView, onRequestJoin, onChatClick }) {
  const navigate = useNavigate();
  const memberCount = (group.members || []).length;
  const maxMembers = group.max_members || group.maxMembers || 100;
  const fillPercentage = Math.min(100, Math.round((memberCount / maxMembers) * 100));
  
  const userEmail = user?.email?.toLowerCase();
  const ownerEmail = (group.owner_email || group.ownerEmail || '').toLowerCase();
  const isOwner = userEmail && ownerEmail === userEmail;
  const isMember = isOwner || (group.members || []).some(m => {
    const mEmail = (m.email || m.userEmail || '').toLowerCase();
    return mEmail && mEmail === userEmail;
  });
  const isFull = memberCount >= maxMembers;

  // Check if user has already requested to join this group
  const hasRequested = () => {
    const notifications = JSON.parse(localStorage.getItem("studyconnect_notifications") || "[]");
    return notifications.some(n => 
      n.type === 'group_join_request' && 
      (n.sender_email || n.senderEmail)?.toLowerCase() === userEmail && 
      String(n.group_id || n.groupId) === String(group.id) &&
      !n.read
    );
  };

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between relative overflow-hidden">
      {/* Top Gradient Accent Line */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${
        group.visibility === "Private"
          ? "bg-gradient-to-r from-amber-500 to-orange-400"
          : "bg-gradient-to-r from-orange-500 via-amber-500 to-emerald-400"
      }`} />

      <div>
        {/* Header Badges */}
        <div className="flex items-start justify-between gap-2 mb-3 pt-1">
          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-orange-50 text-orange-700 border border-orange-200/60">
            {group.course || group.courseName || "General Study"}
          </span>

          <div className="flex items-center gap-1.5">
            {group.visibility === "Private" ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                <Lock className="w-3 h-3 text-amber-500" /> Private
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/50 px-2 py-0.5 rounded-md">
                <Globe className="w-3 h-3 text-emerald-500" /> Public
              </span>
            )}

            {isOwner && (
              <button 
                onClick={onDelete} 
                title="Delete group"
                className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Group Name & Description */}
        <h3 className="font-bold text-slate-900 text-lg group-hover:text-orange-600 transition-colors leading-snug mb-1.5">
          {group.name}
        </h3>
        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
          {group.description || "No description provided. Join to study together!"}
        </p>

        {/* Member Capacity Meter */}
        <div className="mb-4 bg-slate-50 rounded-xl p-2.5 border border-slate-100">
          <div className="flex items-center justify-between text-xs text-slate-600 mb-1.5 font-medium">
            <span className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span>Members</span>
            </span>
            <span className="font-bold text-slate-800">
              {memberCount} <span className="text-slate-400 font-normal">/ {maxMembers}</span>
            </span>
          </div>
          <div className="w-full bg-slate-200/70 h-1.5 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                fillPercentage >= 90 ? "bg-red-500" : fillPercentage >= 60 ? "bg-amber-500" : "bg-orange-500"
              }`}
              style={{ width: `${Math.max(5, fillPercentage)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
        {isOwner ? (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-600" /> Host
          </span>
        ) : isMember ? (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
            <Check className="w-3.5 h-3.5 text-emerald-600" /> Member
          </span>
        ) : (
          <span className="text-xs text-slate-400">
            {isFull ? "Room full" : "Open to join"}
          </span>
        )}

        {isMember ? (
          <button
            onClick={() => onChatClick ? onChatClick(group) : (onView && onView(group))}
            className="flex items-center gap-1.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Chat Room</span>
          </button>
        ) : hasRequested() ? (
          <button
            disabled
            className="flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold px-3 py-1.5 rounded-xl cursor-not-allowed"
          >
            Requested
          </button>
        ) : isFull ? (
          <button
            disabled
            className="bg-slate-100 text-slate-400 text-xs font-medium px-3.5 py-1.5 rounded-xl cursor-not-allowed"
          >
            Full
          </button>
        ) : (
          <button
            onClick={() => onRequestJoin(group)}
            className={`flex items-center gap-1.5 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 ${
              group.visibility === "Private"
                ? "bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
                : "bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
            }`}
          >
            <span>{group.visibility === "Private" ? "Request Join" : "+ Join Group"}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}