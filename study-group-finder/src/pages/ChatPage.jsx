import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Users, MessageCircle } from 'lucide-react';
import ChatLayout from '../components/groups/ChatLayout';
import { useAuth } from '@/lib/AuthContext';

const ChatPage = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  console.log('ChatPage: Component loaded');
  console.log('ChatPage: groupId:', groupId);
  console.log('ChatPage: user:', user);

  // If no user, redirect to auth
  if (!user) {
    console.log('ChatPage: No user found, redirecting to auth');
    navigate('/auth');
    return null;
  }

  // Auto-select first group if no groupId provided
  if (!groupId) {
    console.log('ChatPage: No groupId, auto-selecting first group');
    
    // Get user's groups from localStorage
    let allGroups = JSON.parse(localStorage.getItem("studyconnect_groups") || "[]");
    
    // Add mock groups if none exist (for testing)
    if (allGroups.length === 0) {
      console.log('ChatPage: No groups found, adding mock groups');
      const mockGroups = [
        {
          id: "group_1",
          name: "Computer Science Study Group",
          course: "Computer Science Engineering",
          description: "Study group for CSE students",
          owner_email: user?.email || "dineshmatti707@gmail.com",
          members: [
            { email: user?.email || "dineshmatti707@gmail.com", name: user?.fullName || "M.Dinesh" },
            { email: "chethan707@gmail.com", name: "Chethan Kumar" }
          ],
          visibility: "public",
          created_at: new Date().toISOString()
        },
        {
          id: "group_2", 
          name: "AI/ML Study Group",
          course: "Artificial Intelligence & Machine Learning",
          description: "Study group for AI/ML enthusiasts",
          owner_email: user?.email || "dineshmatti707@gmail.com",
          members: [
            { email: user?.email || "dineshmatti707@gmail.com", name: user?.fullName || "M.Dinesh" },
            { email: "priya707@gmail.com", name: "Priya Sharma" }
          ],
          visibility: "public",
          created_at: new Date().toISOString()
        }
      ];
      
      localStorage.setItem("studyconnect_groups", JSON.stringify(mockGroups));
      allGroups = mockGroups;
      console.log('ChatPage: Mock groups added:', mockGroups);
    }
    
    const userGroups = allGroups.filter(group => 
      group.members?.some(member => member.email === user?.email) ||
      group.owner_email === user?.email
    );
    
    console.log('ChatPage: User groups found:', userGroups);
    
    if (userGroups.length > 0) {
      // Navigate to the first group's chat
      const firstGroup = userGroups[0];
      console.log('ChatPage: Navigating to group:', firstGroup.id, firstGroup.name);
      navigate(`/chat/${firstGroup.id}`, { replace: true });
      return null;
    } else {
      // No groups available, show message
      return (
        <div className="flex items-center justify-center min-h-screen bg-white">
          <div className="text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center text-orange-500 mx-auto mb-4">
              <MessageCircle className="w-8 h-8" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">No Study Groups</h2>
            <p className="text-gray-600 mb-4">
              You haven't joined any study groups yet.
            </p>
            <button
              onClick={() => navigate('/groups')}
              className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
            >
              Browse Groups
            </button>
          </div>
        </div>
      );
    }
  }

  // If we have a groupId, show the ChatLayout (split-screen view)
  const handleCloseChat = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ChatLayout user={user} onClose={handleCloseChat} groupId={groupId} />
    </div>
  );
};

export default ChatPage;
