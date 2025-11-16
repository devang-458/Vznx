import React, { useState, useContext } from 'react';
import SideMenu from './SideMenu';
import { HiOutlineMenu, HiOutlineX } from "react-icons/hi";
import Button from './Button';
import { LuBell, LuMessageCircle, LuCirclePlus, LuListTodo, LuFile } from 'react-icons/lu';
import NotificationPopup from './NotificationPopup';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../context/userContext';

const Navbar = ({ activeMenu }) => {
    const [openSideMenu, setOpenSideMenu] = useState(false);
    const [openNotificationPopup, setOpenNotificationPopup] = useState(false);
    const navigate = useNavigate();
    const { user } = useContext(UserContext); // Import UserContext

    const sendMessage = () => {
        navigate('/admin/messages'); // Assuming admin messages for now, will need to adjust based on user role
    };

    const createTask = () => {
        if (user?.role === "admin") {
            navigate("/admin/create-task");
        } else {
            navigate("/user/create-task");
        }
    };

    const createProject = () => {
        navigate("/admin/create-project");
    };

    const handleMyTasksOnly = () => {
        if (user?.role === "admin") {
            navigate("/admin/tasks?filter=mine"); // Example: pass a query param
        } else {
            navigate("/user/tasks?filter=mine"); // Example: pass a query param
        }
        console.log("My Tasks Only button clicked!");
    };

    return (
        <div className='flex justify-between items-center bg-white border-b border-gray-200/50 backdrop-blur-[2px] py-4 px-7 sticky top-0 z-30 shadow-md'>
            <div className="flex items-center gap-5">
                <Button
                    variant="ghost"
                    className='block lg:hidden text-black'
                    onClick={() => {
                        setOpenSideMenu(!openSideMenu)
                    }}
                >
                    {openSideMenu ? (
                        <HiOutlineX className="text-2xl" />
                    ) : (
                        <HiOutlineMenu className="text-2xl" />)}
                </Button>

                <h2 className='text-lg font-medium font-stack text-black'>Dashboard</h2>
            </div>

            <div className="relative flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleMyTasksOnly}
                    className="p-2"
                    title="My Tasks"
                >
                    <LuListTodo className="text-2xl text-gray-500" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={createTask}
                    className="p-2"
                    title="Create Task"
                >
                    <LuCirclePlus className="text-2xl text-gray-500" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={sendMessage}
                    className="p-2"
                    title="Messages"
                >
                    <LuMessageCircle className="text-2xl text-gray-500" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setOpenNotificationPopup(!openNotificationPopup)}
                    className="p-2"
                    title="Notifications"
                >
                    <LuBell className="text-2xl text-gray-500" />
                </Button>

                <Button
                    variant="ghost"
                    size="icon"
                    onClick={createProject}
                    className="p-2"
                    title="Create Project"
                >
                    <LuFile className="text-2xl text-gray-500" />
                </Button>
                {openNotificationPopup && <NotificationPopup />}
            </div>

            {openSideMenu && (
                <div className='fixed top-4 -ml-4 bg-white '>
                    <SideMenu activeMenu={activeMenu} />
                </div>
            )}
        </div>
    )
}

export default Navbar;