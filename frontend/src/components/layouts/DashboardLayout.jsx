import React, { useContext } from 'react'
import Navbar from './Navbar'
import { UserContext } from '../../context/userContext'
import SideMenu from './SideMenu';

const DashboardLayout = ({activeMenu, children}) => {
    const { user } = useContext(UserContext);
    return (
        <div className=''>
            {/* <Navbar activeMenu={activeMenu} /> */}

            {user && (
                <div className='flex'>
                    <div className='max-[1080px]:hidden'>
                        <SideMenu activeMenu={activeMenu} />
                    </div>

                    <div className='grow '>
                        {children}
                    </div>
                </div>
            )}
        </div>
    )
}

export default DashboardLayout