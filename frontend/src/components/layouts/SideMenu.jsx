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
    <div className="w-64  bg-white border-r border-gray-200/50 sticky top-0 z-20 flex flex-col">
      {/* Profile Section */}
      <div className="flex-row justify-evenly items-center mb-7 mx-4 pt-5 shrink-0 flex ">
        <div className="relative">
          <img
            src={user[0]?.profileImageUrl ? user.profileImageUrl : image}
            alt="Profile"
            className="w-20 h-20  bg-slate-400 rounded-full object-cover"
          />
        </div>

        <div>
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
      </div>

      {/* Menu Items - Scrollable */}
      <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden pr-2 pb-14  scroll-smooth max-h-[calc(100vh-150px)]">
        {sideMenuData.map((item, index) => {
          const Icon = item.icons;
          return (
            <button
              key={item.id || index}
              onClick={() => handleClick(item.path)}
              className={`w-full flex items-center gap-4 text-md font-semibold py-3 px-6 mb-1 transition-colors duration-200 shrink-0
                ${activeMenu === item.label
                  ? 'text-blueprint-blue bg-light-gray border-r-4 border-blueprint-blue'
                  : 'text-dark-gray hover:bg-light-gray hover:text-blueprint-blue'
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
