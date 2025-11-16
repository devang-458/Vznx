import { useEffect, useContext } from 'react';
import socket from '../utils/socket';
import { UserContext } from '../context/userContext';

const useSocket = (onReceiveMessage) => {
    const { user } = useContext(UserContext);

    useEffect(() => {
        if (user) {
            socket.connect();
            socket.emit('register', user._id);

            socket.on('receiveMessage', (newMessage) => {
                onReceiveMessage(newMessage);
            });

            return () => {
                socket.off('receiveMessage');
                socket.disconnect();
            };
        }
    }, [user, onReceiveMessage]);
};

export default useSocket;
