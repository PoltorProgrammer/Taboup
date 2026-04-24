/**
 * ui.js — Operaciones de renderizado del DOM
 * Responsabilidad: actualizar la pantalla sin lógica de juego
 */

import { translations } from './translations.js';

/**
 * Muestra la carta actual y la previsualización de la siguiente.
 * @param {object} currentCard
 * @param {object} nextCard
 * @param {object} els - Mapa de elementos del DOM
 */
export function displayCards(currentCard, nextCard, els) {
    if (!currentCard) return;

    // Resetear animación de salida
    els.currentCard.classList.remove('slide-out');

    // Carta actual
    els.cardWord.textContent = currentCard.principal;
    els.cardForbidden.innerHTML = '';
    currentCard.prohibidas.forEach(word => {
        const el = document.createElement('div');
        el.className = 'forbidden-word';
        el.textContent = word;
        els.cardForbidden.appendChild(el);
    });

    // Vista previa de la siguiente carta
    _showNextCardPreview(nextCard, els.nextCard);
}

function _showNextCardPreview(nextCard, nextCardEl) {
    if (!nextCard || !nextCardEl) return;

    if (!nextCardEl.querySelector('.next-card-preview')) {
        nextCardEl.innerHTML = `
            <div class="next-card-preview">
                <div class="next-card-word"></div>
                <div class="next-card-separator"></div>
                <div class="next-card-forbidden"></div>
            </div>
        `;
    }

    const wordEl      = nextCardEl.querySelector('.next-card-word');
    const forbiddenEl = nextCardEl.querySelector('.next-card-forbidden');

    if (wordEl && forbiddenEl) {
        wordEl.textContent = nextCard.principal;
        forbiddenEl.innerHTML = '';
        nextCard.prohibidas.forEach(word => {
            const el = document.createElement('div');
            el.className = 'next-forbidden-word';
            el.textContent = word;
            forbiddenEl.appendChild(el);
        });
    }
}

/**
 * Crea y añade una carta al contenedor de descartadas.
 * @param {object} card     - Carta jugada { principal, prohibidas }
 * @param {string} action   - 'correct' | 'pass' | 'error'
 * @param {HTMLElement} container
 * @param {boolean} isMobile
 */
export function addDiscardedCard(card, action, container, isMobile) {
    if (!container) return;

    const statusEmoji = { correct: '✓', pass: '→', error: '✕' };

    const forbiddenHTML = card.prohibidas
        .map(word => `<div class="discarded-forbidden-word">${word}</div>`)
        .join('');

    const discardedCard = document.createElement('div');
    discardedCard.className = `discarded-card ${action}`;
    discardedCard.innerHTML = `
        <div class="discarded-card-word">${card.principal}</div>
        <div class="discarded-card-separator"></div>
        <div class="discarded-card-forbidden">${forbiddenHTML}</div>
        <div class="discarded-card-status">${statusEmoji[action]}</div>
    `;

    if (isMobile) {
        container.appendChild(discardedCard);
        setTimeout(() => {
            container.scrollTo({ left: container.scrollWidth, behavior: 'smooth' });
        }, 100);
    } else {
        container.insertBefore(discardedCard, container.firstChild);
        container.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Límite de cartas mostradas
    const maxCards = isMobile ? 20 : 15;
    while (container.children.length > maxCards) {
        if (isMobile) {
            container.removeChild(container.firstChild);
        } else {
            container.removeChild(container.lastChild);
        }
    }
}

/**
 * Genera el HTML del resumen de la ronda y lo inserta en el DOM.
 * @param {object} counters   - { correct, pass, total }
 * @param {Array}  playedCards
 * @param {object} els        - { reviewTitle, reviewSummary }
 */
export function renderReviewSummary(counters, playedCards, els, lang) {
    const errorCards = playedCards.filter(c => c.action === 'error').length;
    const percentage = counters.total > 0
        ? Math.round((counters.correct / counters.total) * 100)
        : 0;

    const lastCard = playedCards[playedCards.length - 1];
    const isError  = lastCard && lastCard.action === 'error';
    const texts    = translations[lang] || translations.es;

    els.reviewTitle.textContent = isError ? texts.review_title_error : texts.review_title_time;
    els.reviewTitle.style.color = isError ? '#e74c3c' : '#f39c12';

    const statusText = { 
        correct: texts.acerto, 
        pass: texts.paso, 
        error: texts.error 
    };

    const cardsHTML = playedCards.map(card => {
        const forbiddenHTML = card.forbidden.map(w => `<div>${w}</div>`).join('');
        return `
            <div class="review-card ${card.action}">
                <div class="review-card-word">${card.word}</div>
                <div class="review-card-separator"></div>
                <div class="review-card-forbidden">${forbiddenHTML}</div>
                <span class="review-card-status status-${card.action}">${statusText[card.action]}</span>
            </div>
        `;
    }).join('');

    els.reviewSummary.innerHTML = `
        <div class="final-stats">
            <div class="stat-card">
                <div class="stat-value">${counters.correct}</div>
                <div class="stat-label">${texts.aciertos}</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${counters.pass}</div>
                <div class="stat-label">${texts.pases}</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${errorCards}</div>
                <div class="stat-label">${texts.errores}</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${percentage}%</div>
                <div class="stat-label">${texts.efectividad}</div>
            </div>
        </div>
        <div class="review-cards-section">
            <div class="review-cards-title">
                ${texts.cards_this_round} (${playedCards.length})
            </div>
            <div class="review-cards">${cardsHTML}</div>
        </div>
    `;
}

/**
 * Anima la carta actual saliendo de la pantalla y llama al callback al terminar.
 * @param {HTMLElement} currentCardEl
 * @param {HTMLElement} nextCardEl
 * @param {Function}    callback
 */
export function animateCardOut(currentCardEl, nextCardEl, callback) {
    currentCardEl.classList.add('slide-out');
    if (nextCardEl) nextCardEl.classList.add('moving-forward');

    setTimeout(() => {
        currentCardEl.classList.remove('slide-out');
        if (nextCardEl) nextCardEl.classList.remove('moving-forward');
        if (callback) callback();
    }, 800);
}

/**
 * Muestra la animación de error/tiempo del juego durante ms milisegundos.
 * @param {HTMLElement} animEl
 * @param {number}      [ms=2500]
 */
export function showGameAnimation(animEl, ms = 2500) {
    animEl.classList.add('active');
    setTimeout(() => animEl.classList.remove('active'), ms);
}

/**
 * Transición suave entre el área de juego y la pantalla de revisión.
 * @param {HTMLElement} gameAreaEl
 * @param {HTMLElement} reviewAreaEl
 * @param {Function}    showReviewFn - Función que activa la pantalla de revisión
 */
export function fadeToReview(gameAreaEl, reviewAreaEl, showReviewFn) {
    gameAreaEl.style.transition = 'opacity 0.5s ease-out';
    gameAreaEl.style.opacity    = '0';

    setTimeout(() => {
        showReviewFn();
        reviewAreaEl.style.opacity    = '0';
        reviewAreaEl.style.transition = 'opacity 0.5s ease-in';
        setTimeout(() => { reviewAreaEl.style.opacity = '1'; }, 50);
    }, 500);
}
