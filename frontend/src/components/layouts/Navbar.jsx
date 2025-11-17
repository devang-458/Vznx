import React, { useState, useContext } from 'react';
import SideMenu from './SideMenu';
import { HiOutlineMenu, HiOutlineX } from "react-icons/hi";
import Button from './Button';
import { LuBell, LuMessageCircle, LuCirclePlus, LuListTodo, LuFile, LuSparkles } from 'react-icons/lu';
import NotificationPopup from './NotificationPopup';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../context/userContext';
import GenerateWorkflowModal from '../GenerateWorkflowModal'; // Import the modal

const Navbar = ({ activeMenu }) => {
    const [openSideMenu, setOpenSideMenu] = useState(false);
    const [openNotificationPopup, setOpenNotificationPopup] = useState(false);
    const [isWorkflowModalOpen, setIsWorkflowModalOpen] = useState(false); // State for the modal
    const navigate = useNavigate();
    const { user } = useContext(UserContext);

    const sendMessage = () => {
        navigate('/admin/messages');
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
            navigate("/admin/tasks?filter=mine");
        } else {
            navigate("/user/tasks?filter=mine");
        }
    };

    // Handle successful workflow generation
    const handleWorkflowSuccess = (newProject) => {
        setIsWorkflowModalOpen(false);
        // Navigate directly to the new project's Kanban board to see the generated tasks.
        if (newProject && newProject._id) {
            navigate(`/admin/projects/${newProject._id}/kanban`);
        } else {
            // Fallback to the project list if the new project data is not as expected
            navigate('/admin/projects');
        }
    };

    return (
        <>
            <div className='flex justify-between items-center bg-white border-b border-medium-gray py-3 px-6 sticky top-0 z-30 shadow-sm'>
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

                    <img src="/vznx.png" alt="Company Logo" className="h-10 w-auto" />
                </div>

                <div className="relative flex items-center gap-4">
                    <Button
                        variant="primary"
                        onClick={() => setIsWorkflowModalOpen(true)}
                        className="flex items-center gap-2"
                    >
                        <LuSparkles />
                        AI Workflow Generator
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleMyTasksOnly}
                        className="p-2"
                        title="My Tasks"
                    >
                        <LuListTodo className="text-2xl text-dark-gray" />
                    </Button>
                    {/* <Button
                        variant="ghost"
                        size="icon"
                        onClick={createTask}
                        className="p-2"
                        title="Create Task"
                    >
                        <LuCirclePlus className="text-2xl text-gray-500" />
                    </Button> */}
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

                    {/* <Button
                        variant="ghost"
                        size="icon"
                        onClick={createProject}
                        className="p-2"
                        title="Create Project"
                    >
                        <LuFile className="text-2xl text-gray-500" />
                    </Button> */}
                    {openNotificationPopup && <NotificationPopup />}
                </div>

                {openSideMenu && (
                    <div className='fixed top-4 -ml-4 bg-white '>
                        <SideMenu activeMenu={activeMenu} />
                    </div>
                )}
            </div>
            <GenerateWorkflowModal
                isOpen={isWorkflowModalOpen}
                onClose={() => setIsWorkflowModalOpen(false)}
                onSuccess={handleWorkflowSuccess}
            />
        </>
    )
}

export default Navbar;