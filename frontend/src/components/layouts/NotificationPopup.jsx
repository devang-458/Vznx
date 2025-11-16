import React, { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axiosinstance';
import { API_PATHS } from '../../utils/apiPaths';
import { Link } from 'react-router-dom';
import Button from './Button';
import image from '../../assets/images/user.png';

const NotificationPopup = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchNotifications = async () => {
            setLoading(true);
            try {
                const response = await axiosInstance.get('/api/messages/conversations');
                setNotifications(response.data.data);
            } catch (error) {
                console.error('Failed to fetch notifications:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchNotifications();
    }, []);

    return (
        <div className="absolute top-12 right-0 w-80 bg-white rounded-lg shadow-xl border z-40">
            <div className="p-4 border-b">
                <h3 className="font-semibold">Notifications</h3>
            </div>
            <div className="max-h-80 overflow-y-auto">
                {loading ? (
                    <div className="p-4 text-center">Loading...</div>
                ) : notifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">No new notifications</div>
                ) : (
                    notifications.map(notif => (
                        <Link
                            to={`/admin/messages?userId=${notif._id}`}
                            key={notif._id}
                            className="flex items-center p-4 hover:bg-gray-50 border-b"
                        >
                            <img src={notif.user?.profileImageUrl || image} alt={notif.user.name} className="w-10 h-10 rounded-full mr-3" />
                            <div>
                                <p className="font-semibold">{notif.user.name}</p>
                                <p className="text-sm text-gray-600 truncate">{notif.lastMessage.content}</p>
                                <p className="text-xs text-gray-400 mt-1">{new Date(notif.lastMessage.createdAt).toLocaleDateString()}</p>
                            </div>
                        </Link>
                    ))
                )}
            </div>
            <div className="p-2 border-t">
                <Link to="/admin/messages">
                    <Button variant="ghost" className="w-full">
                        See All Messages
                    </Button>
                </Link>
            </div>
        </div>
    );
};

export default NotificationPopup;
