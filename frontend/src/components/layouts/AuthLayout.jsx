import React from 'react'

const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <img src="/vznx.png" alt="Company Logo" className="h-12 w-auto" />
        </div>
        
        <div className="card bg-white p-8 md:p-10">
          {children}
        </div>
      </div>
    </div>
  )
}

export default AuthLayout
