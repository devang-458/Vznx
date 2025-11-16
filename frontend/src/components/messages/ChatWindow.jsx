import React, { useEffect, useState, useRef } from 'react';
import image from "../../assets/images/user.png";
import Input from '../Inputs/Input';
import Button from '../layouts/Button';
import { FaPaperclip, FaSmile } from 'react-icons/fa';

const ChatWindow = ({
    messages,
    selectedConversation,
    onSendMessage,
    newMessage,
    setNewMessage,
    user,
    conversations
}) => {
    const [userName, setUsername] = useState("");
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        const selected = conversations.find(c => c._id === selectedConversation);
        if (selected) {
            setUsername(selected.user?.name);
            console.log("ChatWindow useEffect: selected conversation", selected);
            console.log("ChatWindow useEffect: userName", selected.user?.name);
        } else {
            setUsername(""); // Clear username if no conversation is selected
            console.log("ChatWindow useEffect: No conversation selected or found.");
        }
    }, [selectedConversation, conversations]);



    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            console.log("Selected file:", file.name);
            // Handle file upload logic here
        }
    };

    const selected = conversations.find(c => c._id === selectedConversation);
    const otherUser = selected?.user;
    const profileImage = otherUser?.profileImageUrl || image;

    return (
        <div className="flex-1 flex flex-col h-full bg-gray-50">

            {/* Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white">
                <div className="flex items-center">
                    <div className="relative">
                        <img
                            src={profileImage}
                            alt={otherUser?.name}
                            className="w-12 h-12 border rounded-full mr-4"
                        />
                        <span className="absolute bottom-0 right-4 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 truncate">{userName}</h2>
                        <p className="text-sm text-gray-500">Online</p>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="h-[66%] overflow-y-auto  p-6 space-y-4">
                {messages.map((msg) => (
                    <div
                        key={msg._id}
                        className={`flex items-end gap-3 ${msg.sender === user._id ? "justify-end" : "justify-start"}`}
                    >
                        {msg.sender !== user._id && (
                            <img src={profileImage} alt={userName} className="w-8 h-8 rounded-full" />
                        )}
                        <div
                            className={`max-w-lg p-3 rounded-2xl shadow-md ${msg.sender === user._id
                                ? "bg-blue-600 text-white rounded-br-none"
                                : "bg-white text-gray-800 rounded-bl-none"
                                }`}
                        >
                            <p>{msg.content}</p>
                            <p className={`text-xs mt-1 ${msg.sender === user._id ? 'text-blue-200' : 'text-gray-400'}`}>
                                {new Date(msg.createdAt).toLocaleTimeString()}
                            </p>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} className="h-0" />
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-gray-200">
                <div className="flex items-center gap-4">
                    <div className="flex gap-2">
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            onChange={handleFileSelect}
                        />
                        <Button variant="ghost" size="icon" onClick={() => fileInputRef.current.click()}><FaPaperclip className="text-gray-500" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => console.log("Emoji clicked")}><FaSmile className="text-gray-500" /></Button>
                    </div>
                    <Input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && onSendMessage()}
                        placeholder="Type a message..."
                        className="flex-1 bg-gray-100 border-transparent focus:bg-white focus:border-blue-500"
                    />
                    <Button
                        onClick={onSendMessage}
                        variant="primary"
                        className="rounded-full px-6 py-3"
                    >
                        Send
                    </Button>
                </div>
            </div>

        </div>
    );
};

export default ChatWindow;
