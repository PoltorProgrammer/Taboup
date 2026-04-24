/**
 * cards.js — Carga y barajado de cartas
 * Responsabilidad: fetch del JSON, validación, Fisher-Yates shuffle
 */

/**
 * Carga las cartas desde el archivo JSON y las valida.
 * @param {string} url - Ruta al archivo JSON
 * @returns {Promise<Array>} - Array de cartas validadas
 */
export async function loadCardsFromJSON(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Error HTTP ${response.status}: No se pudo cargar el archivo de cartas`);
    }

    const text = await response.text();
    const cards = JSON.parse(text);

    if (!Array.isArray(cards) || cards.length === 0) {
        throw new Error('El archivo no contiene cartas válidas o está vacío');
    }

    cards.forEach((card, i) => {
        // Aceptar tanto "principal" como "palabra"
        const mainWord = card.principal || card.palabra;
        if (!mainWord || !Array.isArray(card.prohibidas) || card.prohibidas.length === 0) {
            throw new Error(`Carta ${i + 1} tiene formato inválido`);
        }
        // Normalizar la estructura
        if (card.palabra && !card.principal) {
            card.principal = card.palabra;
        }
    });

    return cards;
}

/**
 * Genera una lista de índices barajados usando el algoritmo Fisher-Yates.
 * @param {number} length - Número de cartas
 * @returns {number[]} - Array de índices aleatorios
 */
export function createShuffledIndices(length) {
    const indices = Array.from({ length }, (_, i) => i);

    for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
    }

    return indices;
}
