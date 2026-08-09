(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    var bitRow = document.getElementById('bit-row');
    var decodeGrid = document.getElementById('decode-grid');
    if (!bitRow || !decodeGrid) return;

    var bits = [1, 0, 1, 1, 0, 1, 0, 1]; // default: an arbitrary non-trivial pattern

    function weightLabel(i) {
      if (i === 0) return 'sign';
      return '2^' + (7 - i);
    }

    function renderBits() {
      bitRow.innerHTML = '';
      bits.forEach(function (bit, i) {
        var col = document.createElement('div');
        col.className = 'bit-col' + (i === 0 ? ' bit-col--sign' : '');

        var weight = document.createElement('div');
        weight.className = 'bit-col__weight';
        weight.textContent = weightLabel(i);

        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'bit-switch';
        btn.dataset.on = String(bit);
        btn.textContent = String(bit);
        btn.setAttribute('aria-label', (i === 0 ? 'Sign bit' : 'Bit ' + (7 - i)) + ', currently ' + bit + '. Click to flip.');
        btn.addEventListener('click', function () {
          bits[i] = bits[i] === 1 ? 0 : 1;
          renderBits();
          renderDecode();
        });

        var label = document.createElement('div');
        label.className = 'bit-col__label';
        label.textContent = i === 0 ? 'MSB' : (i === 7 ? 'LSB' : '');

        col.appendChild(weight);
        col.appendChild(btn);
        col.appendChild(label);
        bitRow.appendChild(col);
      });
    }

    function makeDecodeCard(title, value, breakdownHtml, note) {
      var card = document.createElement('div');
      card.className = 'decode-card';

      var titleEl = document.createElement('div');
      titleEl.className = 'decode-card__title';
      titleEl.textContent = title;

      var valueEl = document.createElement('div');
      valueEl.className = 'decode-card__value' + (value < 0 ? ' decode-card__value--negative' : '');
      valueEl.textContent = (value === 0 ? '0' : (value > 0 ? '+' + value : String(value)));

      var breakdownEl = document.createElement('div');
      breakdownEl.className = 'decode-card__breakdown';
      breakdownEl.textContent = breakdownHtml;

      card.appendChild(titleEl);
      card.appendChild(valueEl);
      card.appendChild(breakdownEl);

      if (note) {
        var noteEl = document.createElement('div');
        noteEl.className = 'decode-card__note';
        noteEl.textContent = note;
        card.appendChild(noteEl);
      }
      return card;
    }

    function renderDecode() {
      decodeGrid.innerHTML = '';
      var bitsStr = bits.join('');

      // Sign & Magnitude
      var sm = DR.decodeSignMagnitude(bits);
      var smBreakdown = 'MSB = ' + sm.sign + ' → ' + (sm.sign === 1 ? 'negative' : 'positive') + '. Remaining 7 bits ' + bitsStr.slice(1) + ' = ' + sm.magnitude + '. Value = ' + (sm.sign === 1 ? '−' : '') + sm.magnitude + '.';
      var smNote = sm.isNegativeZero ? 'This pattern is a second representation of zero (−0) in Sign & Magnitude.' : null;
      decodeGrid.appendChild(makeDecodeCard('Sign & Magnitude', sm.value, smBreakdown, smNote));

      // 1's Complement
      var oc = DR.decodeOnesComplement(bits);
      var ocBreakdown;
      if (oc.sign === 0) {
        ocBreakdown = 'MSB = 0 → positive. Value = binary ' + bitsStr + ' = ' + oc.value + '.';
      } else {
        ocBreakdown = 'MSB = 1 → negative. Flip all bits: ' + oc.flippedBits.join('') + ' = ' + oc.magnitude + '. Value = −' + oc.magnitude + '.';
      }
      var ocNote = oc.isNegativeZero ? 'This pattern is a second representation of zero (−0) in 1’s Complement.' : null;
      decodeGrid.appendChild(makeDecodeCard('1’s Complement', oc.value, ocBreakdown, ocNote));

      // 2's Complement
      var tc = DR.decodeTwosComplement(bits);
      var tcBreakdown = 'Weighted sum: (−128)×' + bits[0] + ' + 64×' + bits[1] + ' + 32×' + bits[2] + ' + 16×' + bits[3] +
        ' + 8×' + bits[4] + ' + 4×' + bits[5] + ' + 2×' + bits[6] + ' + 1×' + bits[7] + ' = ' + tc.value + '.';
      if (tc.sign === 1) {
        tcBreakdown += ' (Invert + 1 gives the same magnitude, ' + tc.invertPlusOneMagnitude + '.)';
      }
      var tcNote = (tc.sign === 1 && tc.magnitude === 128) ? 'The value +128 itself cannot be stored in 8-bit Two’s Complement — this pattern is the one extra negative value (−128) the range gains from having only a single zero.' : null;
      decodeGrid.appendChild(makeDecodeCard('2’s Complement', tc.value, tcBreakdown, tcNote));
    }

    var presetButtons = document.querySelectorAll('[data-preset]');
    Array.prototype.forEach.call(presetButtons, function (btn) {
      btn.addEventListener('click', function () {
        bits = btn.dataset.preset.split('').map(Number);
        renderBits();
        renderDecode();
      });
    });

    renderBits();
    renderDecode();
  });
})();
