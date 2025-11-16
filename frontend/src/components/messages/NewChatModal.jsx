import React, { useState, useEffect, useContext } from 'react';
import axiosInstance from '../../utils/axiosinstance';
import { API_PATHS } from '../../utils/apiPaths';
import { UserContext } from '../../context/userContext';
import image from "../../assets/images/user.png";
import Button from '../layouts/Button';

const NewChatModal = ({ onClose, onSelectUser }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { user: currentUser } = useContext(UserContext);

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            try {
                const response = await axiosInstance.get(API_PATHS.USERS.GET_ALL_USERS);
                // Filter out the current user from the list
                const filteredUsers = response.data.filter(u => u._id !== currentUser._id);
                setUsers(filteredUsers);
            } catch (err) {
                setError('Failed to fetch users');
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, [currentUser]);

    const handleSelect = (userId) => {
        onSelectUser(userId);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-1/3">
                <div className="p-4 border-b">
                    <h2 className="text-xl font-bold">Start a New Chat</h2>
                </div>
                <div className="p-4">
                    {loading && <p>Loading...</p>}
                    {error && <p className="text-red-500">{error}</p>}
                    <div className="space-y-2">
                        {users.map(u => (
                            <div
                                key={u._id}
                                className="flex items-center p-2 rounded-lg hover:bg-gray-100 cursor-pointer"
                                onClick={() => handleSelect(u._id)}
                            >
                                <img src={u.profileImageUrl || image} alt={u.name} className="w-10 h-10 rounded-full mr-3" />
                                <div>
                                    <p className="font-semibold">{u.name}</p>
                                    <p className="text-sm text-gray-500">{u.email}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="p-4 border-t flex justify-end">
                    <Button variant="secondary" onClick={onClose}>Cancel</Button>
                </div>
            </div>
        </div>
    );
};

export default NewChatModal;
