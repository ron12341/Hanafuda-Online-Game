type CardType = "hikari" | "tane" | "tan" | "kasu";
type CardMonth = "jan" | "feb" | "mar" | "apr" | "may" | "jun" | "jul" | "aug" | "sep" | "oct" | "nov" | "dec";

export interface HanafudaCard {
  id: string;
  month: CardMonth;
  type: CardType;
  image: string;
  points: number;
  isBright?: boolean;
  isAnimal?: boolean;
  isRuboon?: boolean;
  isJunk?: boolean;
}
