import * as twgl from './js/twgl-full.module.js';
import {gl, tagObject, clearVertexArray, escapeRE, not} from './shared.js';

const settings = Object.fromEntries(new URLSearchParams(window.location.search).entries());
const testGrepRE = new RegExp(escapeRE(settings.grep || ''));
const config = {};
document.querySelectorAll('[data-gman-debug-helper]').forEach(elem => {
  Object.assign(config, JSON.parse(elem.dataset.gmanDebugHelper));
});

import drawingTests from './tests/drawing-test.js';
import namingTests from './tests/naming-tests.js';
import enumTests from './tests/enum-tests.js';
import badDataTests from './tests/bad-data-tests.js';
import dataViewTests from './tests/data-view-tests.js';
import unsetUniformTests from './tests/unset-uniform-tests.js';
import zeroMatrixTests from './tests/zero-matrix-tests.js';
import ignoreUniformsTests from './tests/ignore-uniforms-tests.js';
import reportVaoTests from './tests/report-vao-tests.js';
import extensionEnumTests from './tests/extension-enum-tests.js';
import framebufferFeedbackTests from './tests/framebuffer-feedback-tests.js';
import bufferOverflowTests from './tests/buffer-overflow-tests.js';
import wrongNumberOfArgumentsTests from './tests/wrong-number-of-arguments-tests.js';
import unnamedObjectsTests from './tests/unnamed-objects-tests.js';
import drawReportsProgramAndVaoTests from './tests/draw-reports-program-and-vao-tests.js';
import uniformMismatchTests from './tests/uniform-mismatch-tests.js';
import uniformXXvTests from './tests/uniformXXv-tests.js';

const tests = [
  ...drawingTests,
  ...namingTests,
  ...enumTests,
  ...badDataTests,
  ...dataViewTests,
  ...unsetUniformTests,
  ...zeroMatrixTests,
  ...ignoreUniformsTests,
  ...reportVaoTests,
  ...extensionEnumTests,
  ...framebufferFeedbackTests,
  ...bufferOverflowTests,
  ...wrongNumberOfArgumentsTests,
  ...unnamedObjectsTests,
  ...drawReportsProgramAndVaoTests,
  ...uniformMismatchTests,
  ...uniformXXvTests,
];

function fail(...args) {
  logImpl('red', 'FAIL:', ...args);
}

function pass(...args) {
  logImpl('green', 'PASS:', ...args);
}

function log(...args) {
  logImpl('inherit', ...args);
}

function logImpl(color, ...args) {
  const elem = document.createElement('pre');
  elem.style.color = color;
  elem.textContent = args.join(' ');
  document.body.appendChild(elem);
}

function check(expect, actual, desc) {
  const actualNoBreaks = actual.replace(/\n/g, ' ');
  for (const expected of expect) {
    if (!expected.test(actualNoBreaks)) {
      fail(desc, ': expected:', expected, 'actual:', actual);
      return false;
    }
  }
  return true;
}

for (const {desc, expect, func} of tests) {
  if (!testGrepRE.test(desc)) {
    continue;
  }
  console.log(`\n\n--------------[ ${desc} ]---------------`);
  let actual = 'undefined';
  if (config.throwOnError === false) {
    const origFn = console.error;
    let errors = [];
    console.error = function(...args) {
      errors.push(args.join(' '));
    };
    func();
    console.error = origFn;
    if (errors.length) {
      actual = errors.join('\n');
      console.error(actual);
    }
  } else {
    try {
      func();
    } catch(e) {
      console.error(e);
      actual = e.toString();
    }
  }
  
  if (check(expect, actual, desc)) {
    pass(desc);
  }

  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  clearVertexArray();
}
