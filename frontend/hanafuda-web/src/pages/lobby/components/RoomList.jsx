export default function RoomList({ rooms, isLoading, isJoiningRoom, joinRoomError, handleJoinRoom, handleRefresh }) {
  return (
    <section className="rounded-lg shadow-md p-6 mb-6 bg-gray-700">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Available Rooms ({rooms.length})</h2>
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50"
        >
          {isLoading ? "Refreshing..." : "↻ Refresh"}
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading rooms...</p>
        </div>
      ) : rooms.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No rooms available. Create one to start playing!</p>
      ) : (
        <div className="grid gap-3">
          {rooms.map(room => (
            <div key={room.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex-1">
                <h3 className="font-medium">{room.name}</h3>
                <p className="text-sm text-gray-600">
                  Players: {room.players?.length || 0}/{room.settings?.maxPlayers || 4} • Rounds: {room.settings?.totalRounds || 3} •
                  {room.settings?.visibility === "private" ? " 🔒 Private" : " 🌐 Public"}
                </p>
              </div>
              <button
                onClick={() => handleJoinRoom(room.id)}
                disabled={isJoiningRoom || (room.players?.length || 0) >= (room.settings?.maxPlayers || 4)}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isJoiningRoom ? "Joining..." : (room.players?.length || 0) >= (room.settings?.maxPlayers || 4) ? "Full" : "Join"}
              </button>
            </div>
          ))}
        </div>
      )}

      {joinRoomError && <div className="mt-4 p-2 bg-red-100 text-red-700 rounded-md">{joinRoomError}</div>}
    </section>
  );
}
