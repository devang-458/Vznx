import React, { useState } from 'react';
import SideMenu from './SideMenu';
import { HiOutlineMenu, HiOutlineX } from "react-icons/hi";
import Button from './Button';
import { LuBell } from 'react-icons/lu';
import NotificationPopup from './NotificationPopup';

const Navbar = ({ activeMenu }) => {
    const [openSideMenu, setOpenSideMenu] = useState(false);
    const [openNotificationPopup, setOpenNotificationPopup] = useState(false);

    return (
        <div className='flex justify-between items-center bg-white border-b border-gray-200/50 backdrop-blur-[2px] py-4 px-7 sticky top-0 z-30'>
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

            <div className="relative">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setOpenNotificationPopup(!openNotificationPopup)}
                >
                    <LuBell className="text-2xl text-gray-500" />
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