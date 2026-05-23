

import React from 'react'

const UserStatusIndicator = ({ isOnline, lastSeen, formatLastSeen }) => {
  return (
    <div className="flex items-center gap-1">
      <div
        className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`}
      />
      <span className="text-xs text-gray-600">
        {isOnline ? 'Online' : `Last seen ${formatLastSeen(lastSeen)}`}
      </span>
    </div>
  )
}

export default UserStatusIndicator
