import React, { useState } from 'react';
import image from "../../assets/images/user.png";
import { FaSearch, FaEdit } from 'react-icons/fa';
import Button from '../layouts/Button';
import NewChatModal from './NewChatModal';

const ConversationList = ({ conversations, user, selectedConversation, onSelectConversation }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div className="w-1/3 border-r border-gray-200 flex flex-col ">
            <div className="p-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-800">Messages</h2>
                    <Button variant="ghost" size="icon" onClick={() => setIsModalOpen(true)}>
                        <FaEdit className="text-gray-500" />
                    </Button>
                </div>
                <div className="relative mt-4">
                    <FaSearch className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search conversations..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>
            <div className="flex-1 overflow-y-auto">
                {conversations.map((convo) => (
                    <div
                        key={convo._id}
                        className={`p-4 cursor-pointer flex items-center transition-colors duration-200 ${selectedConversation === convo._id ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                        onClick={() => onSelectConversation(convo._id)}
                    >
                        <div className="relative">
                            <img src={convo.user?.profileImageUrl || image} alt={convo.user.name} className="w-12 h-12 rounded-full mr-4" />
                            {/* Add a green dot for online status */}
                            <span className="absolute bottom-0 right-4 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-center">
                                <h3 className="font-semibold text-gray-800">{convo.user.name}</h3>
                                <p className="text-xs text-gray-500">{new Date(convo.lastMessage.createdAt).toLocaleTimeString()}</p>
                            </div>
                            <div className="flex justify-between items-center">
                                <p className="text-sm text-gray-600 truncate">{convo.lastMessage.content}</p>
                                {/* Add a badge for unread messages */}
                                {/* <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1">2</span> */}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            {isModalOpen && <NewChatModal onClose={() => setIsModalOpen(false)} onSelectUser={onSelectConversation} />}
        </div>
    );
};

export default ConversationList;
