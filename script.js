class TabuGame {
    constructor() {
        this.cards = [];
        this.currentCard = null;
        this.nextCard = null;
        this.usedCards = [];
        this.playedCards = [];
        this.gameState = 'initial';
        this.timer = null;
        this.timeLeft = 0;
        this.counters = {
            correct: 0,
            pass: 0,
            total: 0
        };
        this.maxPasses = 3;
        
        this.initializeElements();
        this.bindEvents();
        this.showLoading();
        this.loadCards();
    }

    initializeElements() {
        this.elements = {
            timer: document.getElementById('timer'),
            initialScreen: document.getElementById('initial-screen'),
            gameArea: document.getElementById('game-area'),
            reviewArea: document.getElementById('review-area'),
            
            start60: document.getElementById('start-60'),
            start120: document.getElementById('start-120'),
            pauseBtn: document.getElementById('pause-btn'),
            
            currentCard: document.getElementById('current-card'),
            nextCard: document.getElementById('next-card'),
            cardWord: document.getElementById('card-word'),
            cardForbidden: document.getElementById('card-forbidden'),
            
            correctBtn: document.getElementById('correct-btn'),
            passBtn: document.getElementById('pass-btn'),
            errorBtn: document.getElementById('error-btn'),
            
            discardedCards: document.getElementById('discarded-cards'),
            reviewSummary: document.getElementById('review-summary'),
            reviewTitle: document.getElementById('review-title'),
            
            newRound60: document.getElementById('new-round-60'),
            newRound120: document.getElementById('new-round-120'),
            
            // Nuevos elementos para mapa y reglas
            showMap: document.getElementById('show-map'),
            showRules: document.getElementById('show-rules'),
            mapScreen: document.getElementById('map-screen'),
            rulesScreen: document.getElementById('rules-screen'),
            closeMap: document.getElementById('close-map'),
            closeRules: document.getElementById('close-rules'),
            downloadMapBtn: document.getElementById('download-map-btn'),
            
            errorOverlay: document.getElementById('error-overlay'),
            errorText: document.getElementById('error-text'),
            errorClose: document.getElementById('error-close'),
            
            gameErrorAnimation: document.getElementById('game-error-animation'),
            gameTimeAnimation: document.getElementById('game-time-animation'),
            loadingOverlay: document.getElementById('loading-overlay')
        };
        
        // Verificar elementos críticos
        const criticalElements = ['gameErrorAnimation', 'gameTimeAnimation', 'errorBtn', 'gameArea', 'reviewArea'];
        criticalElements.forEach(elementKey => {
            if (!this.elements[elementKey]) {
                console.error(`❌ Elemento crítico no encontrado: ${elementKey}`);
            } else {
                console.log(`✅ Elemento encontrado: ${elementKey}`);
            }
        });
    }

    bindEvents() {
        this.elements.start60.addEventListener('click', () => this.startRound(60));
        this.elements.start120.addEventListener('click', () => this.startRound(120));
        this.elements.pauseBtn.addEventListener('click', () => this.togglePause());
        
        this.elements.correctBtn.addEventListener('click', () => this.handleAction('correct'));
        this.elements.passBtn.addEventListener('click', () => this.handleAction('pass'));
        this.elements.errorBtn.addEventListener('click', () => this.handleAction('error'));
        
        this.elements.newRound60.addEventListener('click', () => this.startRound(60));
        this.elements.newRound120.addEventListener('click', () => this.startRound(120));
        
        // Event listeners para mapa y reglas
        this.elements.showMap.addEventListener('click', () => this.showMapScreen());
        this.elements.showRules.addEventListener('click', () => this.showRulesScreen());
        this.elements.closeMap.addEventListener('click', () => this.hideMapScreen());
        this.elements.closeRules.addEventListener('click', () => this.hideRulesScreen());
        
        // Event listener para descargar mapa
        this.elements.downloadMapBtn.addEventListener('click', () => this.downloadMap());
        
        // Cerrar mapa y reglas al hacer click fuera
        this.elements.mapScreen.addEventListener('click', (e) => {
            if (e.target === this.elements.mapScreen) {
                this.hideMapScreen();
            }
        });
        
        this.elements.rulesScreen.addEventListener('click', (e) => {
            if (e.target === this.elements.rulesScreen) {
                this.hideRulesScreen();
            }
        });
        
        this.elements.errorClose.addEventListener('click', () => this.hideError());
        this.elements.errorOverlay.addEventListener('click', (e) => {
            if (e.target === this.elements.errorOverlay) {
                this.hideError();
            }
        });

        document.addEventListener('keydown', (e) => {
            // Si hay una pantalla modal abierta, manejar ESC
            if (this.elements.mapScreen.classList.contains('active') || 
                this.elements.rulesScreen.classList.contains('active')) {
                if (e.code === 'Escape') {
                    e.preventDefault();
                    this.hideMapScreen();
                    this.hideRulesScreen();
                }
                return;
            }
            
            if (this.gameState === 'playing') {
                switch(e.code) {
                    case 'KeyX':
                    case 'Escape':
                        e.preventDefault();
                        this.handleAction('error');
                        break;
                    case 'KeyC':
                    case 'Enter':
                        e.preventDefault();
                        this.handleAction('correct');
                        break;
                    case 'KeyP':
                    case 'ArrowRight':
                        e.preventDefault();
                        if (this.counters.pass < this.maxPasses) {
                            this.handleAction('pass');
                        }
                        break;
                    case 'Space':
                        e.preventDefault();
                        this.togglePause();
                        break;
                }
            } else if (this.elements.errorOverlay.classList.contains('active')) {
                if (e.code === 'Enter' || e.code === 'Escape') {
                    e.preventDefault();
                    this.hideError();
                }
            }
        });
    }

    // Nuevos métodos para mapa y reglas
    showMapScreen() {
        this.elements.mapScreen.classList.add('active');
        console.log('📍 Mostrando mapa del juego');
    }

    hideMapScreen() {
        this.elements.mapScreen.classList.remove('active');
        console.log('📍 Ocultando mapa del juego');
    }

    showRulesScreen() {
        this.elements.rulesScreen.classList.add('active');
        console.log('📋 Mostrando reglas del juego');
    }

    hideRulesScreen() {
        this.elements.rulesScreen.classList.remove('active');
        console.log('📋 Ocultando reglas del juego');
    }

    async downloadMap() {
        try {
            console.log('📥 Iniciando descarga del mapa...');
            
            // Deshabilitar botón y mostrar estado de carga
            const originalText = this.elements.downloadMapBtn.textContent;
            this.elements.downloadMapBtn.textContent = '⏳ Descargando...';
            this.elements.downloadMapBtn.disabled = true;
            
            // Crear un enlace temporal para forzar la descarga
            const imageUrl = 'https://raw.githubusercontent.com/PoltorProgrammer/Taboup/refs/heads/main/images/tablero_Taboup.png';
            
            // Fetch la imagen y convertirla a blob
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            
            // Crear URL temporal del blob
            const blobUrl = window.URL.createObjectURL(blob);
            
            // Crear enlace temporal y hacer click automáticamente
            const tempLink = document.createElement('a');
            tempLink.href = blobUrl;
            tempLink.download = 'tablero_taboup.png';
            tempLink.style.display = 'none';
            
            document.body.appendChild(tempLink);
            tempLink.click();
            document.body.removeChild(tempLink);
            
            // Limpiar el blob URL
            window.URL.revokeObjectURL(blobUrl);
            
            console.log('✅ Descarga completada');
            
            // Restaurar botón
            this.elements.downloadMapBtn.textContent = originalText;
            this.elements.downloadMapBtn.disabled = false;
            
        } catch (error) {
            console.error('❌ Error al descargar el mapa:', error);
            this.showError('Error al descargar el mapa. Por favor, intenta de nuevo.');
            
            // Restaurar botón en caso de error
            this.elements.downloadMapBtn.textContent = '💾 DESCARGAR MAPA';
            this.elements.downloadMapBtn.disabled = false;
        }
    }

    showLoading() {
        this.elements.loadingOverlay.classList.add('active');
    }

    hideLoading() {
        this.elements.loadingOverlay.classList.remove('active');
    }

    async loadCards() {
        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const response = await fetch('./data/cartas_taboup.json');
            if (!response.ok) {
                throw new Error(`Error HTTP ${response.status}: No se pudo cargar el archivo de cartas`);
            }
            
            const text = await response.text();
            this.cards = JSON.parse(text);
            
            if (!Array.isArray(this.cards) || this.cards.length === 0) {
                throw new Error('El archivo no contiene cartas válidas o está vacío');
            }
            
            for (let i = 0; i < this.cards.length; i++) {
                const card = this.cards[i];
                // Aceptar tanto "principal" como "palabra"
                const mainWord = card.principal || card.palabra;
                if (!mainWord || !Array.isArray(card.prohibidas) || card.prohibidas.length === 0) {
                    throw new Error(`Carta ${i + 1} tiene formato inválido`);
                }
                // Normalizar la estructura
                if (card.palabra && !card.principal) {
                    card.principal = card.palabra;
                }
            }
            
            this.hideLoading();
            console.log(`✓ Cargadas ${this.cards.length} cartas correctamente`);
            
        } catch (error) {
            this.hideLoading();
            this.showError(`Error al cargar las cartas:\n${error.message}\n\nVerifica que el archivo 'data/cartas_taboup.json' existe y tiene el formato correcto.`);
            console.error('Error loading cards:', error);
        }
    }

    showError(message) {
        this.elements.errorText.textContent = message;
        this.elements.errorOverlay.classList.add('active');
    }

    hideError() {
        this.elements.errorOverlay.classList.remove('active');
    }

    startRound(seconds) {
        if (this.cards.length === 0) {
            this.showError('No se han cargado las cartas del juego.\nPor favor recarga la página.');
            return;
        }

        this.gameState = 'playing';
        this.timeLeft = seconds;
        this.resetCounters();
        this.usedCards = [];
        this.playedCards = [];
        
        this.showGameArea();
        this.clearDiscardedCards();
        
        // Cargar las dos primeras cartas
        this.loadInitialCards();
        
        this.startTimer();
        this.updateButtons();
        
        console.log(`🎮 Iniciando ronda de ${seconds} segundos`);
    }

    resetCounters() {
        this.counters = {
            correct: 0,
            pass: 0,
            total: 0
        };
    }

    showGameArea() {
        this.elements.initialScreen.style.display = 'none';
        this.elements.reviewArea.classList.remove('active');
        
        // Resetear estilos de transición
        this.elements.gameArea.style.transition = '';
        this.elements.gameArea.style.opacity = '1';
        this.elements.reviewArea.style.transition = '';
        this.elements.reviewArea.style.opacity = '1';
        
        this.elements.gameArea.classList.add('active');
        
        document.querySelector('.header').classList.add('active');
    }

    showInitialScreen() {
        this.elements.gameArea.classList.remove('active');
        this.elements.reviewArea.classList.remove('active');
        
        // Resetear estilos de transición
        this.elements.gameArea.style.transition = '';
        this.elements.gameArea.style.opacity = '1';
        this.elements.reviewArea.style.transition = '';
        this.elements.reviewArea.style.opacity = '1';
        
        this.elements.initialScreen.style.display = 'flex';
        
        document.querySelector('.header').classList.remove('active');
    }

    showReviewScreen() {
        this.elements.gameArea.classList.remove('active');
        this.elements.reviewArea.classList.add('active');
        
        document.querySelector('.header').classList.remove('active');
        
        this.generateReviewSummary();
    }

    clearDiscardedCards() {
        this.elements.discardedCards.innerHTML = '';
    }

    getRandomCard() {
        if (this.usedCards.length >= this.cards.length) {
            this.usedCards = [];
            console.log('🔄 Reutilizando mazo de cartas');
        }

        const availableCards = this.cards.filter((_, index) => !this.usedCards.includes(index));
        const randomIndex = Math.floor(Math.random() * availableCards.length);
        const cardIndex = this.cards.indexOf(availableCards[randomIndex]);
        
        this.usedCards.push(cardIndex);
        return this.cards[cardIndex];
    }

    loadInitialCards() {
        // Cargar carta actual y siguiente
        this.currentCard = this.getRandomCard();
        this.nextCard = this.getRandomCard();
        
        this.displayCards();
    }

    loadNextCard() {
        // La carta siguiente se convierte en actual
        this.currentCard = this.nextCard;
        // Cargar nueva carta siguiente
        this.nextCard = this.getRandomCard();
        
        this.displayCards();
    }

    displayCards() {
        if (!this.currentCard) return;
        
        // Resetear animaciones
        this.elements.currentCard.classList.remove('slide-out');
        
        // Mostrar carta actual
        this.elements.cardWord.textContent = this.currentCard.principal;
        
        this.elements.cardForbidden.innerHTML = '';
        this.currentCard.prohibidas.forEach((word, index) => {
            const wordElement = document.createElement('div');
            wordElement.className = 'forbidden-word';
            wordElement.textContent = word;
            this.elements.cardForbidden.appendChild(wordElement);
        });

        // Mostrar preview de la siguiente carta en el fondo
        this.showNextCardPreview();
    }

    showNextCardPreview() {
        if (!this.nextCard || !this.elements.nextCard) return;
        
        // Crear estructura de la carta siguiente si no existe
        if (!this.elements.nextCard.querySelector('.next-card-preview')) {
            this.elements.nextCard.innerHTML = `
                <div class="next-card-preview">
                    <div class="next-card-word"></div>
                    <div class="next-card-separator"></div>
                    <div class="next-card-forbidden"></div>
                </div>
            `;
        }
        
        const nextWordElement = this.elements.nextCard.querySelector('.next-card-word');
        const nextForbiddenElement = this.elements.nextCard.querySelector('.next-card-forbidden');
        
        if (nextWordElement && nextForbiddenElement) {
            nextWordElement.textContent = this.nextCard.principal;
            
            nextForbiddenElement.innerHTML = '';
            this.nextCard.prohibidas.forEach((word) => {
                const wordElement = document.createElement('div');
                wordElement.className = 'next-forbidden-word';
                wordElement.textContent = word;
                nextForbiddenElement.appendChild(wordElement);
            });
        }
    }

    startTimer() {
        this.updateTimerDisplay();
        this.timer = setInterval(() => {
            this.timeLeft--;
            this.updateTimerDisplay();
            
            // Detener el timer inmediatamente cuando llegue a 0
            if (this.timeLeft <= 0) {
                console.log('⏰ Tiempo llegó a 0, deteniendo timer...');
                this.stopTimer();
                this.showTimeUpAnimation();
            }
        }, 1000);
    }

    showTimeUpAnimation() {
        console.log('⏰ ¡TIEMPO AGOTADO! Ejecutando secuencia...');
        console.log('⏰ Estado del timer:', this.timer ? 'activo' : 'detenido');
        console.log('⏰ Tiempo restante:', this.timeLeft);
        
        // Cambiar estado del juego inmediatamente
        this.gameState = 'ending';
        
        // Deshabilitar botones
        this.elements.correctBtn.disabled = true;
        this.elements.passBtn.disabled = true;
        this.elements.errorBtn.disabled = true;
        
        // Mostrar animación de TIEMPO
        if (this.elements.gameTimeAnimation) {
            console.log('⏰ Mostrando animación ¡TIEMPO!...');
            this.elements.gameTimeAnimation.classList.add('active');
            
            // Verificar que la animación esté funcionando
            setTimeout(() => {
                const hasActive = this.elements.gameTimeAnimation.classList.contains('active');
                const computedStyle = window.getComputedStyle(this.elements.gameTimeAnimation);
                console.log('⏰ Animación activa:', hasActive);
                console.log('⏰ Display:', computedStyle.display);
                console.log('⏰ Z-index:', computedStyle.zIndex);
                console.log('⏰ Opacity:', computedStyle.opacity);
            }, 100);
        } else {
            console.error('⏰ ERROR: Elemento gameTimeAnimation no encontrado!');
        }
        
        // Después de 2.5 segundos, quitar animación y ir a revisión
        setTimeout(() => {
            console.log('⏰ Terminando animación de tiempo...');
            if (this.elements.gameTimeAnimation) {
                this.elements.gameTimeAnimation.classList.remove('active');
            }
            
            // Ir a pantalla de revisión
            setTimeout(() => {
                console.log('⏰ Ir a pantalla de revisión...');
                this.endRound('time');
            }, 300);
            
        }, 2500);
    }

    stopTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    togglePause() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
            this.stopTimer();
            this.elements.pauseBtn.innerHTML = `
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z"/>
                </svg>
            `;
            this.updateButtons();
            console.log('⏸️ Juego pausado');
        } else if (this.gameState === 'paused') {
            this.gameState = 'playing';
            this.startTimer();
            this.elements.pauseBtn.innerHTML = `
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                </svg>
            `;
            this.updateButtons();
            console.log('▶️ Juego reanudado');
        }
    }

    handleAction(action) {
        if (this.gameState !== 'playing') return;
        
        if (action === 'pass' && this.counters.pass >= this.maxPasses) {
            console.log('❌ No se pueden hacer más pases');
            return;
        }
        
        // Deshabilitar botones temporalmente
        this.elements.correctBtn.disabled = true;
        this.elements.passBtn.disabled = true;
        this.elements.errorBtn.disabled = true;
        
        // Registrar la carta jugada
        this.playedCards.push({
            word: this.currentCard.principal,
            forbidden: this.currentCard.prohibidas,
            action: action
        });

        if (action === 'correct') {
            this.counters.correct++;
            this.counters.total++;
        } else if (action === 'pass') {
            this.counters.pass++;
            this.counters.total++;
        }
        
        console.log(`${action.toUpperCase()}: ${this.currentCard.principal}`);
        
        // Crear carta descartada inmediatamente
        this.addDiscardedCard(action);
        
        // Si es error, mostrar animación y terminar ronda
        if (action === 'error') {
            this.showErrorAnimation();
            this.animateCardOut(() => {
                // Esperar a que termine la animación de error antes de ir a revisión
                setTimeout(() => {
                    this.endRound('error');
                }, 1000);
            });
            return;
        }
        
        // Para correcto y pasar, avanzar a la siguiente carta
        this.animateCardOut(() => {
            this.loadNextCard();
            setTimeout(() => {
                this.updateButtons();
            }, 100);
        });
    }

    animateCardOut(callback) {
        // Animar carta actual saliendo
        this.elements.currentCard.classList.add('slide-out');
        
        // Animar carta siguiente moviéndose hacia adelante
        if (this.elements.nextCard) {
            this.elements.nextCard.classList.add('moving-forward');
        }
        
        setTimeout(() => {
            this.elements.currentCard.classList.remove('slide-out');
            if (this.elements.nextCard) {
                this.elements.nextCard.classList.remove('moving-forward');
            }
            if (callback) callback();
        }, 800);
    }

    addDiscardedCard(action) {
        const discardedCard = document.createElement('div');
        discardedCard.className = `discarded-card ${action}`;
        
        const statusEmoji = {
            correct: '✓',
            pass: '→',
            error: '✕'
        };
        
        const forbiddenWordsHTML = this.currentCard.prohibidas
            .map(word => `<div class="discarded-forbidden-word">${word}</div>`)
            .join('');
        
        discardedCard.innerHTML = `
            <div class="discarded-card-word">${this.currentCard.principal}</div>
            <div class="discarded-card-separator"></div>
            <div class="discarded-card-forbidden">${forbiddenWordsHTML}</div>
            <div class="discarded-card-status">${statusEmoji[action]}</div>
        `;
        
        this.elements.discardedCards.insertBefore(discardedCard, this.elements.discardedCards.firstChild);
        
        while (this.elements.discardedCards.children.length > 15) {
            this.elements.discardedCards.removeChild(this.elements.discardedCards.lastChild);
        }
        
        this.elements.discardedCards.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    updateTimerDisplay() {
        // Asegurar que no muestre números negativos
        const displayTime = Math.max(0, this.timeLeft);
        const minutes = Math.floor(displayTime / 60);
        const seconds = displayTime % 60;
        this.elements.timer.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        if (this.timeLeft <= 30 && this.timeLeft > 0) {
            this.elements.timer.classList.add('warning');
        } else {
            this.elements.timer.classList.remove('warning');
        }
    }

    updateButtons() {
        const isPlaying = this.gameState === 'playing';
        const canPass = this.counters.pass < this.maxPasses;
        
        this.elements.correctBtn.disabled = !isPlaying;
        this.elements.passBtn.disabled = !isPlaying || !canPass;
        this.elements.errorBtn.disabled = !isPlaying;
        this.elements.pauseBtn.disabled = this.gameState === 'initial';
        
        console.log(`Buttons update: playing=${isPlaying}, canPass=${canPass}, passes=${this.counters.pass}/${this.maxPasses}`);
    }

    showErrorAnimation() {
        this.elements.gameErrorAnimation.classList.add('active');
        
        // Quitar la animación después de que termine
        setTimeout(() => {
            this.elements.gameErrorAnimation.classList.remove('active');
        }, 2500);
    }

    endRound(reason) {
        this.stopTimer();
        this.gameState = 'review';
        
        const endMessages = {
            time: '⏰ Tiempo agotado',
            error: '❌ Ronda terminada por ERROR'
        };
        
        console.log(`🏁 ${endMessages[reason]}`);
        
        // Transición más suave con fade
        if (reason === 'error') {
            // Para error, esperar más tiempo después de la animación
            setTimeout(() => {
                this.fadeToReviewScreen();
            }, 1500);
        } else {
            // Para tiempo agotado, transición normal pero suave
            setTimeout(() => {
                this.fadeToReviewScreen();
            }, 800);
        }
    }

    fadeToReviewScreen() {
        // Crear efecto fade out en el área de juego
        this.elements.gameArea.style.transition = 'opacity 0.5s ease-out';
        this.elements.gameArea.style.opacity = '0';
        
        setTimeout(() => {
            this.showReviewScreen();
            
            // Fade in de la pantalla de revisión
            this.elements.reviewArea.style.opacity = '0';
            this.elements.reviewArea.style.transition = 'opacity 0.5s ease-in';
            
            setTimeout(() => {
                this.elements.reviewArea.style.opacity = '1';
            }, 50);
            
        }, 500);
    }

    generateReviewSummary() {
        const total = this.counters.total;
        const errorCards = this.playedCards.filter(card => card.action === 'error').length;
        const percentage = total > 0 ? Math.round((this.counters.correct / total) * 100) : 0;
        
        let endReason = '';
        let titleColor = '#f39c12';
        const lastCard = this.playedCards[this.playedCards.length - 1];
        
        if (lastCard && lastCard.action === 'error') {
            endReason = '❌ Ronda terminada por ERROR';
            titleColor = '#e74c3c';
        } else {
            endReason = '⏰ Tiempo agotado';
            titleColor = '#f39c12';
        }
        
        this.elements.reviewTitle.textContent = endReason;
        this.elements.reviewTitle.style.color = titleColor;
        
        this.elements.reviewSummary.innerHTML = `
            <div class="final-stats">
                <div class="stat-card">
                    <div class="stat-value">${this.counters.correct}</div>
                    <div class="stat-label">ACIERTOS</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${this.counters.pass}</div>
                    <div class="stat-label">PASES</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${errorCards}</div>
                    <div class="stat-label">ERRORES</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${percentage}%</div>
                    <div class="stat-label">EFECTIVIDAD</div>
                </div>
            </div>
            
            <div class="review-cards-section">
                <div class="review-cards-title">
                    📚 Cartas de esta ronda (${this.playedCards.length})
                </div>
                <div class="review-cards">
                    ${this.playedCards.map(card => {
                        const statusText = {
                            correct: 'ACERTÓ',
                            pass: 'PASÓ',
                            error: 'ERROR'
                        };
                        
                        const forbiddenHTML = card.forbidden
                            .map(word => `<div>${word}</div>`)
                            .join('');
                        
                        return `
                            <div class="review-card ${card.action}">
                                <div class="review-card-word">${card.word}</div>
                                <div class="review-card-separator"></div>
                                <div class="review-card-forbidden">${forbiddenHTML}</div>
                                <span class="review-card-status status-${card.action}">${statusText[card.action]}</span>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }

    finishRound() {
        this.gameState = 'initial';
        this.elements.timer.textContent = '--:--';
        this.elements.timer.classList.remove('warning');
        this.elements.pauseBtn.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
            </svg>
        `;
        this.showInitialScreen();
        console.log('🏠 Volviendo al menú principal');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('🎯 Inicializando juego de Tabú...');
    new TabuGame();
});

document.addEventListener('gesturestart', function (e) {
    e.preventDefault();
});

document.body.addEventListener('touchmove', function (e) {
    e.preventDefault();
}, { passive: false });