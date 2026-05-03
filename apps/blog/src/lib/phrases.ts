// This are burn it phrases until add to the db

export const phrases: Record<string, string> = {
  "Gabriel García Márquez":
    "La vida no es la que uno vivió, sino la que uno recuerda y cómo la recuerda para contarla.",
  "José Asunción Silva":
    "Las cosas viejas, tristes, desteñidas, sin voz y sin color, saben secretos de las épocas muertas.",
  "Jaime Garzón":
    "Si ustedes los jóvenes no asumen la dirección de su propio país, nadie va a venir a salvárselo. ¡Nadie!",
  "Mary Shelley":
    "Ten cuidado; pues no conozco el miedo y soy, por tanto, poderoso.",
  "Alejandra Pizarnik":
    "La rebelión consiste en mirar una rosa hasta pulverizarse los ojos.",
  "Albert Camus":
    "En las profundidades del invierno finalmente aprendí que había en mí un verano invencible.",
  "Julio Cortázar":
    "Andábamos sin buscarnos, pero sabiendo que andábamos para encontrarnos.",
};

export function getRandomPhrase() {
  const authors = Object.keys(phrases);
  const randomIndex = Math.floor(Math.random() * authors.length);
  const author = authors[randomIndex];

  return {
    author,
    phrase: phrases[author],
  };
}
