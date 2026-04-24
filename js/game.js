/**
 * game.js — Clase principal TabuGame
 * Responsabilidad: estado del juego y orquestación de módulos
 */

import { loadCardsFromJSON, createShuffledIndices } from './cards.js';
import { GameTimer }                                 from './timer.js';
import { translations }                              from './translations.js';
import {
    displayCards,
    addDiscardedCard,
    renderReviewSummary,
    animateCardOut,
    showGameAnimation,
    fadeToReview
} from './ui.js';

export class TabuGame {
    constructor() {
        // --- Estado ---
        this.cards              = [];
        this.shuffledIndices    = [];
        this.currentCardIndex   = 0;
        this.currentCard        = null;
        this.nextCard           = null;
        this.playedCards        = [];
        this.gameState          = 'initial'; // 'initial' | 'playing' | 'paused' | 'ending' | 'review'
        this.counters           = { correct: 0, pass: 0, total: 0 };
        this.maxPasses          = 300;
        this.isMobile           = window.innerWidth <= 768;
        this.lang               = this._detectLanguage();
        this.baseTime           = this._loadBaseTime();

        this._initElements();
        this._initTimer();
        this._bindEvents();
        this._updateUIText();
        this._updateFlag();
        this._loadCards();

        window.addEventListener('resize', () => {
            this.isMobile = window.innerWidth <= 768;
        });
    }

    /* =========================================================
       INICIALIZACIÓN
       ========================================================= */

    _initElements() {
        this.els = {
            timer:                  document.getElementById('timer'),
            initialScreen:          document.getElementById('initial-screen'),
            gameArea:               document.getElementById('game-area'),
            reviewArea:             document.getElementById('review-area'),

            start60:                document.getElementById('start-60'),
            start120:               document.getElementById('start-120'),
            pauseBtn:               document.getElementById('pause-btn'),

            currentCard:            document.getElementById('current-card'),
            nextCard:               document.getElementById('next-card'),
            cardWord:               document.getElementById('card-word'),
            cardForbidden:          document.getElementById('card-forbidden'),

            correctBtn:             document.getElementById('correct-btn'),
            passBtn:                document.getElementById('pass-btn'),
            errorBtn:               document.getElementById('error-btn'),

            discardedCardsDesktop:  document.getElementById('discarded-cards-desktop'),
            discardedCardsMobile:   document.getElementById('discarded-cards-mobile'),
            reviewSummary:          document.getElementById('review-summary'),
            reviewTitle:            document.getElementById('review-title'),

            newRound60:             document.getElementById('new-round-60'),
            newRound120:            document.getElementById('new-round-120'),

            showMap:                document.getElementById('show-map'),
            showRules:              document.getElementById('show-rules'),
            mapScreen:              document.getElementById('map-screen'),
            rulesScreen:            document.getElementById('rules-screen'),
            closeMap:               document.getElementById('close-map'),
            closeRules:             document.getElementById('close-rules'),
            downloadMapBtn:         document.getElementById('download-map-btn'),

            errorOverlay:           document.getElementById('error-overlay'),
            errorText:              document.getElementById('error-text'),
            errorClose:             document.getElementById('error-close'),

            gameErrorAnimation:     document.getElementById('game-error-animation'),
            gameTimeAnimation:      document.getElementById('game-time-animation'),
            loadingOverlay:         document.getElementById('loading-overlay'),
            rulesContentBody:       document.getElementById('rules-content-body'),

            settingsBtn:            document.getElementById('settings-btn'),
            settingsOverlay:        document.getElementById('settings-overlay'),
            closeSettings:          document.getElementById('close-settings'),
            baseTimeInput:          document.getElementById('base-time-input'),
            timeMinus:              document.getElementById('time-minus'),
            timePlus:               document.getElementById('time-plus'),
            langOptionCards:        document.querySelectorAll('.lang-option-card'),
        };
    }

    _initTimer() {
        this.timer = new GameTimer({
            displayEl: this.els.timer,
            onTimeUp:  () => this._onTimeUp(),
        });
    }

