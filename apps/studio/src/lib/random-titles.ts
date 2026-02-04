/**
 * Fun random titles for auto-saving documents
 * Used when a user leaves the editor with unsaved content
 */

const RANDOM_TITLES = [
  "naguara",
  "recoleto",
  "pamitaita",
  "tachimbita",
  "omeavemaria",
  "sipotevaina",
  "k-embeleco",
  "nanaycucas",
  "el-diavlo",
  "pasumerce",
  "chichipato",
  "k-desparche",
  "tons-k-pelao",
] as const;

/**
 * Returns a random title from the RANDOM_TITLES array
 */
export function getRandomTitle(): string {
  const randomIndex = Math.floor(Math.random() * RANDOM_TITLES.length);
  const title = RANDOM_TITLES[randomIndex];
  return title ?? RANDOM_TITLES[0];
}

type RandomTitle = (typeof RANDOM_TITLES)[number];

/**
 * Type guard to check if a string is a valid random title
 */
export function isRandomTitle(title: string): title is RandomTitle {
  return RANDOM_TITLES.includes(title as RandomTitle);
}

export type { RandomTitle };

export { RANDOM_TITLES };
