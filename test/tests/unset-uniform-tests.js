import * as twgl from '../js/twgl-full.module.js';
import {gl, tagObject, not} from '../shared.js';

/* global document */

export default [
  {
    desc: 'test unset uniforms',
    expect: [
      /ambient/,
      /diffuseColor/,
      not('diffuseTex'),
    ],
    func() {
      const prg = twgl.createProgram(gl, [
        `
          void main() {
             gl_Position = vec4(0);
             gl_PointSize = 1.0;
          }
        `,
        `
          precision mediump float;
          uniform vec4 diffuseColor;
          uniform vec4 ambient;
          uniform sampler2D diffuseTex;
          void main() {
            gl_FragColor = diffuseColor + ambient + texture2D(diffuseTex, vec2(0));
          }
        `,
      ]);
      tagObject(prg, 'uniforms-program');
      gl.useProgram(prg);
      gl.drawArrays(gl.POINTS, 0, 1);  // error, unset uniforms
    },
  },
  {
    desc: 'test unset uniforms array',
    expect: [
      /emissive\[1\]/,
      /emissive\[2\]/,
      not('emissive"'),
      not('emissive[0]'),
      not('emissive[3]'),
      not('diffuseColor'),
      not('ambient'),
    ],
    func() {
      const prg = twgl.createProgram(gl, [
        `
          void main() {
             gl_Position = vec4(0);
             gl_PointSize = 1.0;
          }
        `,
        `
          precision mediump float;
          uniform vec4 diffuseColor[3];
          uniform vec4 ambient[4];
          uniform vec4 emissive[4];
          void main() {
            gl_FragColor = diffuseColor[2] + ambient[3] + emissive[3];
          }
        `,
      ]);
      tagObject(prg, 'uniforms-program');
      gl.useProgram(prg);
      gl.uniform4fv(gl.getUniformLocation(prg, 'diffuseColor'), new Float32Array(16));
      gl.uniform4fv(gl.getUniformLocation(prg, 'ambient[0]'), new Float32Array(4));
      gl.uniform4fv(gl.getUniformLocation(prg, 'ambient[1]'), new Float32Array(4));
      gl.uniform4fv(gl.getUniformLocation(prg, 'ambient[2]'), new Float32Array(4));
      gl.uniform4f(gl.getUniformLocation(prg, 'ambient[3]'), 2, 3, 4, 5);
      gl.uniform4fv(gl.getUniformLocation(prg, 'emissive[3]'), [1, 2, 3, 4]);
      gl.uniform4fv(gl.getUniformLocation(prg, 'emissive[0]'), [1, 2, 3, 4]);
      gl.drawArrays(gl.POINTS, 0, 1);  // error, unset uniforms
    },
  },
  {
    desc: 'test unset uniform sampler',
    expect: [/ambient/, /diffuseColor/, /diffuseTex/],
    func() {
      const gl = document.createElement('canvas').getContext('webgl');
      const ext = gl.getExtension('GMAN_debug_helper');
      if (ext) {
        ext.setConfiguration({failUnsetSamplerUniforms: true});
      }
      const tagObject = ext ? ext.tagObject.bind(ext) : () => {};
      const prg = twgl.createProgram(gl, [
        `
          void main() {
             gl_Position = vec4(0);
             gl_PointSize = 1.0;
          }
        `,
        `
          precision mediump float;
          uniform vec4 diffuseColor;
          uniform vec4 ambient;
          uniform sampler2D diffuseTex;
          void main() {
            gl_FragColor = diffuseColor + ambient + texture2D(diffuseTex, vec2(0));
          }
        `,
      ]);
      tagObject(prg, 'uniforms-program-with-samplers');
      gl.useProgram(prg);
      gl.drawArrays(gl.POINTS, 0, 1);  // error, unset uniforms
    },
  },
];