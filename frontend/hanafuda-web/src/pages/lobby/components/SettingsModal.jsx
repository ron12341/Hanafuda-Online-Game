export default function SettingsModal({ showSettings, setShowSettings, roomSettings, handleSettingsChange, handleCreateRoom }) {
  if (!showSettings) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96">
        <h3 className="text-xl font-semibold mb-4">Room Settings</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Max Players</label>
            <select
              value={roomSettings.maxPlayers}
              onChange={e => handleSettingsChange("maxPlayers", parseInt(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value={2}>2 Players</option>
              <option value={3}>3 Players</option>
              <option value={4}>4 Players</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Total Rounds</label>
            <select
              value={roomSettings.totalRounds}
              onChange={e => handleSettingsChange("totalRounds", parseInt(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              {Array.from({ length: 10 }, (_, index) => index + 1).map(rounds => (
                <option key={rounds} value={rounds}>
                  {rounds} Rounds
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Visibility</label>
            <select
              value={roomSettings.visibility}
              onChange={e => handleSettingsChange("visibility", e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
          </div>

          {roomSettings.visibility === "private" && (
            <div>
              <label className="block text-sm font-medium mb-1">Password (Optional)</label>
              <input
                type="password"
                value={roomSettings.password}
                onChange={e => handleSettingsChange("password", e.target.value)}
                placeholder="Enter password"
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
          )}
        </div>

        <div className="flex gap-2 mt-6">
          <button onClick={() => setShowSettings(false)} className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400">
            Cancel
          </button>
          <button
            onClick={() => {
              setShowSettings(false);
              handleCreateRoom();
            }}
            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Create Room
          </button>
        </div>
      </div>
    </div>
  );
}