    _bindEvents() {
        // Inicio de ronda
        this.els.start60 .addEventListener('click', () => this.startRound(this.baseTime));
        this.els.start120.addEventListener('click', () => this.startRound(this.baseTime * 2));

        // Controles de juego
        this.els.pauseBtn  .addEventListener('click', () => this.togglePause());
        this.els.correctBtn.addEventListener('click', () => this._handleAction('correct'));
        this.els.passBtn   .addEventListener('click', () => this._handleAction('pass'));
        this.els.errorBtn  .addEventListener('click', () => this._handleAction('error'));

        // Pantalla de revisión
        this.els.newRound60 .addEventListener('click', () => this.startRound(this.baseTime));
        this.els.newRound120.addEventListener('click', () => this.startRound(this.baseTime * 2));

        // Mapa y reglas
        this.els.showMap   .addEventListener('click', () => this._toggleModal(this.els.mapScreen,   true));
        this.els.showRules .addEventListener('click', () => {
            this._toggleModal(this.els.rulesScreen, true);
            this._loadRules();
        });
        this.els.closeMap  .addEventListener('click', () => this._toggleModal(this.els.mapScreen,   false));
        this.els.closeRules.addEventListener('click', () => this._toggleModal(this.els.rulesScreen, false));

        // Cerrar al hacer click fuera
        this.els.mapScreen  .addEventListener('click', e => { if (e.target === this.els.mapScreen)   this._toggleModal(this.els.mapScreen,   false); });
        this.els.rulesScreen.addEventListener('click', e => { if (e.target === this.els.rulesScreen) this._toggleModal(this.els.rulesScreen, false); });

        // Descargar mapa
        this.els.downloadMapBtn.addEventListener('click', () => this._downloadMap());

        // Error overlay
        this.els.errorClose  .addEventListener('click', () => this._hideErrorOverlay());
        this.els.errorOverlay.addEventListener('click', e => { if (e.target === this.els.errorOverlay) this._hideErrorOverlay(); });

        // Atajos de teclado
        document.addEventListener('keydown', e => this._handleKeydown(e));

        // Ajustes
        this.els.settingsBtn.addEventListener('click', () => this._toggleModal(this.els.settingsOverlay, true));
        this.els.closeSettings.addEventListener('click', () => this._toggleModal(this.els.settingsOverlay, false));
        this.els.settingsOverlay.addEventListener('click', (e) => {
            if (e.target === this.els.settingsOverlay) this._toggleModal(this.els.settingsOverlay, false);
        });

        this.els.baseTimeInput.addEventListener('change', (e) => {
            let val = parseInt(e.target.value);
            if (isNaN(val)) val = 60;

            if (val < 40) val = 40;
            if (val > 300) val = 300;

            e.target.value = val;
            this.baseTime = val;
            localStorage.setItem('taboup_base_time', val);
            this._updateUIText();
        });

        this.els.timeMinus.addEventListener('click', () => this._adjustBaseTime(-5));
        this.els.timePlus .addEventListener('click', () => this._adjustBaseTime(5));

        this.els.langOptionCards.forEach(card => {
            card.addEventListener('click', () => {
                const newLang = card.getAttribute('data-lang');
                this.changeLanguage(newLang);
            });
        });
    }

    /* =========================================================
       CARGA DE CARTAS
       ========================================================= */

    async _loadCards() {
        this.els.loadingOverlay.classList.add('active');
        try {
            await new Promise(resolve => setTimeout(resolve, 400)); // feedback visual mínimo
            this.cards = await loadCardsFromJSON(`./data/json/cartas_taboup_${this.lang}.json`);
            this._reshuffleCards();
        } catch (err) {
            const errorMsg = translations[this.lang]?.error_loading_cards || 'Error loading cards';
            this._showErrorOverlay(
                `${errorMsg}:\n${err.message}\n\nVerifica que el archivo exista y tenga el formato correcto.`
            );
            console.error('Error loading cards:', err);
        } finally {
            this.els.loadingOverlay.classList.remove('active');
        }
    }

