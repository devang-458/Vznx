import React, { useContext, useEffect, useState } from 'react';
import { UserContext } from '../../context/userContext';
import { useNavigate } from 'react-router-dom';
import { SIDE_MENU_DATA, SIDE_MENU_USER_DATA } from '../../utils/data';
import image from "../../assets/images/user.png";

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
    <div className="w-64 bg-white border-r border-slate-100 h-full flex flex-col pt-8">
      {/* Profile Section */}
      <div className="flex items-center gap-4 px-6 mb-10">
        <div className="relative">
          <img
            src={user?.profileImageUrl || image}
            alt="Profile"
            className="w-14 h-14 rounded-2xl object-cover shadow-sm"
          />
        </div>

        <div className="overflow-hidden">
          <h5 className="text-slate-900 font-bold text-sm truncate">
            {user?.name || 'User'}
          </h5>
          <p className="text-xs text-slate-400 font-medium truncate">{user?.role || 'Member'}</p>
        </div>
      </div>

      {/* Menu Items */}
      <div className="flex flex-col flex-1 px-4 space-y-1">
        {sideMenuData.map((item, index) => {
          const Icon = item.icons;
          const isActive = activeMenu === item.label;
          return (
            <button
              key={item.id || index}
              onClick={() => handleClick(item.path)}
              className={`w-full flex items-center gap-3.5 text-sm font-semibold py-3 px-4 rounded-xl transition-all duration-200
                ${isActive
                  ? 'text-blue-600 bg-blue-50/50'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
            >
              {Icon && <Icon className={`text-lg ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />}
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SideMenu;
