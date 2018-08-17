// ==UserScript==
// @name govnokod: gost-vorec-text
// @namespace govnokod
// @description voretionizes long texts
// @include *://govnokod.ru/*
// @include *://www.govnokod.ru/*
// @version 0.2.1.1
// @grant none
// ==/UserScript==

var voretionize = (function gost_code() {
'use strict';

// http://gvforum.ru/viewtopic.php?pid=2376#p2376

// Для портирования с питона

function Set(arr) {
  this.set = Object.create(null);
  if(arr) this.add(arr);
}

Set.prototype.has = function(key) {
  return {}.hasOwnProperty.call(this.set, key);
};

Set.prototype.add = function(arr) {
  for(var i=0; i<arr.length; ++i)
    this.set[arr[i]] = true;
  return this;
};

function set(arr) {
  return (new Set(arr)).set;
}

function DefaultDict(def) {
  this.values = {};
  this.def = def || function(key){
    throw new Error(key + ' is not found');
  };
}

function sum(xs) {
  return xs.reduce(function(a,b){ return a+b; }, 0);
}

DefaultDict.prototype.set = function(key, value) {
  this.values[key] = value;
};

DefaultDict.prototype.has = function(key) {
  return key in this.values;
};

DefaultDict.prototype.get = function(key) {
  if(this.has(key)) return this.values[key];
  else return this.values[key] = this.def(key);
};

var random = {
  choice: function(array) {
    return array[Math.random() * array.length | 0];
  },
  random: function() {
    return Math.random();
  },
  randint: function(a, b) {
    return (Math.random() * (b-a) | 0) + a;
  }
};

function map(f, xs) {
  return [].map.call(xs, f);
}

function filter(f, xs) {
  return [].filter.call(xs, f);
}

function endswith(str, end) {
  if(str.length < end.length) return false;
  return str.substr(-end.length, end.length) === end;
}

function title(str) {
  return str
    .split(/([\s.,/:;'"\-\\_+=()!`~#$%^&*\[\]<>?/]+)/)
    .map(function(w) { return w.length ? w[0].toUpperCase() + w.substr(1) : ''; })
    .join('');
}

function len(x) {
  return x.length;
}

function forRange(a, f) {
  for(var i=0; i<a; ++i) f(i);
}

////////////////////////////////////////////////////////////////////////////////

var NEW_LINE_CHANCE = 0.5;

var ALLOWED_CHARS = new Set('йцукенгшщзхъфывапролджэячсмитьбюё')
      .add('ЙЦУКЕНГШЩЗХЪФЫВАПРОЛДЖЭЯЧСМИТЬБЮЁ')
      .add('qwertyuiopasdfghjklzxcvbnm')
      .add('QWERTYUIOPASDFGHJKLZXCVBNM')
      .add('!?.,')
      .add('-')
//    .add('—')
//    .add('\'";=#$%^&*`~\\:/')
//    .add('()[]<>«»')
      .add('1234567890')
      .add('…')
      .add('\n ')
      .set;

var BASE = 3;
var SYLLABLE = 1;
var TEXT_LEN = 1900;

function random_bool(chance) {
    return random.random() <= chance;
}

function get_normalized_text(lines) {
    var text = lines.join(' ').toLowerCase();
    
    text = text.replace(/\r/g, '');
    text = text.replace(/ё/g, 'е');
    
    // filter characters
    text = map(function(e){return e in ALLOWED_CHARS ? e : ' '; }, text).join('');
    // filter multiple spaces
    text = filter(function(e){ return e != ''; }, text.split(' ')).join(' ');
    // filter multiple new lines and leading spaces
    text = filter(function(e){ return e != ''; }, map(function(e){ return e.trim(); }, text.split('\n'))).join('\n');

    // dirty hack - filter spaces before punctuation characters
    return text.replace(/ ([.,!?])/g, '$1');
}


function is_new_sentence(word) {
    return endswith(word, '.') || endswith(word, '!') || endswith(word, '?') || endswith(word, '\n');
}


function capitalize_text(text) {
    var words = text.split(' ');
    words[0] = title(words[0])
    for(var i=1; i<words.length; ++i)
        if (is_new_sentence(words[i - 1]))
            words[i] = title(words[i]);


    text = words.join(' ').trim();
    var lines = text.split('\n');
    for(var i=0; i<lines.length; ++i)
        words = lines[i].split(' ');
        if (len(words) > 0)
            words[0] = title(words[0]);
        lines[i] = words.join(' ');
    text = lines.join('\n');

    if(text[text.length - 1] == '.')
        return text;
    else
        return text + '.';
}


function gen_pairs(text, base, syllable) {
    var pairs = new DefaultDict(function() { return []; });
    var words = text.split(' ');
    forRange(len(words) - base, function(i) {
        pairs.get(words.slice(i,i + base)).push(words.slice(i + base,i + base + syllable));
    });
    return pairs;
}


function get_next_symbol(elem, pairs) {
    if (len(pairs.get(elem)) > 0)
        return random.choice(pairs.get(elem));
    else
        return '';
}


function gen_text(start, pairs, base, syllable, text_len) {
    var words = start;
    text_len -= sum(map(len, start));
    while (text_len > 0 && start != '') {
        start = get_next_symbol(words.slice(len(words) - base), pairs);
        words = words.concat(start);
        text_len -= sum(map(len, start));
    }
    return words.join(' ');
}

return function main(text) {
    var lines = text.split(/\r\n|\r|\n/);
    text = get_normalized_text(lines);

    var pairs = gen_pairs(text, BASE, SYLLABLE);

    var sentences = text.split('. ');
    var start = random.choice(sentences).split(' ').slice(0, BASE);
    sentences = null;
    text = null;
    text = gen_text(start, pairs, BASE, SYLLABLE, TEXT_LEN);
    text = capitalize_text(text);

    return text;
}

})();

// Для браузера
if(typeof window !== 'undefined') (function(){
  
  function es(s){ return Array.prototype.slice.apply(document.querySelectorAll(s)); }
  function e(id){ return document.getElementById(id); }

  var VOREC_TAG = '[size=10][color=white]#вореции[/color][/size]';
  var VOREC_RE = /#вореции$/g;
  
  var comments = es('.comment-text').map(function(x){
    return x.textContent.replace(VOREC_RE, '');
  });
  var text = comments.join(' ');
  var answerButtons = es('a.answer, h3>a');
  
  if(text.length < 200 || !answerButtons.length) return;
  
  answerButtons.forEach(function(button) {
    if(button.parentNode.querySelector('.long-bred-answer-gost')) return;
    
    var vorecButton = document.createElement('a');
    vorecButton.href = '#';
    vorecButton.textContent = 'Вореционировать';
    vorecButton.className = 'answer long-bred-answer-gost';
    vorecButton.style.marginLeft = '1ex';
    vorecButton.addEventListener('click', function(event) {
      button.onclick();
      try {
        e('formElm_text').value = voretionize(text) + VOREC_TAG;
      } catch(e) {
        console.error(e);
      }
      if(event.preventDefault) event.preventDefault();
      return false;
    });
    button.parentNode.appendChild(vorecButton);
  });
  
})();

// Для Node.js
else if (typeof module !== 'undefined') (function(){
  
  module.exports = voretionize;
  
  if(require.main === module) {
    var fs = require('fs');
    var inName = process.argv[2], outName = process.argv[3];
    fs.writeFileSync(outName, voretionize(String(fs.readFileSync(inName))));
  }
})();
