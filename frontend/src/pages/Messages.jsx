import React, { useState, useEffect, useContext, useReducer } from 'react';
import DashboardLayout from '../components/layouts/DashboardLayout';
import { useUserAuth } from '../hooks/useUserAuth';
import { UserContext } from '../context/userContext';
import axiosInstance from '../utils/axiosinstance';
import { useSearchParams } from 'react-router-dom';
import ConversationList from '../components/messages/ConversationList';
import ChatWindow from '../components/messages/ChatWindow';
// import useSocket from '../hooks/useSocket'; // Removed
// import { ToastContainer, toast } from 'react-toastify'; // Removed
// import 'react-toastify/dist/ReactToastify.css'; // Removed

const initialState = {
    conversations: [],
    messages: [],
    selectedConversation: null,
    loading: false,
    error: ''
};

function reducer(state, action) {
    switch (action.type) {
        case 'FETCH_CONVERSATIONS_SUCCESS':
            return { ...state, conversations: action.payload, loading: false };
        case 'FETCH_MESSAGES_SUCCESS':
            return { ...state, messages: action.payload, loading: false };
        case 'SET_SELECTED_CONVERSATION':
            return { ...state, selectedConversation: action.payload };
        case 'SEND_MESSAGE_SUCCESS':
            return { ...state, messages: [...state.messages, action.payload] };
        case 'RECEIVE_MESSAGE':
            // const sender = state.conversations.find(c => c._id === action.payload.sender); // Removed
            // const senderName = sender ? sender.user.name : 'Unknown'; // Removed
            // // Add logic to show a toast notification // Removed
            // if (action.payload.sender !== state.selectedConversation) { // Removed
            //     toast.info(`New message from ${senderName}`); // Removed
            // } // Removed
            return { ...state, messages: [...state.messages, action.payload] };
        case 'SET_LOADING':
            return { ...state, loading: action.payload };
        case 'SET_ERROR':
            return { ...state, error: action.payload, loading: false };
        default:
            return state;
    }
}


const Messages = () => {
    useUserAuth();
    const { user } = useContext(UserContext);
    const [searchParams] = useSearchParams();
    const userId = searchParams.get('userId');
    const [state, dispatch] = useReducer(reducer, initialState);
    const [newMessage, setNewMessage] = useState('');

    // useSocket(dispatch); // Removed

    useEffect(() => {
        if (user) {
            getConversations();
        }
        console.log("ii", user)
    }, [user]);

    useEffect(() => {
        if (userId) {
            handleSelectConversation(userId);
        }
    }, [userId]);

    const getConversations = async () => {
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
            const response = await axiosInstance.get('/api/messages/conversations');
            console.log('Conversations:', response.data.data);
            dispatch({ type: 'FETCH_CONVERSATIONS_SUCCESS', payload: response.data.data });
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: 'Failed to fetch conversations' });
        }
    };

    const getMessages = async (otherUserId) => {
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
            const response = await axiosInstance.get(`/api/messages/${otherUserId}`);
            dispatch({ type: 'FETCH_MESSAGES_SUCCESS', payload: response.data.data });
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: 'Failed to fetch messages' });
        }
    };

    const handleSelectConversation = (otherUserId) => {
        dispatch({ type: 'SET_SELECTED_CONVERSATION', payload: otherUserId });
        getMessages(otherUserId);
    };

    const sendMessage = async () => {
        if (!newMessage.trim() || !state.selectedConversation) return;

        try {
            const response = await axiosInstance.post('/api/messages', {
                receiverId: state.selectedConversation,
                content: newMessage
            });
            dispatch({ type: 'SEND_MESSAGE_SUCCESS', payload: response.data.data });
            setNewMessage('');
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: 'Failed to send message' });
        }
    };

    return (
        <DashboardLayout activeMenu="Messages" className="h-screen overflow-hidden">

            <div className="flex flex-col h-full bg-gray-50">
                <div className="flex flex-1 overflow-hidden h-full">
                    <ConversationList
                        conversations={state.conversations}
                        selectedConversation={state.selectedConversation}
                        onSelectConversation={handleSelectConversation}
                        user={user}
                    />
                    {state.selectedConversation ? (
                        <ChatWindow
                            messages={state.messages}
                            selectedConversation={state.selectedConversation}
                            onSendMessage={sendMessage}
                            newMessage={newMessage}
                            setNewMessage={setNewMessage}
                            user={user}
                            conversations={state.conversations}
                        />
                    ) : (
                        <div className="flex-1 flex items-center justify-center bg-gray-50">
                            <div className="text-center">
                                <h2 className="text-2xl font-semibold text-gray-700">Welcome to Messages</h2>
                                <p className="text-gray-500 mt-2">Select a conversation to start chatting.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            {/* <ToastContainer /> */}
        </DashboardLayout>
    );
};

export default Messages;