(function () {
  'use strict';

  var GRID_SIZE = 25; // 5x5

  function hex2(value) {
    return DR.decimalToBaseSteps(value, 16).result.padStart(2, '0');
  }

  document.addEventListener('DOMContentLoaded', function () {
    var grid = document.getElementById('pixel-grid');
    var sliderR = document.getElementById('pixel-r');
    var sliderG = document.getElementById('pixel-g');
    var sliderB = document.getElementById('pixel-b');
    var outR = document.getElementById('pixel-r-out');
    var outG = document.getElementById('pixel-g-out');
    var outB = document.getElementById('pixel-b-out');
    var swatch = document.getElementById('pixel-swatch');
    var readoutCodes = document.getElementById('pixel-readout-codes');
    var fillAllBtn = document.getElementById('pixel-fill-all');
    if (!grid) return;

    var pixels = [];
    for (var i = 0; i < GRID_SIZE; i++) {
      pixels.push({ r: 200, g: 200, b: 200 });
    }
    var selected = 0;
    pixels[selected] = { r: 255, g: 0, b: 0 };

    var pixelEls = [];

    function rgbCss(p) {
      return 'rgb(' + p.r + ',' + p.g + ',' + p.b + ')';
    }

    function buildGrid() {
      grid.innerHTML = '';
      pixelEls = [];
      pixels.forEach(function (p, i) {
        var el = document.createElement('button');
        el.type = 'button';
        el.className = 'pixel';
        el.style.background = rgbCss(p);
        el.setAttribute('aria-label', 'Pixel ' + (i + 1) + ', RGB ' + p.r + ', ' + p.g + ', ' + p.b);
        el.addEventListener('click', function () { selectPixel(i); });
        grid.appendChild(el);
        pixelEls.push(el);
      });
    }

    function updateReadout() {
      var p = pixels[selected];
      swatch.style.background = rgbCss(p);
      readoutCodes.innerHTML = '';
      var line1 = document.createElement('div');
      line1.innerHTML = 'RGB(<strong>' + p.r + '</strong>, <strong>' + p.g + '</strong>, <strong>' + p.b + '</strong>)';
      var line2 = document.createElement('div');
      line2.innerHTML = 'Hex #<strong>' + (hex2(p.r) + hex2(p.g) + hex2(p.b)).toUpperCase() + '</strong>';
      readoutCodes.appendChild(line1);
      readoutCodes.appendChild(line2);
    }

    function syncSlidersToSelected() {
      var p = pixels[selected];
      sliderR.value = p.r;
      sliderG.value = p.g;
      sliderB.value = p.b;
      outR.textContent = String(p.r);
      outG.textContent = String(p.g);
      outB.textContent = String(p.b);
    }

    function selectPixel(i) {
      var prevEl = pixelEls[selected];
      if (prevEl) prevEl.classList.remove('is-selected');
      selected = i;
      pixelEls[i].classList.add('is-selected');
      syncSlidersToSelected();
      updateReadout();
    }

    function applySlidersToSelected() {
      var r = Number(sliderR.value);
      var g = Number(sliderG.value);
      var b = Number(sliderB.value);
      pixels[selected] = { r: r, g: g, b: b };
      outR.textContent = String(r);
      outG.textContent = String(g);
      outB.textContent = String(b);
      pixelEls[selected].style.background = rgbCss(pixels[selected]);
      pixelEls[selected].setAttribute('aria-label', 'Pixel ' + (selected + 1) + ', RGB ' + r + ', ' + g + ', ' + b);
      updateReadout();
    }

    function fillAll() {
      var r = Number(sliderR.value);
      var g = Number(sliderG.value);
      var b = Number(sliderB.value);
      pixels.forEach(function (p, i) {
        pixels[i] = { r: r, g: g, b: b };
        pixelEls[i].style.background = rgbCss(pixels[i]);
        pixelEls[i].setAttribute('aria-label', 'Pixel ' + (i + 1) + ', RGB ' + r + ', ' + g + ', ' + b);
      });
      updateReadout();
    }

    sliderR.addEventListener('input', applySlidersToSelected);
    sliderG.addEventListener('input', applySlidersToSelected);
    sliderB.addEventListener('input', applySlidersToSelected);
    fillAllBtn.addEventListener('click', fillAll);

    buildGrid();
    pixelEls[selected].classList.add('is-selected');
    syncSlidersToSelected();
    updateReadout();
  });
})();
