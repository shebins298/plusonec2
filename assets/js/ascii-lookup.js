(function () {
  'use strict';

  var CONTROL_NAMES = [
    'NUL', 'SOH', 'STX', 'ETX', 'EOT', 'ENQ', 'ACK', 'BEL', 'BS', 'TAB',
    'LF', 'VT', 'FF', 'CR', 'SO', 'SI', 'DLE', 'DC1', 'DC2', 'DC3',
    'DC4', 'NAK', 'SYN', 'ETB', 'CAN', 'EM', 'SUB', 'ESC', 'FS', 'GS',
    'RS', 'US'
  ]; // codes 0-31

  function padBin7(code) {
    return DR.decimalToBaseSteps(code, 2).result.padStart(7, '0');
  }
  function padHex2(code) {
    return DR.decimalToBaseSteps(code, 16).result.padStart(2, '0');
  }

  function buildAsciiRows() {
    var rows = [];
    for (var code = 0; code <= 127; code++) {
      var isControl = code <= 31 || code === 127;
      var name = code <= 31 ? CONTROL_NAMES[code] : (code === 127 ? 'DEL' : null);
      var displayChar = isControl ? name : (code === 32 ? 'Space' : String.fromCharCode(code));
      var char = isControl ? null : String.fromCharCode(code);
      rows.push({
        code: code,
        char: char,
        displayChar: displayChar,
        isControl: isControl,
        name: name,
        bin: padBin7(code),
        hex: padHex2(code)
      });
    }
    return rows;
  }

  document.addEventListener('DOMContentLoaded', function () {
    var tbody = document.getElementById('ascii-table-body');
    var searchInput = document.getElementById('ascii-search');
    var detail = document.getElementById('ascii-detail');
    var detailChar = document.getElementById('ascii-detail-char');
    var detailDec = document.getElementById('ascii-detail-dec');
    var detailBin = document.getElementById('ascii-detail-bin');
    var detailHex = document.getElementById('ascii-detail-hex');
    var encoderInput = document.getElementById('ascii-encoder-input');
    var encoderOutput = document.getElementById('ascii-encoder-output');
    if (!tbody) return;

    var rows = buildAsciiRows();
    var rowEls = {};
    var selectedCode = 65; // 'A'

    function showDetail(row) {
      detail.hidden = false;
      detailChar.textContent = row.isControl ? row.name : (row.code === 32 ? '"space"' : ('"' + row.char + '"'));
      detailDec.textContent = String(row.code);
      detailBin.textContent = row.bin;
      detailHex.textContent = row.hex;
    }

    function selectRow(code) {
      var prev = rowEls[selectedCode];
      if (prev) prev.classList.remove('is-selected');
      selectedCode = code;
      var next = rowEls[code];
      if (next) next.classList.add('is-selected');
      var row = rows[code];
      showDetail(row);
    }

    function buildTable() {
      tbody.innerHTML = '';
      rowEls = {};
      rows.forEach(function (row) {
        var tr = document.createElement('tr');
        tr.tabIndex = 0;
        tr.dataset.code = String(row.code);
        tr.setAttribute('role', 'button');
        tr.setAttribute('aria-label', 'ASCII code ' + row.code + (row.isControl ? ', ' + row.name : ', character ' + row.char));

        var charTd = document.createElement('td');
        charTd.className = 'char-cell';
        charTd.textContent = row.displayChar;

        var decTd = document.createElement('td');
        decTd.textContent = String(row.code);

        var binTd = document.createElement('td');
        binTd.textContent = row.bin;

        var hexTd = document.createElement('td');
        hexTd.textContent = row.hex;

        tr.appendChild(charTd);
        tr.appendChild(decTd);
        tr.appendChild(binTd);
        tr.appendChild(hexTd);

        tr.addEventListener('click', function () { selectRow(row.code); });
        tr.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectRow(row.code); }
        });

        tbody.appendChild(tr);
        rowEls[row.code] = tr;
      });
    }

    // Lower tier number = stronger match. A single-character query is most
    // likely someone looking up that literal character (e.g. "A"), even
    // though "A" also happens to be a valid hex digit (and coincidentally
    // equals the hex code of another character) — so literal-character
    // match always outranks a hex-code match.
    function matchTier(row, q, qUpper, isAllDigits, isHex) {
      if (q.length === 1 && row.char === q) return 1;
      if (row.name && row.name === qUpper) return 2;
      if (isAllDigits && row.code === Number(q)) return 3;
      if (isHex && row.hex === qUpper.padStart(2, '0')) return 4;
      if (q.length >= 2 && row.name && row.name.indexOf(qUpper) === 0) return 5;
      return Infinity;
    }

    function applySearch() {
      var q = searchInput.value.trim();
      var qUpper = q.toUpperCase();
      var isAllDigits = /^\d+$/.test(q);
      var isHex = /^[0-9A-Fa-f]+$/.test(q);
      var bestTier = Infinity;
      var bestCode = null;

      rows.forEach(function (row) {
        var tier = q === '' ? 0 : matchTier(row, q, qUpper, isAllDigits, isHex);
        var match = tier !== Infinity;
        var tr = rowEls[row.code];
        tr.hidden = !match;
        if (match && tier < bestTier) {
          bestTier = tier;
          bestCode = row.code;
        }
      });

      if (q !== '' && bestCode !== null) {
        selectRow(bestCode);
      }
    }

    function renderEncoder() {
      var text = encoderInput.value;
      encoderOutput.innerHTML = '';
      Array.prototype.forEach.call(Array.from(text), function (ch) {
        var code = ch.codePointAt(0);
        var chip = document.createElement('div');
        var displayCh = ch === ' ' ? '"space"' : ('"' + ch + '"');
        if (code <= 127) {
          chip.className = 'encoder-chip';
          chip.innerHTML = '';
          var charEl = document.createElement('span');
          charEl.className = 'encoder-chip__char';
          charEl.textContent = displayCh;
          var codesEl = document.createElement('span');
          codesEl.textContent = code + ' · ' + padBin7(code) + ' · ' + padHex2(code);
          chip.appendChild(charEl);
          chip.appendChild(codesEl);
        } else {
          chip.className = 'encoder-chip encoder-chip--outside';
          var codeHex = code.toString(16).toUpperCase();
          chip.innerHTML = '';
          var charEl2 = document.createElement('span');
          charEl2.className = 'encoder-chip__char';
          charEl2.textContent = displayCh;
          var codesEl2 = document.createElement('span');
          codesEl2.textContent = 'U+' + codeHex + ' (outside 7-bit ASCII)';
          chip.appendChild(charEl2);
          chip.appendChild(codesEl2);
        }
        encoderOutput.appendChild(chip);
      });
    }

    buildTable();
    selectRow(65);
    searchInput.addEventListener('input', applySearch);
    encoderInput.addEventListener('input', renderEncoder);
    renderEncoder();
  });
})();
