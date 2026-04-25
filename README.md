
# Taboup — Reglas del juego

**Taboup** es un party game por equipos inspirado en el clásico *Tabú*, con tablero imprimible y una plataforma digital que gestiona las cartas, el tiempo y el control de turnos.  
Esta es la **versión completa y detallada de las reglas**, con todas las prohibiciones, roles y mecánicas.

---

## 📦 Contenido y componentes

- **Plataforma digital** (en este repositorio):
  - Muestra una carta a la vez con:
    - **Palabra objetivo** (la que tu equipo debe adivinar)
    - **Palabras prohibidas** (que no puedes decir ni usar raíces derivadas)
  - Botones disponibles:
    - **Correcto** → suma un acierto.
    - **Pasar** → permite saltar una carta (máx. 1 por ronda).
    - **Error** → termina la ronda inmediatamente por infracción.
- **Cartas**: generadas por la plataforma.
- **Tablero**: imprimible (disponible en la carpeta `/tablero`) o dibujable a mano.
- **Cronómetro**: integrado (60 s o 120 s según casilla).
- **Fichas o marcadores**: 1 por equipo para avanzar casillas.

---

## 🎯 Objetivo

Adivinar el mayor número posible de cartas **sin infringir las reglas** y avanzar en el tablero hasta alcanzar la meta.

---

## 👥 Equipos, jugadores y disposición

- **Dos equipos**: Equipo A y Equipo B.
- Recomendado: **número par** de jugadores (4, 6, 8…).
- Si el número es **impar**:
  - Usar un **adivinador neutral** que no pertenece a ningún equipo y actúa siempre.
  - O usar un comodín que rota, aunque complica el conteo.

### Patrón de asientos

Sentados **en círculo**, alternando jugador de un equipo y del otro:  
**A - B - A - B - …**  

Ejemplo (6 jugadores):  
```
A1 - B1 - A2 - B2 - A3 - B3
```

> Esto garantiza que las **personas a tu izquierda y derecha** nunca sean de tu equipo, por lo que actúan como **árbitros laterales**.

---

## 🔁 Orden de turnos y rotación

- El **móvil** (o la plataforma) rota **siempre en sentido anti-horario**.
- Esto significa que **juega la persona a tu derecha** después de ti.
- Ejemplo con 6 jugadores:
  - Turno 1: A1 (da pistas a Equipo A) → siguiente: B1 (a su derecha)
  - Turno 2: B1 (Equipo B) → siguiente: A2
  - Y así sucesivamente: A-B-A-B…

---

## 🧩 Roles en un turno

En cada turno intervienen:

1. **Quien da pistas** (jugador activo del equipo correspondiente).
2. **Quienes adivinan** (los compañeros de equipo del que da pistas).
3. **Árbitros laterales**: las dos personas sentadas a izquierda y derecha del que da pistas (no son de su equipo).  
   - Vigilan el cumplimiento de reglas.
   - Si detectan infracción → pueden pulsar el botón **Error** o avisar para que lo pulse el dador de pistas.

---

## ⏱️ Rondas, tiempo y finalización

- **Duración estándar**: 60 s o 120 s (depende de la casilla en el tablero).
- Durante la ronda:
  - **Correcto** → cuenta una carta como acertada.
  - **Pasar** → permite saltar la carta; máx. **3 por ronda**.
  - **Error** → se pulsa si el jugador dice una palabra prohibida, usa una raíz prohibida, marca sílabas, hace gestos, traduce, o comete cualquier infracción.  
    Al pulsarlo, la ronda **termina inmediatamente**, **incluso si es una ronda con tiempo doble**.

- La ronda termina cuando:
  - **Se acaba el tiempo**, o
  - **Se pulsa “Error”** por infracción (**siempre final inmediato**, incluso con tiempo doble).

Tras terminar, el móvil pasa a la persona de tu **derecha** y empieza el turno del **otro equipo**.

---

## 🎲 El tablero

- **Avance normal**: 1 carta correcta = 1 casilla.
- **Casillas especiales**:
  1. **Reloj** ⏱ → la siguiente ronda de ese equipo dura **el doble de tiempo**.
  2. **Morada** 🟪 → en esa ronda, cada **3 cartas correctas = 1 casilla**.  
     No se acumulan entre rondas y la regla entra en vigor al estar dentro de la zona morada.

- **Estrategia común**: aprovechar un **doble tiempo** justo antes de entrar en zona morada para maximizar el avance.

---

## 🗣️ Reglas de comunicación

**Prohibido:**
- Decir **palabras prohibidas** de la carta o cualquier derivado/raíz.
  - Ej.: si la palabra objetivo es *hablar*, no puedes decir *hablante*, *hablador*, *hablaba*.
- **Marcar sílabas** de la palabra objetivo usando sonidos, pausas o gestos de voz.  
  - Ejemplo: si la palabra es **guitarra** (3 sílabas), no puedes decir:  
    > “Estoy tocando la… *mh-mh-mh*”  
    donde cada *mh* representa una sílaba.  
  - Esto incluye:
    - Tararear con un número de notas igual al número de sílabas.
    - Golpear o chasquear en un patrón que indique sílabas.
    - Cortar las frases con pausas que correspondan a las sílabas.
- Traducir la palabra a otro idioma.
- Hacer gestos o mímica.
- Deletrear la palabra o parte de ella.
- Incluir la palabra objetivo oculta dentro de otra palabra.

**Permitido:**
- Usar sinónimos, definiciones y rodeos.
- Onomatopeyas (si no están explícitamente prohibidas en la carta).

---

## ▶️ Secuencia de un turno

1. **El jugador activo** recibe el móvil/plataforma.
2. **Inicia la ronda** (60 s o 120 s según casilla).
3. Da pistas respetando las reglas.
4. Usa los botones:
   - **Correcto** → acierto.
   - **Pasar** → máx. 3 por ronda.
   - **Error** → final inmediato por infracción (aplica también con tiempo doble).
5. Cuando la ronda termina:
   - Calcula avance en el tablero según zona.
   - Aplica efectos de casilla.
6. **Pasa el móvil** a la persona de tu derecha.

---

## 🧠 Estrategia

- Guarda pases para cartas difíciles.
- Evita entrar en morada con pocos aciertos.
- Usa el doble tiempo para avanzar al máximo antes de morada.
- Árbitros laterales: atentos para detectar infracciones y pulsar **Error**.

---

## 📄 Tablero

- **Imprimir**: usa el archivo en `/tablero`.
- **Casero**: dibuja casillas con marcadores para reloj y morada.
- Leyenda:
  - ⏱ = próxima ronda con doble tiempo.
  - 🟪 = cada 3 aciertos → 1 casilla.

---

## 🏁 Final de la partida

Definan antes de empezar:
- Llegar a la meta.
- Jugar N rondas y ver quién avanza más.
- Alcanzar X casillas.

---

## ✅ Checklist rápido

1. Formar equipos y sentarse alternando.
2. Definir final de partida.
3. Colocar tablero.
4. Elegir quién empieza.
5. Recordar rotación anti-horaria (juega siempre tu derecha).
6. Abrir la plataforma y jugar.
