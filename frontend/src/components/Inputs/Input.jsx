import React, { useState } from 'react';
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa6";

const Input = ({ value, onChange, label, placeholder, type, className }) => {
  const [showPassword, setShowPassword] = useState(false);

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  }

  return (
    <div className={`w-full mt-2 ${className}`}>
      {label && <label className='text-[13px] text-slate-800 font-stack mb-1 block'>{label}</label>}
      <div className='relative w-full '>
        <input
          type={type === "password" ? (showPassword ? "text" : "password") : type}
          placeholder={placeholder}
          className='w-full pr-10 bg-transparent border border-slate-300 rounded-md px-3 py-2 outline-none focus:border-primary text-slate-900'
          value={value}
          onChange={onChange}
        />
        {type === "password" && (
          <div className='absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer'>
            {showPassword ? (
              <FaRegEye size={20} className='text-primary' onClick={toggleShowPassword} />
            ) : (
              <FaRegEyeSlash size={20} className='text-slate-400' onClick={toggleShowPassword} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Input;
