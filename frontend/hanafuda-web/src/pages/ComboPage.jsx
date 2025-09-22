import ComboDisplay from "./components/ComboDisplay";

export default function ComboPage() {
  return (
    <ComboDisplay
      playerCards={[]} // Empty to show all combos
      size="medium"
      showPoints={true}
      showDescription={true}
    />
  );
}
