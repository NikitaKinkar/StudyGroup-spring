import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Send } from "lucide-react";

export default function GroupChat({ groupId, user }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    loadMessages();
    const unsub = base44.entities.ChatMessage.subscribe((event) => {
      if (event.data?.group_id === groupId) {
        loadMessages();
      }
    });
    return unsub;
  }, [groupId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadMessages = async () => {
    const all = await base44.entities.ChatMessage.filter({ group_id: groupId }, "created_date", 100);
    setMessages(all);
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    await base44.entities.ChatMessage.create({
      group_id: groupId,
      sender_name: user.full_name,
      sender_email: user.email,
      content: input.trim(),
      timestamp: new Date().toISOString(),
    });
    setInput("");
    loadMessages();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const colorMap = ["bg-purple-400", "bg-blue-400", "bg-green-400", "bg-pink-400", "bg-yellow-400", "bg-orange-400"];
  const getColor = (email) => {
    let hash = 0;
    for (let c of email) hash += c.charCodeAt(0);
    return colorMap[hash % colorMap.length];
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col" style={{ height: "420px" }}>
      <div className="p-4 border-b font-bold text-gray-800">Group Chat</div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-center text-gray-400 text-sm mt-8">No messages yet. Start the conversation!</p>
        )}
        {messages.map((msg) => {
          const isMe = msg.sender_email === user.email;
          return (
            <div key={msg.id} className={`flex items-end gap-2 ${isMe ? "flex-row-reverse" : ""}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${getColor(msg.sender_email || "")}`}>
                {msg.sender_name?.[0]?.toUpperCase() || "U"}
              </div>
              <div className={`max-w-[70%] ${isMe ? "items-end" : "items-start"} flex flex-col`}>
                {!isMe && <span className="text-xs text-gray-400 mb-0.5">{msg.sender_name}</span>}
                <div className={`px-3 py-2 rounded-2xl text-sm ${isMe ? "bg-orange-500 text-white rounded-br-sm" : "bg-gray-100 text-gray-800 rounded-bl-sm"}`}>
                  {msg.content}
                </div>
              </div>

            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div className="p-3 border-t flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="flex-1 border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-orange-400"
        />
        <button
          onClick={handleSend}
          className="bg-orange-500 hover:bg-orange-600 text-white rounded-full w-9 h-9 flex items-center justify-center transition flex-shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}