    _reshuffleCards() {
        this.shuffledIndices  = createShuffledIndices(this.cards.length);
        this.currentCardIndex = 0;
    }

    _getNextCard() {
        if (this.currentCardIndex >= this.shuffledIndices.length) {
            this._reshuffleCards();
        }
        const card = this.cards[this.shuffledIndices[this.currentCardIndex]];
        this.currentCardIndex++;
        return card;
    }

    /* =========================================================
       FLUJO DE RONDA
       ========================================================= */

    startRound(seconds) {
        if (this.cards.length === 0) {
            this._showErrorOverlay('No se han cargado las cartas del juego.\nPor favor recarga la página.');
            return;
        }

        this.gameState   = 'playing';
        this.counters    = { correct: 0, pass: 0, total: 0 };
        this.playedCards = [];

        // Resetear área de descartadas
        const dc = this._discardedContainer();
        if (dc) dc.innerHTML = '';

        this._showGameArea();

        // Cargar las dos primeras cartas
        this.currentCard = this._getNextCard();
        this.nextCard    = this._getNextCard();
        displayCards(this.currentCard, this.nextCard, this.els);

        this.timer.start(seconds);
        this._updateButtons();
    }

    _onTimeUp() {
        this.gameState = 'ending';
        this.els.correctBtn.disabled = true;
        this.els.passBtn.disabled    = true;
        this.els.errorBtn.disabled   = true;

        showGameAnimation(this.els.gameTimeAnimation);

        setTimeout(() => {
            this.els.gameTimeAnimation.classList.remove('active');
            setTimeout(() => this._endRound(), 300);
        }, 2500);
    }

    _handleAction(action) {
        if (this.gameState !== 'playing') return;
        if (action === 'pass' && this.counters.pass >= this.maxPasses) return;

        // Deshabilitar botones temporalmente
        this.els.correctBtn.disabled = true;
        this.els.passBtn.disabled    = true;
        this.els.errorBtn.disabled   = true;

        // Registrar carta jugada
        this.playedCards.push({
            word:     this.currentCard.principal,
            forbidden: this.currentCard.prohibidas,
            action,
        });

        if (action === 'correct') {
            this.counters.correct++;
            this.counters.total++;
        } else if (action === 'pass') {
            this.counters.pass++;
            this.counters.total++;
        }

        if (action === 'error') {
            showGameAnimation(this.els.gameErrorAnimation);
            setTimeout(() => this._endRound(), 2500);
            return;
        }

        // Correcto o pasar: descartar carta y avanzar
        const dc = this._discardedContainer();
        addDiscardedCard(this.currentCard, action, dc, this.isMobile);

        animateCardOut(this.els.currentCard, this.els.nextCard, () => {
            this.currentCard = this.nextCard;
            this.nextCard    = this._getNextCard();
            displayCards(this.currentCard, this.nextCard, this.els);
            setTimeout(() => this._updateButtons(), 100);
        });
    }

    _endRound() {
        this.timer.stop();
        this.gameState = 'review';

        // Transición suave al área de revisión con un pequeño delay extra para error
        const delay = this.playedCards.at(-1)?.action === 'error' ? 1500 : 800;
        setTimeout(() => {
            fadeToReview(
                this.els.gameArea,
                this.els.reviewArea,
                () => this._showReviewScreen()
            );
        }, delay);
    }

    /* =========================================================
       PAUSA
       ========================================================= */

