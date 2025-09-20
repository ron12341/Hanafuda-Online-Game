export default function OnlinePlayersList({ waitingPlayers, playerId }) {
  return (
    <section className="rounded-lg shadow-md p-6 bg-gray-700">
      <h2 className="text-white text-xl font-semibold mb-4">Online Players ({waitingPlayers.length})</h2>

      {waitingPlayers.length === 0 ? (
        <p className="text-gray-200 text-center py-4">No players online</p>
      ) : (
        <div className="grid gap-2">
          {waitingPlayers.map(player => (
            <div
              key={player.id}
              className={`flex items-center p-3 rounded-md ${player.id === playerId ? "bg-blue-50 border border-blue-200" : "bg-gray-50"}`}
            >
              <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
              <span className="font-medium">
                {player.name} {player.id === playerId && "(You)"}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
