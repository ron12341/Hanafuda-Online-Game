import { COMBOS } from "../../constants/combos";

const ComboDisplay = () => {
  const allCombos = Object.values(COMBOS);

  return (
    <div className="combo-display bg-gray-800 rounded-lg p-6 border border-gray-600 max-w-4xl mx-auto">
      <h3 className="text-white text-2xl font-bold mb-6 text-center">All Hanafuda Combos</h3>

      <div className="space-y-4">
        {allCombos.map(combo => (
          <div key={combo.id} className="combo-item p-4 rounded-lg border border-gray-500 bg-gray-700">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-white font-semibold text-lg">{combo.name}</h4>
              <span className="bg-yellow-600 text-white px-3 py-1 rounded text-sm font-bold">+{combo.points} pts</span>
            </div>

            <div className="flex flex-wrap gap-2 mb-2">
              {combo.cards.map(cardId => (
                <img key={cardId} src={`/cards/${cardId}.png`} alt={cardId} className="w-12 h-16 object-cover rounded border-2 border-yellow-400" />
              ))}
            </div>

            <p className="text-gray-200 text-sm">{combo.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ComboDisplay;
