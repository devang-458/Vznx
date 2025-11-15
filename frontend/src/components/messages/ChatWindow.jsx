import React, { useEffect, useState } from 'react';
import image from "../../assets/images/user.png";

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

    const selected = conversations.find(c => c._id === selectedConversation);
    const otherUser = selected?.user;
    const profileImage = otherUser?.profileImageUrl || image;

    useEffect(() => {
        if (conversations.length > 0) {
            setUsername(conversations[0].user?.name);
        }
    }, [selected])


    if (!selectedConversation) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <p className="text-gray-500">Select a conversation to start chatting</p>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col h-[90%]">

            {/* Header */}
            <div className="p-4 border-b border-gray-200 flex items-center">
                <img
                    src={profileImage}
                    alt={otherUser?.name}
                    className="w-10 h-10 border rounded-full mr-3"
                />
                <h2 className="text-xl font-bold">{userName}</h2>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4">
                {messages.map((msg) => (
                    <div
                        key={msg._id}
                        className={`flex mb-4 ${msg.sender === user._id ? "justify-end" : "justify-start"
                            }`}
                    >
                        <div
                            className={`p-3 rounded-lg ${msg.sender === user._id
                                ? "bg-blue-500 text-white"
                                : "bg-gray-200"
                                }`}
                        >
                            <p>{msg.content}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200">
                <div className="flex">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-2 border rounded-lg focus:outline-none"
                    />
                    <button
                        onClick={onSendMessage}
                        className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-lg"
                    >
                        Send
                    </button>
                </div>
            </div>

        </div>
    );
};

export default ChatWindow;
