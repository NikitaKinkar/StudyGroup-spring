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

  const activeUser = user || (() => {
    try {
      return JSON.parse(sessionStorage.getItem("studyconnect_user") || "null");
    } catch (e) {
      return null;
    }
  })();

  // If no user or token in sessionStorage, redirect to auth
  if (!activeUser || !sessionStorage.getItem("studyconnect_token")) {
    navigate('/auth');
    return null;
  }

  const handleCloseChat = () => {
    navigate('/dashboard');
  };

  return (
    <div className="h-screen bg-white flex flex-col">
      <ChatLayout user={activeUser} onClose={handleCloseChat} groupId={groupId} />
    </div>
  );
};

export default ChatPage;