    togglePause() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
            this.timer.stop();
            this.els.pauseBtn.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>`;
            this._updateButtons();
        } else if (this.gameState === 'paused') {
            this.gameState = 'playing';
            this.timer.resume();
            this.els.pauseBtn.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/></svg>`;
            this._updateButtons();
        }
    }

    /* =========================================================
       PANTALLAS
       ========================================================= */

    _showGameArea() {
        this.els.initialScreen.style.display = 'none';
        this.els.reviewArea.classList.remove('active');
        this.els.gameArea.style.transition = '';
        this.els.gameArea.style.opacity    = '1';
        this.els.reviewArea.style.transition = '';
        this.els.reviewArea.style.opacity    = '1';
        this.els.gameArea.classList.add('active');
        document.querySelector('.header').classList.add('active');
    }

    _showReviewScreen() {
        this.els.gameArea.classList.remove('active');
        this.els.reviewArea.classList.add('active');
        document.querySelector('.header').classList.remove('active');
        renderReviewSummary(this.counters, this.playedCards, this.els, this.lang);
    }

    _showInitialScreen() {
        this.gameState = 'initial';
        this.timer.reset();
        this.els.pauseBtn.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/></svg>`;
        this.els.gameArea.classList.remove('active');
        this.els.reviewArea.classList.remove('active');
        this.els.gameArea.style.transition = '';
        this.els.gameArea.style.opacity    = '1';
        this.els.reviewArea.style.transition = '';
        this.els.reviewArea.style.opacity    = '1';
        this.els.initialScreen.style.display = 'flex';
        document.querySelector('.header').classList.remove('active');
    }

    /* =========================================================
       BOTONES Y ATAJOS
       ========================================================= */

    _updateButtons() {
        const playing  = this.gameState === 'playing';
        const canPass  = this.counters.pass < this.maxPasses;

        this.els.correctBtn.disabled = !playing;
        this.els.passBtn.disabled    = !playing || !canPass;
        this.els.errorBtn.disabled   = !playing;
        this.els.pauseBtn.disabled   = this.gameState === 'initial';
    }

    _handleKeydown(e) {
        const mapOpen      = this.els.mapScreen.classList.contains('active');
        const rulesOpen    = this.els.rulesScreen.classList.contains('active');
        const settingsOpen = this.els.settingsOverlay.classList.contains('active');

        if (mapOpen || rulesOpen || settingsOpen) {
            if (e.code === 'Escape') {
                e.preventDefault();
                this._toggleModal(this.els.mapScreen,       false);
                this._toggleModal(this.els.rulesScreen,     false);
                this._toggleModal(this.els.settingsOverlay, false);
            }
            return;
        }

        if (this.els.errorOverlay.classList.contains('active')) {
            if (e.code === 'Enter' || e.code === 'Escape') {
                e.preventDefault();
                this._hideErrorOverlay();
            }
            return;
        }

        if (this.gameState === 'playing' || this.gameState === 'paused') {
            if (e.code === 'Space') {
                e.preventDefault();
                this.togglePause();
                return;
            }

            if (this.gameState === 'playing') {
                switch (e.code) {
                    case 'KeyX': case 'Escape':
                        e.preventDefault(); this._handleAction('error');   break;
                    case 'KeyC': case 'Enter':
                        e.preventDefault(); this._handleAction('correct'); break;
                    case 'KeyP': case 'ArrowRight':
                        e.preventDefault();
                        if (this.counters.pass < this.maxPasses) this._handleAction('pass');
                        break;
                }
            }
        }
    }

    /* =========================================================
       MODALES / HELPERS
       ========================================================= */

    _toggleModal(el, open) {
        el.classList.toggle('active', open);
    }

    _showErrorOverlay(message) {
        this.els.errorText.textContent = message;
        this.els.errorOverlay.classList.add('active');
    }

    _hideErrorOverlay() {
        this.els.errorOverlay.classList.remove('active');
    }

    _discardedContainer() {
        return this.isMobile
            ? this.els.discardedCardsMobile
            : this.els.discardedCardsDesktop;
    }

    async _downloadMap() {
        const btn          = this.els.downloadMapBtn;
        const originalText = btn.textContent;
        btn.textContent    = '⏳ Descargando...';
        btn.disabled       = true;

        try {
            const imageUrl = 'data/images/tablero_taboup.png';
            const response = await fetch(imageUrl);
            const blob     = await response.blob();
            const blobUrl  = URL.createObjectURL(blob);

            const a      = document.createElement('a');
            a.href       = blobUrl;
            a.download   = 'tablero_taboup.png';
            a.style.display = 'none';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(blobUrl);
        } catch (err) {
            console.error('Error al descargar el mapa:', err);
            this._showErrorOverlay('Error al descargar el mapa. Por favor, intenta de nuevo.');
        } finally {
            btn.textContent = originalText;
            btn.disabled    = false;
        }
    }

    /* =========================================================
       LOCALIZACIÓN
       ========================================================= */

    changeLanguage(lang) {
        if (this.lang === lang) return;
        this.lang = lang;
        localStorage.setItem('taboup_lang', lang);
        
        // Actualizar UI
        this._updateUIText();
        this._updateFlag();
        
        // Recargar datos
        this._loadCards();
        if (this.els.rulesScreen.classList.contains('active')) {
            this._loadRules();
        }

        // Si estamos en la pantalla de revisión, volver a renderizarla
        if (this.gameState === 'review') {
            this._showReviewScreen();
        }
    }

    _updateUIText() {
        const texts = translations[this.lang];
        if (!texts) return;

        document.documentElement.lang = this.lang;

        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (texts[key]) {
                let content = texts[key];
                
                // Manejar placeholders si es necesario
                if (content.includes('{}')) {
                    if (el.id === 'subtitle-60' || el.id === 'review-subtitle-60') {
                        content = content.replace('{}', this.baseTime);
                    } else if (el.id === 'subtitle-120' || el.id === 'review-subtitle-120') {
                        content = content.replace('{}', this.baseTime * 2);
                    }
                }
                
                el.textContent = content;
            }
        });

        // Actualizar estado activo en las cards de idioma
        this.els.langOptionCards.forEach(card => {
            card.classList.toggle('active', card.getAttribute('data-lang') === this.lang);
        });
        
        // Sincronizar input de tiempo
        if (this.els.baseTimeInput) {
            this.els.baseTimeInput.value = this.baseTime;
        }
    }

    _updateFlag() {
        // Método mantenido por compatibilidad, aunque ya no hay bandera fuera
    }

    _loadBaseTime() {
        const saved = localStorage.getItem('taboup_base_time');
        let val = saved ? parseInt(saved) : 60;
        if (val < 40) val = 40;
        if (val > 300) val = 300;
        return val;
    }

    async _loadRules() {
        if (this.rulesLoaded === this.lang) return;
        
        try {
            const response = await fetch(`./data/md/rules_${this.lang}.md`);
            let text = await response.text();
            
            // Procesar bloques especiales antes de pasar a marked
            text = this._parseCustomMarkdown(text);
            
            this.els.rulesContentBody.innerHTML = marked.parse(text);
            this.rulesLoaded = this.lang;
        } catch (err) {
            console.error('Error al cargar las reglas:', err);
            const errorMsg = translations[this.lang]?.error_loading_rules || 'Error loading rules.';
            this.els.rulesContentBody.innerHTML = `<p>${errorMsg}</p>`;
        }
    }

    _parseCustomMarkdown(text) {
        const alertMap = {
            'TIP':       'example-box',
            'WARNING':   'warning-box',
            'NOTE':      'shortcuts-box',
            'IMPORTANT': 'example-box',
            'CAUTION':   'prohibited-box'
        };

        return text.replace(/> \[!(.*?)\]\n(>.*(?:\n>.*)*)/g, (match, type, content) => {
            const className = alertMap[type.toUpperCase()] || 'rule-section';
            const cleanContent = content.replace(/^> /gm, '');
            // Procesamos el markdown interno antes de envolverlo en el div
            return `<div class="${className}">${marked.parse(cleanContent)}</div>`;
        });
    }

    _detectLanguage() {
        const saved = localStorage.getItem('taboup_lang');
        if (saved && ['es', 'en', 'ca'].includes(saved)) return saved;

        const supported = ['es', 'en', 'ca'];
        const navLang = navigator.language.split('-')[0];
        return supported.includes(navLang) ? navLang : 'es';
    }

    _adjustBaseTime(delta) {
        const input = this.els.baseTimeInput;
        let val = parseInt(input.value) + delta;
        const min = parseInt(input.min) || 40;
        const max = parseInt(input.max) || 300;

        if (val < min) val = min;
        if (val > max) val = max;

        input.value = val;
        input.dispatchEvent(new Event('change'));
    }
}
