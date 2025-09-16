const Card = ({
  card,
  onClick,
  selected = false,
  size = "medium",
  cardType = "hand",
  src,
  alt,
  isDisabled = false,
  isSelectable = false,
  handCardsDisabled = false,
}) => {
  // Define size classes
  const sizeClasses = {
    large: {
      width: "w-24",
      height: "h-48",
    },
    medium: {
      width: "w-20",
      height: "h-40",
    },
    small: {
      width: "w-16",
      height: "h-32",
    },
  };

  const { width, height } = sizeClasses[size] || sizeClasses.medium;

  // Determine card type behavior
  const isHandCard = cardType === "hand";
  const isFlippedCard = cardType === "flipped" || !card;
  const isTableCard = cardType === "table";

  // Determine interactivity - hand cards are disabled when flipped card exists
  const shouldShowPointer = !isDisabled && (isHandCard || (isTableCard && isSelectable));
  const isInteractive = shouldShowPointer && onClick;

  // Handle image cards (if card exists and has image)
  if (card && src && alt) {
    return (
      <div
        className={`
          rounded-lg shadow-lg flex flex-col justify-between transition-all duration-200
          ${selected ? "ring-4 ring-yellow-400 transform -translate-y-2" : ""}
          ${shouldShowPointer ? "cursor-pointer hover:-translate-y-1" : ""}
          ${width} ${height}
          ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}
          ${isDisabled && isHandCard ? "opacity-70 cursor-not-allowed" : ""}
        `}
        onClick={isInteractive ? onClick : undefined}
      >
        <img src={src} alt={alt} className="w-full h-full object-contain rounded-md" />
      </div>
    );
  }

  // Handle empty flipped card (when card is undefined)
  if (isFlippedCard) {
    return (
      <div
        className={`
          ${width} ${height} pt-2 pb-2 ml-auto mr-auto
        `}
      >
        <div className="w-full h-full bg-gray-800 rounded-md flex items-center justify-center shadow-lg transition-all duration-200 border-2 border-dashed border-yellow-400">
          <p>Empty</p>
        </div>
      </div>
    );
  }
};

export default Card;
