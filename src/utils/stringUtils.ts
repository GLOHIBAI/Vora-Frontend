/**
 * Capitalizes the first letter of each word in a string (e.g. for names).
 * Handles spaces and hyphens (e.g. "kolawole" -> "Kolawole", "micheal jordan" -> "Micheal Jordan", "mary-jane" -> "Mary-Jane").
 */
export const capitalizeWords = (str: string): string => {
  if (!str) return str;
  return str.replace(/(^|[\s\-])(\p{L})/gu, (_, sep, char) => sep + char.toUpperCase());
};

/**
 * Capitalizes the first letter of a string or each word.
 */
export const capitalizeFirstLetter = (str: string): string => {
  if (!str) return str;
  return capitalizeWords(str);
};

export const capitalizeName = (val: unknown): string => {
  if (!val || typeof val !== 'string') return '';
  return capitalizeWords(val);
};

