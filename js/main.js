/**
 * main.js — Punto de entrada de la aplicación
 * Responsabilidad: arrancar el juego y gestionar el scroll táctil global
 */

import { TabuGame } from './game.js';

/* ---- Inicializar el juego ---- */
document.addEventListener('DOMContentLoaded', () => {
    new TabuGame();
});

/* ---- Bloquear zoom por gestos en iOS (pinch-to-zoom doble-tap) ---- */
document.addEventListener('gesturestart', e => e.preventDefault());
document.addEventListener('gesturechange', e => e.preventDefault());
document.addEventListener('gestureend', e => e.preventDefault());

/* ---- Bloquear doble-tap zoom en iOS Safari ---- */
let lastTap = 0;
document.addEventListener('touchend', e => {
    const now = Date.now();
    if (now - lastTap < 300) {
        e.preventDefault();
    }
    lastTap = now;
}, { passive: false });

/* ---- Gestión del scroll táctil ---- */
// Elementos donde se PERMITE scroll
const SCROLL_SELECTORS = [
    '.review-area',
    '.review-container',
    '.review-cards',
    '.discarded-cards',            // desktop vertical
    '.discarded-cards.horizontal', // mobile horizontal
    '.rules-screen',
    '.rules-container',
    '.rules-content',
    '.map-screen',
    '.map-container',
    '.map-content',
    '.initial-screen',             // permit scroll on very small phones
];

document.body.addEventListener('touchmove', e => {
    // Permitir scroll sólo en elementos scrollables definidos
    const allowScroll = SCROLL_SELECTORS.some(sel => e.target.closest(sel));
    if (!allowScroll) {
        e.preventDefault();
    }
}, { passive: false });
