// import { HanafudaCard } from "@game-server/src/interfaces/hanafuda";

// /**
//  * Randomly shuffles the given array of Hanafuda cards. This function does not
//  * check the contents of the array before shuffling, so it is safe to call with
//  * an empty array.
//  *
//  * @param cards The array of Hanafuda cards to be shuffled.
//  * @returns A new array with the same elements as the original, but in a
//  *          random order.
//  */
// export function shuffle(cards: HanafudaCard[]): HanafudaCard[] {
//   const shuffled = [...cards];

//   for (let i = shuffled.length - 1; i > 0; i--) {
//     const j = Math.floor(Math.random() * (i + 1));
//     [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
//   }

//   return shuffled;
// }
