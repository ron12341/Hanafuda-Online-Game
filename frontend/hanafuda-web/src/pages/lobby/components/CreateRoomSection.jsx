export default function CreateRoomSection({
  newRoomName,
  setNewRoomName,
  roomSettings,
  isCreatingRoom,
  localError,
  createRoomError,
  setShowSettings,
  setLocalError,
}) {
  return (
    <section className="rounded-lg shadow-md p-6 mb-6 bg-gray-700">
      <h2 className="text-xl font-semibold mb-4">Create New Room</h2>
      <div className="flex gap-2 mb-3">
        <input
          type="text"
          value={newRoomName}
          onChange={e => {
            setNewRoomName(e.target.value);
            setLocalError("");
          }}
          placeholder="Enter room name (min. 3 characters)"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isCreatingRoom}
          onKeyPress={e => e.key === "Enter" && setShowSettings(true)}
        />
        <button
          onClick={() => setShowSettings(true)}
          disabled={isCreatingRoom || !newRoomName.trim() || newRoomName.trim().length < 3}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isCreatingRoom ? "Creating..." : "Create Room"}
        </button>
      </div>

      <div className="text-sm text-gray-600 mb-2">
        Current settings: {roomSettings.maxPlayers} players • {roomSettings.totalRounds} rounds • {roomSettings.visibility}
      </div>

      {(localError || createRoomError) && <div className="mt-2 p-2 bg-red-100 text-red-700 rounded-md">{localError || createRoomError}</div>}
    </section>
  );
}
