(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Zcroll = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
/**
 * https://github.com/gre/bezier-easing
 * BezierEasing - use bezier curve for transition easing function
 * by Gaëtan Renaudeau 2014 - 2015 – MIT License
 */

// These values are established by empiricism with tests (tradeoff: performance VS precision)
var NEWTON_ITERATIONS = 4;
var NEWTON_MIN_SLOPE = 0.001;
var SUBDIVISION_PRECISION = 0.0000001;
var SUBDIVISION_MAX_ITERATIONS = 10;

var kSplineTableSize = 11;
var kSampleStepSize = 1.0 / (kSplineTableSize - 1.0);

var float32ArraySupported = typeof Float32Array === 'function';

function A (aA1, aA2) { return 1.0 - 3.0 * aA2 + 3.0 * aA1; }
function B (aA1, aA2) { return 3.0 * aA2 - 6.0 * aA1; }
function C (aA1)      { return 3.0 * aA1; }

// Returns x(t) given t, x1, and x2, or y(t) given t, y1, and y2.
function calcBezier (aT, aA1, aA2) { return ((A(aA1, aA2) * aT + B(aA1, aA2)) * aT + C(aA1)) * aT; }

// Returns dx/dt given t, x1, and x2, or dy/dt given t, y1, and y2.
function getSlope (aT, aA1, aA2) { return 3.0 * A(aA1, aA2) * aT * aT + 2.0 * B(aA1, aA2) * aT + C(aA1); }

function binarySubdivide (aX, aA, aB, mX1, mX2) {
  var currentX, currentT, i = 0;
  do {
    currentT = aA + (aB - aA) / 2.0;
    currentX = calcBezier(currentT, mX1, mX2) - aX;
    if (currentX > 0.0) {
      aB = currentT;
    } else {
      aA = currentT;
    }
  } while (Math.abs(currentX) > SUBDIVISION_PRECISION && ++i < SUBDIVISION_MAX_ITERATIONS);
  return currentT;
}

function newtonRaphsonIterate (aX, aGuessT, mX1, mX2) {
 for (var i = 0; i < NEWTON_ITERATIONS; ++i) {
   var currentSlope = getSlope(aGuessT, mX1, mX2);
   if (currentSlope === 0.0) {
     return aGuessT;
   }
   var currentX = calcBezier(aGuessT, mX1, mX2) - aX;
   aGuessT -= currentX / currentSlope;
 }
 return aGuessT;
}

function LinearEasing (x) {
  return x;
}

module.exports = function bezier (mX1, mY1, mX2, mY2) {
  if (!(0 <= mX1 && mX1 <= 1 && 0 <= mX2 && mX2 <= 1)) {
    throw new Error('bezier x values must be in [0, 1] range');
  }

  if (mX1 === mY1 && mX2 === mY2) {
    return LinearEasing;
  }

  // Precompute samples table
  var sampleValues = float32ArraySupported ? new Float32Array(kSplineTableSize) : new Array(kSplineTableSize);
  for (var i = 0; i < kSplineTableSize; ++i) {
    sampleValues[i] = calcBezier(i * kSampleStepSize, mX1, mX2);
  }

  function getTForX (aX) {
    var intervalStart = 0.0;
    var currentSample = 1;
    var lastSample = kSplineTableSize - 1;

    for (; currentSample !== lastSample && sampleValues[currentSample] <= aX; ++currentSample) {
      intervalStart += kSampleStepSize;
    }
    --currentSample;

    // Interpolate to provide an initial guess for t
    var dist = (aX - sampleValues[currentSample]) / (sampleValues[currentSample + 1] - sampleValues[currentSample]);
    var guessForT = intervalStart + dist * kSampleStepSize;

    var initialSlope = getSlope(guessForT, mX1, mX2);
    if (initialSlope >= NEWTON_MIN_SLOPE) {
      return newtonRaphsonIterate(aX, guessForT, mX1, mX2);
    } else if (initialSlope === 0.0) {
      return guessForT;
    } else {
      return binarySubdivide(aX, intervalStart, intervalStart + kSampleStepSize, mX1, mX2);
    }
  }

  return function BezierEasing (x) {
    // Because JavaScript number are imprecise, we should guarantee the extremes are right.
    if (x === 0) {
      return 0;
    }
    if (x === 1) {
      return 1;
    }
    return calcBezier(getTForX(x), mY1, mY2);
  };
};

},{}],2:[function(require,module,exports){
"use strict";

const bezier = require('bezier-easing');

class ZcrollFactory {
  constructor () {
    this.selectors = [];
    this.currentZcroller = null;
    this.bezier = [.87,0,.87,1.01];
    this.frames = 60;
  }

  createZcroller () {
    this.currentZcroller = new Zcroll();

    return this;
  }

  setBezier (bezier) {
    if ( ! this.currentZcroller) {
      console.log("No se creo un Zcroller previamente");
      return false;
    }
    this.bezier = bezier;
    return this;
  }

  setFrames (frames) {
    if ( ! this.currentZcroller) {
      console.log("No se creo un Zcroller previamente");
      return false;
    }
    this.frames = frames;
    return this;
  }

  applyZcroll (selector) {
    let nodeList = document.querySelectorAll(selector);
    if ( ! nodeList ) {
      console.log("ningun nodo encontrado en applyZcroll");
      return false;
    }

    //
    this.currentZcroller.bezier = this.bezier;
    this.currentZcroller.frames = this.frames;

    nodeList.forEach(n => {
      n.addEventListener('click', this.currentZcroller.smoothScroll());
    });

    this.selectors.push({selector: selector, Zcroller: this.currentZcroller});

    this.resetsProp();
  }

  resetsProp () {
    this.currentZcroller = null;
    this.frames = 60;
    this.bezier = [.87,0,.87,1.01];
  }

  destroyAll() {
    this.selectors.forEach(s => {
      let nodeList = document.querySelectorAll(s.selector);
      if ( ! nodeList) return;
      nodeList.forEach(n => {
        n.removeEventListener('click', s.Zcroller.smoothScroll());
      })
    });
    this.selectors.empty();
  }

}

class Zcroll {
    constructor () {
      this.frames = null;
      this.bezier = null;
      this.easer = null;
    }

    smoothScroll () {

      let context = this;
      context.easer = bezier(context.bezier[0], context.bezier[1], context.bezier[2], context.bezier[3]);

      return function(e) {
        e.preventDefault();

        if ( ! e.target.attributes.href) return;

        let selector = e.target.attributes.href.value;

        let element = document.querySelector(selector);
        let offsetY = element.offsetTop;

        if (offsetY > document.documentElement.clientHeight) {
          console.log((offsetY - document.documentElement.clientHeight) + element.offsetHeight)
          offsetY = (offsetY - document.documentElement.clientHeight) + element.offsetHeight;
        }

        let currentPosition = window.scrollY;
        let offsetScroll = offsetY - currentPosition;

        let frame = 1 / context.frames;
        let route = [];

        for (let i = 0; i <= context.frames; i += 1) {
          let acuracy = (1/context.frames)*i;
          let p = context.easer(acuracy) * offsetScroll;
          p = Math.round(p);
          p = currentPosition + p;
          p = (p < 0) ? 0 : p;
          route.push(p);
        }

        window.requestAnimationFrame(context.animateScroll(route))
      }
    }

    animateScroll(routes) {
        let currentFrame = 0;
        return function animationProcess () {

          console.log(routes[currentFrame]);
          window.scrollTo(0,routes[currentFrame]);
          currentFrame++;

          if (currentFrame > routes.length-1)
            return

          window.requestAnimationFrame(animationProcess);

        }
    }

}

module.exports = new ZcrollFactory();
},{"bezier-easing":1}]},{},[2])(2)
});
