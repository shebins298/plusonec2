(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    var inputA = document.getElementById('add-input-a');
    var inputB = document.getElementById('add-input-b');
    var errorEl = document.getElementById('add-error');
    var grid = document.getElementById('add-grid');
    var resultBanner = document.getElementById('add-result');
    var resultValue = document.getElementById('add-result-value');
    if (!inputA || !inputB || !grid) return;

    function makeRow(className) {
      var row = document.createElement('div');
      row.className = 'add-grid__row' + (className ? ' ' + className : '');
      return row;
    }

    function makeCell(text, className) {
      var cell = document.createElement('div');
      cell.className = 'add-grid__cell' + (className ? ' ' + className : '');
      cell.textContent = text;
      return cell;
    }

    function render() {
      var a = inputA.value.trim();
      var b = inputB.value.trim();
      grid.innerHTML = '';
      resultBanner.hidden = true;
      errorEl.textContent = '';

      if (a === '' || b === '') return;
      if (!DR.isValidNumberForBase(a, 2) || !DR.isValidNumberForBase(b, 2)) {
        errorEl.textContent = 'Both numbers must contain only the binary digits 0 and 1.';
        return;
      }

      var r = DR.addBinaryStrings(a, b);
      var width = r.width;
      var resultPadded = r.resultStr.padStart(width + 1, ' ');

      // Columns are computed right-to-left (rightmost/LSB first), with the
      // overflow bit appearing last of all. Stagger each cell's reveal to
      // match that real computation order, so the carry visibly cascades
      // leftward instead of the whole sum appearing at once.
      var stepMs = 150;
      function delayForDisplayIndex(displayIndex) {
        if (displayIndex === 0) return width * stepMs; // overflow bit: last
        var columnIndex = displayIndex - 1; // 0 = leftmost/MSB column
        return (width - columnIndex - 1) * stepMs;
      }

      var carryRow = makeRow();
      var overflowCarryCell = makeCell(r.finalCarry ? '1' : '', 'add-grid__cell--carry' + (r.finalCarry ? ' is-active' : ''));
      overflowCarryCell.style.animationDelay = delayForDisplayIndex(0) + 'ms';
      carryRow.appendChild(overflowCarryCell);
      r.columns.forEach(function (col, j) {
        var cell = makeCell(col.carryIn ? '1' : '', 'add-grid__cell--carry' + (col.carryIn ? ' is-active' : ''));
        cell.style.animationDelay = delayForDisplayIndex(j + 1) + 'ms';
        carryRow.appendChild(cell);
      });

      var aRow = makeRow();
      aRow.appendChild(makeCell('', 'add-grid__cell--op'));
      r.aPadded.split('').forEach(function (d) { aRow.appendChild(makeCell(d)); });

      var bRow = makeRow();
      bRow.appendChild(makeCell('+', 'add-grid__cell--op'));
      r.bPadded.split('').forEach(function (d) { bRow.appendChild(makeCell(d)); });

      var resultRow = makeRow('add-grid__row--result');
      resultPadded.split('').forEach(function (d, i) {
        var isOverflowDigit = i === 0 && r.finalCarry;
        var cell = makeCell(d === ' ' ? '' : d, 'add-grid__cell--sum' + (isOverflowDigit ? ' add-grid__cell--overflow' : ''));
        cell.style.animationDelay = delayForDisplayIndex(i) + 'ms';
        resultRow.appendChild(cell);
      });

      grid.appendChild(carryRow);
      grid.appendChild(aRow);
      grid.appendChild(bRow);
      grid.appendChild(resultRow);

      var decA = DR.baseToDecimalSteps(r.aPadded, 2).total;
      var decB = DR.baseToDecimalSteps(r.bPadded, 2).total;
      var decSum = DR.baseToDecimalSteps(r.resultStr, 2).total;
      resultValue.textContent = r.resultStr + (r.finalCarry ? ' (with a final overflow carry)' : '') + ' — check: ' + decA + ' + ' + decB + ' = ' + decSum;
      resultBanner.hidden = false;
    }

    inputA.addEventListener('input', render);
    inputB.addEventListener('input', render);
    render();
  });
})();
