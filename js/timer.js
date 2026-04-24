/**
 * timer.js — Lógica del temporizador
 * Responsabilidad: start, stop, display y callbacks de tiempo agotado
 */

export class GameTimer {
    /**
     * @param {object} options
     * @param {HTMLElement} options.displayEl   - Elemento donde se muestra el tiempo
     * @param {Function}   options.onTick       - Llamada en cada segundo
     * @param {Function}   options.onTimeUp     - Llamada cuando el tiempo llega a 0
     * @param {number}     [options.warningAt=30] - Segundos a partir de los que mostrar warning
     */
    constructor({ displayEl, onTick, onTimeUp, warningAt = 30 }) {
        this.displayEl = displayEl;
        this.onTick    = onTick;
        this.onTimeUp  = onTimeUp;
        this.warningAt = warningAt;

        this._interval  = null;
        this.timeLeft   = 0;
        this.isRunning  = false;
    }

    /** Inicia el temporizador con los segundos indicados */
    start(seconds) {
        this.stop();
        this.timeLeft  = seconds;
        this.isRunning = true;
        this._updateDisplay();

        this._interval = setInterval(() => {
            this.timeLeft--;
            this._updateDisplay();
            if (this.onTick) this.onTick(this.timeLeft);

            if (this.timeLeft <= 0) {
                this.stop();
                if (this.onTimeUp) this.onTimeUp();
            }
        }, 1000);
    }

    /** Reanuda el temporizador desde donde se detuvo (sin resetear timeLeft) */
    resume() {
        if (this.isRunning || this.timeLeft <= 0) return;
        this.isRunning = true;
        this._interval = setInterval(() => {
            this.timeLeft--;
            this._updateDisplay();
            if (this.onTick) this.onTick(this.timeLeft);
            if (this.timeLeft <= 0) {
                this.stop();
                if (this.onTimeUp) this.onTimeUp();
            }
        }, 1000);
    }

    /** Detiene el temporizador */
    stop() {
        if (this._interval) {
            clearInterval(this._interval);
            this._interval = null;
        }
        this.isRunning = false;
    }

    /** Actualiza el elemento DOM con el tiempo formateado */
    _updateDisplay() {
        const displayTime = Math.max(0, this.timeLeft);
        const minutes = Math.floor(displayTime / 60);
        const seconds = displayTime % 60;
        this.displayEl.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;

        if (this.timeLeft <= this.warningAt && this.timeLeft > 0) {
            this.displayEl.classList.add('warning');
        } else {
            this.displayEl.classList.remove('warning');
        }
    }

    /** Resetea el display al estado inicial */
    reset() {
        this.stop();
        this.timeLeft = 0;
        this.displayEl.textContent = '--:--';
        this.displayEl.classList.remove('warning');
    }
}
