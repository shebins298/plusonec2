(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    var card = document.getElementById('base-converter-card');
    if (!card) return;

    var modeD2B = document.getElementById('bc-mode-d2b');
    var modeB2D = document.getElementById('bc-mode-b2d');
    var panelD2B = document.getElementById('bc-panel-d2b');
    var panelB2D = document.getElementById('bc-panel-b2d');

    var decimalInput = document.getElementById('bc-decimal-input');
    var targetBaseSelect = document.getElementById('bc-target-base');
    var d2bError = document.getElementById('bc-d2b-error');
    var ladder = document.getElementById('bc-ladder');
    var d2bResult = document.getElementById('bc-d2b-result');
    var d2bResultValue = document.getElementById('bc-d2b-result-value');

    var baseInput = document.getElementById('bc-base-input');
    var sourceBaseSelect = document.getElementById('bc-source-base');
    var b2dError = document.getElementById('bc-b2d-error');
    var expansion = document.getElementById('bc-expansion');
    var b2dResult = document.getElementById('bc-b2d-result');
    var b2dResultValue = document.getElementById('bc-b2d-result-value');

    var baseNames = { 2: 'binary', 8: 'octal', 16: 'hexadecimal' };

    function setMode(mode) {
      var isD2B = mode === 'd2b';
      modeD2B.setAttribute('aria-selected', String(isD2B));
      modeB2D.setAttribute('aria-selected', String(!isD2B));
      panelD2B.hidden = !isD2B;
      panelB2D.hidden = isD2B;
    }
    modeD2B.addEventListener('click', function () { setMode('d2b'); });
    modeB2D.addEventListener('click', function () { setMode('b2d'); });

    function renderD2B() {
      var raw = decimalInput.value.trim();
      var base = Number(targetBaseSelect.value);
      ladder.innerHTML = '';
      d2bResult.hidden = true;
      d2bError.textContent = '';

      if (raw === '') return;
      if (!/^\d+$/.test(raw)) {
        d2bError.textContent = 'Enter a whole, non-negative decimal number (digits 0–9 only).';
        return;
      }
      var value = Number(raw);
      if (!Number.isSafeInteger(value)) {
        d2bError.textContent = 'That number is too large to convert here.';
        return;
      }

      var conversion = DR.decimalToBaseSteps(value, base);
      conversion.steps.forEach(function (step, i) {
        var row = document.createElement('div');
        row.className = 'ladder__row';
        row.style.animationDelay = (i * 70) + 'ms';
        var eq = document.createElement('span');
        eq.textContent = step.dividend + ' ÷ ' + base + ' = ' + step.quotient;
        var arrow = document.createElement('span');
        arrow.textContent = '→';
        arrow.style.color = 'var(--ink-faint)';
        var rem = document.createElement('span');
        rem.className = 'ladder__remainder';
        rem.textContent = 'remainder ' + DR.digitChar(step.remainder);
        row.appendChild(eq);
        row.appendChild(arrow);
        row.appendChild(rem);
        ladder.appendChild(row);
      });

      var readout = document.createElement('div');
      readout.className = 'ladder__readout';
      readout.textContent = 'Read the remainders bottom → top: ' + conversion.result;
      ladder.appendChild(readout);

      d2bResultValue.textContent = value + ' (decimal) = ' + conversion.result + ' (' + baseNames[base] + ')';
      d2bResult.hidden = false;
    }

    function renderB2D() {
      var raw = baseInput.value.trim().toUpperCase();
      var base = Number(sourceBaseSelect.value);
      expansion.innerHTML = '';
      b2dResult.hidden = true;
      b2dError.textContent = '';

      if (raw === '') return;
      if (!DR.isValidNumberForBase(raw, base)) {
        d2bError.textContent = '';
        b2dError.textContent = 'That contains a digit not valid in ' + baseNames[base] + ' (allowed: ' + DR.HEX_DIGITS.slice(0, base).split('').join(', ') + ').';
        return;
      }

      var conversion = DR.baseToDecimalSteps(raw, base);
      conversion.breakdown.forEach(function (b, i) {
        var row = document.createElement('div');
        row.className = 'expansion__row';
        row.style.animationDelay = (i * 90) + 'ms';
        var digit = document.createElement('span');
        digit.className = 'expansion__digit';
        digit.textContent = b.digit;
        var expr = document.createElement('span');
        expr.textContent = '× ' + base + '^' + b.power + ' (' + b.placeValue + ')';
        var contrib = document.createElement('span');
        contrib.className = 'expansion__contribution';
        contrib.textContent = '= ' + b.contribution;
        row.appendChild(digit);
        row.appendChild(expr);
        row.appendChild(contrib);
        expansion.appendChild(row);
      });

      var totalRow = document.createElement('div');
      totalRow.className = 'expansion__total';
      totalRow.style.animationDelay = (conversion.breakdown.length * 90) + 'ms';
      var totalLabel = document.createElement('span');
      totalLabel.textContent = 'Sum';
      var totalValue = document.createElement('span');
      totalValue.textContent = conversion.total;
      totalRow.appendChild(totalLabel);
      totalRow.appendChild(totalValue);
      expansion.appendChild(totalRow);

      b2dResultValue.textContent = raw + ' (' + baseNames[base] + ') = ' + conversion.total + ' (decimal)';
      b2dResult.hidden = false;
    }

    decimalInput.addEventListener('input', renderD2B);
    targetBaseSelect.addEventListener('change', renderD2B);
    baseInput.addEventListener('input', renderB2D);
    sourceBaseSelect.addEventListener('change', renderB2D);

    renderD2B();
    renderB2D();
  });
})();
