(function () {
  'use strict';

  function normalize(str) {
    return String(str).trim().toLowerCase();
  }

  function buildMcq(q, feedbackEl, onAnswered) {
    var wrap = document.createElement('div');
    wrap.className = 'quiz-q__options';
    var answered = false;

    q.options.forEach(function (optionText, i) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'quiz-opt';
      btn.textContent = optionText;
      btn.addEventListener('click', function () {
        if (answered) return;
        answered = true;
        var correct = i === q.correctIndex;
        Array.prototype.forEach.call(wrap.children, function (child, idx) {
          child.disabled = true;
          if (idx === q.correctIndex) child.classList.add('is-correct');
          else if (idx === i && !correct) child.classList.add('is-incorrect');
        });
        feedbackEl.textContent = (correct ? 'Correct. ' : 'Not quite. ') + q.explanation;
        feedbackEl.className = 'quiz-q__feedback ' + (correct ? 'quiz-q__feedback--correct' : 'quiz-q__feedback--incorrect');
        onAnswered(correct);
      });
      wrap.appendChild(btn);
    });

    return wrap;
  }

  function buildNumeric(q, feedbackEl, onAnswered) {
    var wrap = document.createElement('div');
    wrap.className = 'quiz-q__numeric-row';

    var input = document.createElement('input');
    input.type = 'text';
    input.inputMode = 'text';
    input.autocomplete = 'off';
    input.setAttribute('aria-label', 'Your answer');

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn btn--primary';
    btn.textContent = 'Check';

    var answered = false;

    function check() {
      if (answered) return;
      var val = normalize(input.value);
      if (val === '') return;
      var accepted = q.accept.map(normalize);
      var correct = accepted.indexOf(val) !== -1;
      answered = true;
      input.disabled = true;
      btn.disabled = true;
      feedbackEl.textContent = (correct ? 'Correct. ' : ('Not quite — expected ' + q.accept[0] + '. ')) + q.explanation;
      feedbackEl.className = 'quiz-q__feedback ' + (correct ? 'quiz-q__feedback--correct' : 'quiz-q__feedback--incorrect');
      onAnswered(correct);
    }

    btn.addEventListener('click', check);
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); check(); }
    });

    wrap.appendChild(input);
    wrap.appendChild(btn);
    return wrap;
  }

  function initQuizStrip(strip) {
    var dataEl = strip.querySelector('.quiz-strip__data');
    var questionsEl = strip.querySelector('.quiz-strip__questions');
    if (!dataEl || !questionsEl) return;

    var questions;
    try {
      questions = JSON.parse(dataEl.textContent);
    } catch (err) {
      questionsEl.textContent = 'Could not load questions.';
      return;
    }

    var answeredCorrect = 0;
    var answeredTotal = 0;

    var scoreEl = document.createElement('div');
    scoreEl.className = 'quiz-strip__score';
    scoreEl.setAttribute('aria-live', 'polite');

    function updateScore() {
      scoreEl.textContent = 'Score: ' + answeredCorrect + ' / ' + questions.length + ' correct (' + answeredTotal + ' answered)';
    }
    updateScore();

    questions.forEach(function (q) {
      var qEl = document.createElement('div');
      qEl.className = 'quiz-q';

      var promptEl = document.createElement('p');
      promptEl.className = 'quiz-q__prompt';
      promptEl.textContent = q.prompt;
      qEl.appendChild(promptEl);

      var feedbackEl = document.createElement('div');
      feedbackEl.className = 'quiz-q__feedback';
      feedbackEl.setAttribute('role', 'status');

      var onAnswered = function (correct) {
        answeredTotal++;
        if (correct) answeredCorrect++;
        updateScore();
      };

      var control;
      if (q.type === 'mcq') {
        control = buildMcq(q, feedbackEl, onAnswered);
      } else if (q.type === 'numeric') {
        control = buildNumeric(q, feedbackEl, onAnswered);
      } else {
        return;
      }

      qEl.appendChild(control);
      qEl.appendChild(feedbackEl);
      questionsEl.appendChild(qEl);
    });

    strip.appendChild(scoreEl);
  }

  document.addEventListener('DOMContentLoaded', function () {
    var strips = document.querySelectorAll('[data-quiz]');
    Array.prototype.forEach.call(strips, initQuizStrip);
  });
})();
