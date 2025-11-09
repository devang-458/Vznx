import React, { useContext, useEffect, useState } from 'react';
import { UserContext } from '../../context/userContext';
import { useNavigate } from 'react-router-dom';
import { SIDE_MENU_DATA, SIDE_MENU_USER_DATA } from '../../utils/data';

const SideMenu = ({ activeMenu }) => {
  const { user, clearUser } = useContext(UserContext);
  const [sideMenuData, setSideMenuData] = useState([]);
  const navigate = useNavigate();

  const handleClick = (route) => {
    if (route === 'logout') {
      handleLogout();
      return;
    }
    navigate(route);
  };

  const handleLogout = () => {
    localStorage.clear();
    clearUser();
    navigate('/login');
  };

  useEffect(() => {
    if (user) {
      setSideMenuData(user.role === 'admin' ? SIDE_MENU_DATA : SIDE_MENU_USER_DATA);
    }
  }, [user]);

  return (
    <div className="w-64 h-[calc(100vh-61px)] bg-white border-r border-gray-200/50 sticky top-16 z-20">
      {/* Profile Section */}
      <div className="flex flex-col items-center justify-center mb-7 pt-5">
        <div className="relative ">
          <img
            src={user?.profileImageUrl || '/default-avatar.png'}
            alt="Profile"
            className="w-20 h-20  bg-slate-400 rounded-full object-cover"
          />
        </div>

        {user?.role === 'admin' && (
          <div className="text-xs font-medium text-white bg-primary px-3 py-0.5 rounded mt-1">
            Admin
          </div>
        )}

        <h5 className="text-gray-950 text-lg font-medium leading-6 mt-3">
          {user?.name || ''}
        </h5>
        <p className="text-xs text-gray-500">{user?.email || ''}</p>
      </div>

      {/* Menu Items */}
      <div className="flex flex-col">
        {sideMenuData.map((item, index) => {
          const Icon = item.icons; 
          return (
            <button
              key={item.id || index}
              onClick={() => handleClick(item.path)}
              className={`w-full flex items-center gap-4 text-md font-semibold py-3 px-6 mb-1 transition-colors duration-200
                ${activeMenu === item.label
                  ? 'text-primary bg-linear-to-r from-blue-50/40 to-blue-100/50 border-r-4 border-primary'
                  : 'text-gray-700 hover:bg-blue-50/40 hover:text-primary'
                }`}
            >
              {Icon ? <Icon className="text-xl" /> : null}
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SideMenu;
