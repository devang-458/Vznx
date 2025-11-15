import React from 'react'

const InfoCard = ({ icon, label, value, color }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center">
      <div
        className={`flex items-center justify-center w-8 h-8 md:w-10 md:h-10 ${color} rounded-full`}
      >
        {icon && <span className="text-white text-lg">{icon}</span>}
      </div>

      <p className="text-xs md:text-sm text-gray-500 mt-2">{label}</p>

      <span className="text-sm md:text-[15px] text-black font-semibold">
        {value}
      </span>
    </div>
  )
}

export default InfoCard;
