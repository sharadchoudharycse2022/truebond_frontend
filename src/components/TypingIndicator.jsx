


import React from 'react'

const TypingIndicator = () => {
  return (
    <div className="flex justify-start">
      <div className="bg-white text-gray-900 rounded-2xl rounded-bl-none px-4 py-2 shadow-sm border">
        <div className="flex gap-1 items-center">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  )
}

export default TypingIndicator
