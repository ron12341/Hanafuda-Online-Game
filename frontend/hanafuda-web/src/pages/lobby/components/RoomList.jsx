export default function RoomList({ rooms, isLoading, isJoiningRoom, joinRoomError, handleJoinRoom }) {
  return (
    <section className="rounded-lg shadow-md p-6 mb-6 bg-gray-700">
      <h2 className="text-xl font-semibold text-white mb-4">Available Rooms ({rooms.length})</h2>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-200">Loading rooms...</p>
        </div>
      ) : rooms.length === 0 ? (
        <p className="text-gray-200 text-center py-8">No rooms available. Create one to start playing!</p>
      ) : (
        <div className="grid gap-3">
          {rooms.map(room => (
            <div key={room.id} className="flex items-center justify-between p-4 border border-gray-400 rounded-lg">
              <div className="flex-1">
                <h3 className="font-medium text-white">{room.name}</h3>
                <p className="text-sm text-gray-300">
                  Players: {room.players?.length || 0}/{room.settings?.maxPlayers || 4} • Rounds: {room.settings?.totalRounds || 3} •
                  {room.settings?.visibility === "private" ? " 🔒 Private" : " 🌐 Public"}
                </p>
              </div>
              <button
                onClick={() => handleJoinRoom(room.id)}
                disabled={room.status === "playing" || isJoiningRoom || (room.players?.length || 0) >= (room.settings?.maxPlayers || 4)}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isJoiningRoom
                  ? "Joining..."
                  : (room.players?.length || 0) >= (room.settings?.maxPlayers || 4)
                  ? "Full"
                  : room.status === "playing"
                  ? "Playing"
                  : "Join"}
              </button>
            </div>
          ))}
        </div>
      )}

      {joinRoomError && <div className="mt-4 p-2 bg-red-100 text-red-700 rounded-md">{joinRoomError}</div>}
    </section>
  );
}
