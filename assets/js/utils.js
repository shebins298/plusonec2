/*
 * Shared data-representation logic used by every widget on the page.
 * Kept in one place so the Base Converter and the ASCII Lookup widget
 * are guaranteed to agree on how a number converts between bases, and
 * so the three integer-representation decoders live next to each other
 * for easy cross-checking.
 */
(function (global) {
  'use strict';

  var HEX_DIGITS = '0123456789ABCDEF';

  function digitValue(ch) {
    return HEX_DIGITS.indexOf(String(ch).toUpperCase());
  }

  function digitChar(value) {
    return HEX_DIGITS[value];
  }

  function isValidDigitForBase(ch, base) {
    var v = digitValue(ch);
    return v !== -1 && v < base;
  }

  function isValidNumberForBase(str, base) {
    if (typeof str !== 'string' || str.length === 0) return false;
    for (var i = 0; i < str.length; i++) {
      if (!isValidDigitForBase(str[i], base)) return false;
    }
    return true;
  }

  // Non-negative integer -> target base, via the divide-by-base /
  // collect-remainders method. Remainders are generated least-significant
  // first, so the final digit string is read by reversing them (i.e.
  // reading the remainder column from bottom to top).
  function decimalToBaseSteps(decimalValue, base) {
    if (!Number.isInteger(decimalValue) || decimalValue < 0) {
      throw new Error('decimalToBaseSteps expects a non-negative integer');
    }
    var steps = [];
    var n = decimalValue;
    if (n === 0) {
      return { steps: [{ dividend: 0, base: base, quotient: 0, remainder: 0 }], result: '0' };
    }
    while (n > 0) {
      var quotient = Math.floor(n / base);
      var remainder = n % base;
      steps.push({ dividend: n, base: base, quotient: quotient, remainder: remainder });
      n = quotient;
    }
    var digits = steps.map(function (s) { return digitChar(s.remainder); }).reverse();
    return { steps: steps, result: digits.join('') };
  }

  // Number-in-base string -> decimal value, via weighted place-value
  // expansion (digit * base^power), power counted from 0 at the
  // rightmost digit.
  function baseToDecimalSteps(str, base) {
    var digits = str.toUpperCase().split('');
    var n = digits.length;
    var breakdown = digits.map(function (ch, i) {
      var power = n - 1 - i;
      var digitVal = digitValue(ch);
      var placeValue = Math.pow(base, power);
      var contribution = digitVal * placeValue;
      return { digit: ch, digitVal: digitVal, power: power, placeValue: placeValue, contribution: contribution };
    });
    var total = breakdown.reduce(function (sum, b) { return sum + b.contribution; }, 0);
    return { breakdown: breakdown, total: total };
  }

  function bitsToUnsignedInt(bits) {
    return bits.reduce(function (acc, b) { return acc * 2 + b; }, 0);
  }

  function intToBits(value, width) {
    var bits = [];
    for (var i = width - 1; i >= 0; i--) {
      bits.push((value >> i) & 1);
    }
    return bits;
  }

  // ---- Integer representation decoders (8-bit, MSB = sign bit) ----

  // Sign & Magnitude: MSB is a pure sign flag; the remaining 7 bits are
  // the magnitude, read as an ordinary unsigned binary number.
  function decodeSignMagnitude(bits) {
    var sign = bits[0];
    var magnitudeBits = bits.slice(1);
    var magnitude = bitsToUnsignedInt(magnitudeBits);
    var value = sign === 1 ? -magnitude : magnitude;
    return {
      sign: sign,
      magnitude: magnitude,
      value: value,
      isNegativeZero: sign === 1 && magnitude === 0
    };
  }

  // 1's Complement: positive numbers (MSB 0) are plain binary. Negative
  // numbers (MSB 1) are decoded by flipping every bit and reading the
  // flipped pattern as the magnitude.
  function decodeOnesComplement(bits) {
    var sign = bits[0];
    if (sign === 0) {
      var posValue = bitsToUnsignedInt(bits);
      return { sign: sign, magnitude: posValue, value: posValue, flippedBits: null, isNegativeZero: false };
    }
    var flippedBits = bits.map(function (b) { return 1 - b; });
    var magnitude = bitsToUnsignedInt(flippedBits);
    var value = -magnitude;
    return { sign: sign, magnitude: magnitude, value: value, flippedBits: flippedBits, isNegativeZero: magnitude === 0 };
  }

  // 2's Complement: decoded directly with a weighted sum where the MSB
  // carries a *negative* place value (-2^(width-1)) and every other bit
  // keeps its normal positive place value. This single formula handles
  // every bit pattern correctly, including the -128 edge case that has
  // no positive counterpart in 8-bit two's complement.
  function decodeTwosComplement(bits) {
    var width = bits.length;
    var value = 0;
    for (var i = 0; i < width; i++) {
      var power = width - 1 - i;
      var weight = (i === 0) ? -Math.pow(2, power) : Math.pow(2, power);
      value += bits[i] * weight;
    }
    var sign = bits[0];
    var invertPlusOneMagnitude = null;
    if (sign === 1) {
      var flipped = bits.map(function (b) { return 1 - b; });
      var flippedVal = bitsToUnsignedInt(flipped);
      invertPlusOneMagnitude = flippedVal + 1;
    }
    return { sign: sign, value: value, magnitude: Math.abs(value), invertPlusOneMagnitude: invertPlusOneMagnitude };
  }

  // ---- Binary addition ----

  function addBinaryStrings(aStr, bStr) {
    var width = Math.max(aStr.length, bStr.length);
    var aPadded = aStr.padStart(width, '0');
    var bPadded = bStr.padStart(width, '0');
    var columns = [];
    var carry = 0;
    var resultBits = [];
    for (var i = width - 1; i >= 0; i--) {
      var a = Number(aPadded[i]);
      var b = Number(bPadded[i]);
      var total = a + b + carry;
      var sum = total % 2;
      var carryOut = total >= 2 ? 1 : 0;
      columns.unshift({ position: i, a: a, b: b, carryIn: carry, sum: sum, carryOut: carryOut });
      resultBits.unshift(sum);
      carry = carryOut;
    }
    var finalCarry = carry;
    var resultStr = (finalCarry ? '1' : '') + resultBits.join('');
    return { aPadded: aPadded, bPadded: bPadded, width: width, columns: columns, finalCarry: finalCarry, resultStr: resultStr };
  }

  global.DR = {
    HEX_DIGITS: HEX_DIGITS,
    digitValue: digitValue,
    digitChar: digitChar,
    isValidDigitForBase: isValidDigitForBase,
    isValidNumberForBase: isValidNumberForBase,
    decimalToBaseSteps: decimalToBaseSteps,
    baseToDecimalSteps: baseToDecimalSteps,
    bitsToUnsignedInt: bitsToUnsignedInt,
    intToBits: intToBits,
    decodeSignMagnitude: decodeSignMagnitude,
    decodeOnesComplement: decodeOnesComplement,
    decodeTwosComplement: decodeTwosComplement,
    addBinaryStrings: addBinaryStrings
  };
})(typeof window !== 'undefined' ? window : globalThis);
