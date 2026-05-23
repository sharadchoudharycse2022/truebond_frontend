


import { MdDeleteOutline, MdDownload } from 'react-icons/md'

const MessageItem = ({ message, isCurrentUser, formatTime, onDelete, isDeleting }) => {
  const renderMediaContent = (mediaFiles) => {
    if (!mediaFiles || mediaFiles.length === 0) return null

    return (
      <div className="grid gap-2 mb-2">
        {mediaFiles.map((media, index) => (
          <div key={index} className="relative group">
            {media.fileType === 'image' && (
              <img
                src={media.url}
                alt={media.fileName}
                className="max-w-xs rounded-lg max-h-64 object-cover"
              />
            )}
            {media.fileType === 'video' && (
              <video
                src={media.url}
                controls
                className="max-w-xs rounded-lg max-h-64"
              />
            )}
            {media.fileType === 'audio' && (
              <audio
                src={media.url}
                controls
                className="w-full max-w-xs"
              />
            )}
            {!['image', 'video', 'audio'].includes(media.fileType) && (
              <div className="bg-gray-200 rounded-lg p-4 max-w-xs flex items-center justify-between">
                <div className="truncate">
                  <p className="text-sm font-semibold text-gray-700">{media.fileName}</p>
                  <p className="text-xs text-gray-500">
                    {(media.size / 1024).toFixed(2)} KB
                  </p>
                </div>
                <a
                  href={media.url}
                  download={media.fileName}
                  className="ml-2 p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  title="Download"
                >
                  <MdDownload />
                </a>
              </div>
            )}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} group`}>
      <div
        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl shadow-sm relative ${
          isCurrentUser
            ? 'bg-green-500 text-white rounded-br-none'
            : 'bg-white text-gray-900 rounded-bl-none border'
        }`}
      >
        {/* Media Content */}
        {message.mediaFiles && message.mediaFiles.length > 0 && (
          renderMediaContent(message.mediaFiles)
        )}

        {/* Text Content */}
        {message.content && (
          <p className="text-sm break-words">{message.content}</p>
        )}

        {/* Message Footer */}
        <div className="flex justify-between items-center mt-1 gap-2">
          <span className="text-[10px] opacity-70">
            {formatTime(message.timestamp)}
          </span>

          {/* Message Status */}
          {isCurrentUser && (
            <span className={`text-[10px] ${message.isRead ? 'font-semibold' : 'opacity-70'}`}>
              {message.isRead ? '✓✓' : '✓'}
            </span>
          )}

          {/* Delete Message Button */}
          <button
            onClick={onDelete}
            disabled={isDeleting}
            className="opacity-0 group-hover:opacity-100 ml-2 p-1 hover:bg-red-600 rounded transition-all duration-200 disabled:opacity-50"
            title="Delete message"
          >
            <MdDeleteOutline
              size={14}
              className={isDeleting ? 'animate-spin' : ''}
            />
          </button>
        </div>
      </div>
    </div>
  )
}

export default MessageItem
