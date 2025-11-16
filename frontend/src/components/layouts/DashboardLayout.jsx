import React, { useContext } from 'react'
import Navbar from './Navbar'
import { UserContext } from '../../context/userContext'
import SideMenu from './SideMenu';

const DashboardLayout = ({activeMenu, children}) => {
    const { user } = useContext(UserContext);
    return (
        <div className='h-screen overflow-hidden'>
            <Navbar activeMenu={activeMenu} />

            {user && (
                <div className='flex h-full'>
                    <div className='max-[1080px]:hidden'>
                        <SideMenu activeMenu={activeMenu} />
                    </div>

                    <div className='grow h-full overflow-y-auto pb-16'>
                        {children}
                    </div>
                </div>
            )}
        </div>
    )
}

export default DashboardLayout