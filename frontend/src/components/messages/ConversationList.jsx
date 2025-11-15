import React from 'react';
import { useEffect } from 'react';

import image from "../../assets/images/user.png";

const ConversationList = ({ conversations, user, selectedConversation, onSelectConversation }) => {
    return (
        <div className="w-1/4 bg-gray-100 border-r border-gray-200">
            <div className="p-4 border-b border-gray-200">
                <h2 className="text-xl font-bold">Conversations</h2>
            </div>
            <div className="">
                {conversations.map((convo) => (
                    <div
                        key={convo._id}
                        className={`p-4 cursor-pointer hover:bg-gray-200 ${selectedConversation === convo._id ? 'bg-gray-200' : ''}`}
                        onClick={() => onSelectConversation(convo._id)}
                    >
                        <div className="flex items-center ">
                            <img src={convo.user[0]?.profileImageUrl ? convo.user.profileImageUrl : image } alt={convo.user.name} className="w-10 h-10 rounded-full mr-3" />
                            <div className=''>
                                <h3 className="font-semibold text-black">{convo.user.name}</h3>
                                <p className="text-sm text-gray-600 truncate">{convo.lastMessage.content}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ConversationList;
