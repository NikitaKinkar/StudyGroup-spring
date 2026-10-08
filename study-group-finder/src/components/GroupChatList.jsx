import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Users, Search, X, ArrowLeft } from 'lucide-react';
import chatService from '../services/chatService';

const GroupChatList = ({ user }) => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch user's enrolled groups from localStorage
    const fetchUserGroups = async () => {
      try {
        // Get user's enrolled groups from localStorage
        const allGroups = JSON.parse(localStorage.getItem("studyconnect_groups") || "[]");
        const userGroups = allGroups.filter(group => 
          group.members?.some(member => member.email === user?.email) ||
          group.owner_email === user?.email
        );
        
        // Transform groups for chat display
        const chatGroups = userGroups.map(group => ({
          id: group.id,
          name: group.name,
          courseName: group.course,
          memberCount: (group.members || []).length,
          description: group.description,
          visibility: group.visibility
        }));
        
        setGroups(chatGroups);
      } catch (error) {
        console.error('Failed to fetch groups:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchUserGroups();
    }
  }, [user]);

  const filteredGroups = groups.filter(group =>
    group.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.courseName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleGroupClick = (groupId) => {
    navigate(`/chat/${groupId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white mx-auto mb-4">
            <MessageCircle className="w-6 h-6" />
          </div>
          <p className="text-gray-600">Loading your groups...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">Group Chats</h1>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search groups..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-colors"
          />
        </div>
      </div>

      {/* Groups List */}
      <div className="bg-white">
        {filteredGroups.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center text-orange-500 mx-auto mb-4">
              <MessageCircle className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'No groups found' : 'No enrolled groups'}
            </h3>
            <p className="text-gray-600">
              {searchTerm 
                ? 'Try adjusting your search terms'
                : 'Join groups to start chatting'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredGroups.map((group) => (
              <div
                key={group.id}
                onClick={() => handleGroupClick(group.id)}
                className="px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                    {group.name?.charAt(0)?.toUpperCase() || 'G'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {group.name}
                      </h3>
                      <span className="text-xs text-gray-500">
                        {group.memberCount} members
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 truncate">
                      {group.courseName || 'Course'}
                    </p>
                    <div className="flex items-center space-x-1 mt-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-xs text-green-600">Active</span>
                    </div>
                  </div>
                  <MessageCircle className="w-5 h-5 text-orange-500 flex-shrink-0" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupChatList;
