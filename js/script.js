
const MAX_NUMBER = 66;

    const SIZE = 5;

    const TITLE = "BULLSHIT BINGO"
    
    const gridEl = document.getElementById('grid');
    const lockToggle = document.getElementById('lockToggle');
    const fillBtn = document.getElementById('fillBtn');
    const startBtn = document.getElementById('startBtn');
    const statusEl = document.getElementById('status');
    const title = document.getElementById('title');

    const MID = Math.floor((SIZE*SIZE)/2);
    const EASTER_PATTERN = [0, 4, 5, 9, 11, 13, 16, 18, 22];
    let easterEggTriggered = false;
    let started = false;

    // Keep this outside checkBingo() so it persists between calls
    const rewardedBingos = new Set();

    title.textContent = TITLE;
    const grid = document.querySelector(".grid");
    grid.style.gridTemplateColumns = `repeat(${SIZE}, 1fr)`;

    const cells = Array.from({ length: SIZE*SIZE }, (_, i) => createCell(i));

    function createCell(index) {
      const wrapper = document.createElement('div');
      wrapper.className = 'cell';
      wrapper.dataset.index = index;

      const input = document.createElement('input');
      input.type = 'number';
      input.inputMode = 'numeric';
      input.autocomplete = 'off';
      input.placeholder = '';
      input.title = 'Nur Zahlen';

      input.addEventListener('input', () => {
        if (input.value.includes('e') || input.value.includes('E')) input.value = '';
        validateAll();
      });

      wrapper.appendChild(input);
      gridEl.appendChild(wrapper);
      return { wrapper, input };
    }

    lockToggle.addEventListener("change", () => {
      if (!started) return;

      if (!lockToggle.checked) {
        showToast("Board entsperrt. Neustart möglich.");
      } else {
        showToast("Board gesperrt.");
      }
    });

    function randomFill() {
      const pool = Array.from({length: MAX_NUMBER}, (_, i) => i+1);
      shuffle(pool);
      for (let i = 0; i < cells.length; i++) {
        cells[i].input.value = pool[i];
      }
      validateAll();
    }

    function shuffle(arr) {
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
        console.log("set cell " + i + " to " + arr[i]);
      }
    }

    function validateAll() {
      const map = new Map();

      let hasOutOfRange = false;

      for (let i = 0; i < cells.length; i++) {
        const value = cells[i].input.value.trim();
        cells[i].wrapper.classList.remove('dup', 'outofrange');
        if (value !== '') {
          const num = parseInt(value);
          if (isNaN(num) || num < 1 || num > MAX_NUMBER) {
            cells[i].wrapper.classList.add('outofrange');
            hasOutOfRange = true;
          }
          map.set(value, (map.get(value) || []).concat(i));
        }
      }

      let hasDup = false;
      map.forEach((indices) => {
        if (indices.length > 1) {
          hasDup = true;
          indices.forEach(idx => cells[idx].wrapper.classList.add('dup'));
        }
      });

      let complete = true;
      for (let i = 0; i < cells.length; i++) {
        if (cells[i].input.value.trim() === '') { complete = false; break; }
      }

      if (hasOutOfRange) {
        statusEl.textContent = `Fehler: Zahlen müssen zwischen 1 und ${MAX_NUMBER} liegen.`;
      } else if (hasDup) {
        statusEl.textContent = 'Fehler: Duplikate gefunden. Bitte korrigieren.';
      } else if (!complete) {
        statusEl.textContent = `Bitte alle Felder mit Zahlen von 1 bis ${MAX_NUMBER} füllen.`;
      } else {
        statusEl.textContent = 'Bereit zum Start.';
      }
      startBtn.disabled = hasDup || hasOutOfRange || !complete || started;
    }

    function startGame() {
      // enforce locked state
      lockToggle.checked = true;
      lockToggle.disabled = false;

      started = true;
      for (let i = 0; i < cells.length; i++) {
        cells[i].input.readOnly = true;
      }
      statusEl.textContent = 'Spiel läuft: Klicke Felder zum Markieren.';
      startBtn.textContent = 'Neustart';
      startBtn.disabled = false;
      gridEl.addEventListener('click', onCellClick);
      document.body.classList.add("started");
    }

    function resetGame(keepNumbers = false) {
      started = false;
      easterEggTriggered = false;
      resetEasterEgg();

      cells.forEach(c => {
        if (!keepNumbers) c.input.value = '';
        c.input.readOnly = false;
        c.wrapper.classList.remove('marked', 'bingo', 'dup', 'outofrange');
      });

      rewardedBingos.clear();

      lockToggle.checked = false;   // reset to locked
      lockToggle.disabled = false;

      startBtn.textContent = 'Start';
      startBtn.disabled = true;

      statusEl.textContent = '';
      statusEl.classList.remove('bingo-message','bingo-animate');
      validateAll();
    }

    function onCellClick(e) {
      if (!started) return;
      const cell = e.target.closest('.cell');
      if (!cell) return;
      cell.classList.toggle('marked');
      checkBingo();
      checkEasterEgg();
    }

    function checkBingo() {
      // Reset highlighting before re-check
      cells.forEach(c => c.wrapper.classList.remove('bingo'));

      const lines = [];

      // Rows
      for (let r = 0; r < SIZE; r++) {
        lines.push({ id: `row-${r}`, idxs: [...Array(SIZE).keys()].map(c => r*SIZE + c) });
      }
      // Cols
      for (let c = 0; c < SIZE; c++) {
        lines.push({ id: `col-${c}`, idxs: [...Array(SIZE).keys()].map(r => r*SIZE + c) });
      }
      // Diagonals
      lines.push({ id: 'diag-main', idxs: [...Array(SIZE).keys()].map(i => i*SIZE + i) });
      lines.push({ id: 'diag-anti', idxs: [...Array(SIZE).keys()].map(i => i*SIZE + (SIZE-1-i)) });

      let newBingos = [];

      for (const { id, idxs } of lines) {
        const isComplete = idxs.every(idx =>
          cells[idx].wrapper.classList.contains('marked')
        );

        if (isComplete) {
          // highlight
          idxs.forEach(idx => cells[idx].wrapper.classList.add('bingo'));

          // if not already rewarded → add to newBingos
          if (!rewardedBingos.has(id)) {
            rewardedBingos.add(id);

            const values = idxs
              .map(idx =>cells[idx].input.value)
              .join(', ');

            newBingos.push(`Bingo! Linie: ${values}`);
          }
        }
      }

      if (newBingos.length) {
        newBingos.forEach(msg => showToast(msg));
        triggerFirework();
      }
    }

    startBtn.addEventListener('click', () => {
      if (!started) {
        startGame();
      } else {
        if (lockToggle.checked) {
          showToast("Board ist gesperrt. Zum Neustarten entsperren.");
          return;
        }

        // your existing modal logic
        document.getElementById("restartModal").style.display = "flex";
      }
    });

    fillBtn.addEventListener('click', () => { if (!started) randomFill(); });

    function triggerFirework() {
      const fw = document.querySelector('.firework');
      fw.classList.add('active');

      fw.addEventListener('animationend', () => {
        fw.classList.remove('active');
      }, { once: true });
    }

    function showToast(message) {
      const toast = document.createElement("div");
      toast.className = "toast show";
      toast.textContent = message;

      // find or create toast container
      let container = document.querySelector(".toast-container");
      if (!container) {
        container = document.createElement("div");
        container.className = "toast-container";
        document.body.appendChild(container);
      }

      container.appendChild(toast);

      // auto-remove after 3s
      setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => toast.remove(), 500);
      }, 3000);
    }

    function checkEasterEgg() {
      if (easterEggTriggered) return;

      const isExactMatch = cells.every((c, idx) => {
        const isMarked = c.wrapper.classList.contains('marked');
        const shouldBeMarked = EASTER_PATTERN.includes(idx);
        return isMarked === shouldBeMarked;
      });

      if (isExactMatch) {
        triggerDancyDance();
        easterEggTriggered = true;
      }
    }

    function triggerDancyDance() {
      statusEl.textContent = "🎵 You feel a strange presence...";
      setTimeout(() => {
        const egg = document.getElementById("easteregg");
        const audio = document.getElementById("secret-audio");

        if (!egg || !audio) return;

        // show animation
        egg.classList.add("active");

        // play audio (important: must be triggered by user interaction)
        audio.volume = 0.7;
        audio.play().catch(err => {
          console.log("Audio playback blocked:", err);
        });
      }, 1000);
    }

    function resetEasterEgg() {
      const egg = document.getElementById("easteregg");
      const audio = document.getElementById("secret-audio");

      if (!egg || !audio) return;

      // remove visual state
      egg.classList.remove("active");

      // stop audio immediately
      audio.pause();
      audio.currentTime = 0;
    }

    validateAll();
