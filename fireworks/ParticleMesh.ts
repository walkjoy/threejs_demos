import {
  Vector3,
  Float32BufferAttribute,
  RawShaderMaterial,
  AdditiveBlending,
  Points,
  BufferGeometry,
  Texture,
  FloatType,
} from 'three';
import { getOffsetXYZ, getOffsetRGBA, getRandomNumInRange } from './utils';
import { friction, textureSize, ParticleType } from './contants';

const getTexture = () => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  const diameter = textureSize;
  canvas.width = diameter;
  canvas.height = diameter;
  const canvasRadius = diameter / 2;

  drawRadialGradation(ctx as any, canvasRadius, canvas.width, canvas.height);
  const texture = new Texture(canvas);
  texture.type = FloatType;
  texture.needsUpdate = true;
  return texture;
};

// 渐变材质
const drawRadialGradation = (ctx: CanvasRenderingContext2D, canvasRadius: number, canvasW: number, canvasH: number) => {
  if (!ctx) return;
  ctx.save();
  const gradient = ctx.createRadialGradient(canvasRadius, canvasRadius, 0, canvasRadius, canvasRadius, canvasRadius);
  gradient.addColorStop(0.0, 'rgba(255,255,255,0)');
  gradient.addColorStop(0.1, 'rgba(255,255,255,0.9)');
  gradient.addColorStop(0.5, 'rgba(255,255,255,0.5)');
  gradient.addColorStop(1.0, 'rgba(255,255,255,0.0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvasW, canvasH);
  ctx.restore();
};

const canvasTexture = getTexture();

export class ParticleMesh {
  particleNum: number; //粒子数
  timerStartFading: number; // 消失倒计时
  mesh: any;

  constructor(particleSize: number, num: number, vels: Array<Vector3>, type?: ParticleType) {
    this.particleNum = num;
    this.timerStartFading = 10;
    this.mesh = getPointMesh(particleSize, num, vels, type);
  }

  /**
   * 更新粒子
   * @param gravity 
   */
  update(gravity: Vector3) {
    if (this.timerStartFading > 0) this.timerStartFading -= 0.3;
    const { position, velocity, color } = this.mesh.geometry.attributes;
    const decrementRandom = () => (Math.random() > 0.5 ? 0.98 : 0.96);
    const decrementByVel = (v: number) => (Math.random() > 0.5 ? 0 : (1 - v) * 0.1);
    for (let i = 0; i < this.particleNum; i++) {
      const { x, y, z } = getOffsetXYZ(i);
      // delta(v) = a*t
      velocity.array[y] += gravity.y ;
      velocity.array[x] *= friction;
      velocity.array[z] *= friction;
      velocity.array[y] *= friction;

      // delta(p) = v * t
      position.array[x] += velocity.array[x];
      position.array[y] += velocity.array[y];
      position.array[z] += velocity.array[z];

      //改变粒子颜色透明度
      const { a } = getOffsetRGBA(i);
      if (this.timerStartFading <= 0) { 
        color.array[a] *= decrementRandom() - decrementByVel(color.array[a]);
        if (color.array[a] < 0.001) color.array[a] = 0;
      }
    }
    position.needsUpdate = true;
    velocity.needsUpdate = true;
    color.needsUpdate = true;
  }
  disposeAll() {
    this.mesh.geometry.dispose();
    this.mesh.material.dispose();
  }
}

const getPointMesh = (particleSize: number, num: number, vels: Array<Vector3>, type?: ParticleType) => {
  // geometry
  const bufferGeometry = new BufferGeometry();
  const vertices = [];
  const velocities = [];
  const colors = [];
  const adjustSizes = [];
  const colorType = Math.random() > 0.3 ? 'single' : 'multiple';
  const fixedRGBA = [Math.random(), Math.random(), Math.random(), 1];

  for (let i = 0; i < num; i++) {
    const pos = new Vector3(0, 0, 0);
    vertices.push(pos.x, pos.y, pos.z);
    velocities.push(vels[i].x, vels[i].y, vels[i].z);
    let size;

    if (type === ParticleType.SEED) {
      size = Math.pow(vels[i].y, 2) * 0.04;
      if (i === 0) size *= 1.1;
      colors.push(1.0, 1.0, 1.0, 1.0);
    } else if (type === ParticleType.Tail) {
      size = Math.random() * 0.1 + 0.1;
    } else {
      size = getRandomNumInRange(particleSize, 10) * 0.001;
      if (colorType === 'multiple') {
        colors.push(Math.random(), Math.random(), Math.random(), 1.0);
      } else {
        colors.push(...fixedRGBA);
      }
    }
    adjustSizes.push(size);
  }

  bufferGeometry.setAttribute('position', new Float32BufferAttribute(vertices, 3));
  bufferGeometry.setAttribute('velocity', new Float32BufferAttribute(velocities, 3));
  bufferGeometry.setAttribute('color', new Float32BufferAttribute(colors, 4));
  bufferGeometry.setAttribute('adjustSize', new Float32BufferAttribute(adjustSizes, 1));

  // material
  const shaderMaterial = new RawShaderMaterial({
    uniforms: {
      size: {
        type: 'f',
        value: textureSize,
      } as any,
      texture: {
        type: 't',
        value: canvasTexture,
      } as any,
    },
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    vertexShader: `precision mediump float;
    uniform mat4 projectionMatrix;
    uniform mat4 modelViewMatrix;
    uniform float size;
    uniform vec3 cameraPosition;
    attribute vec3 position;
    attribute float adjustSize;
    attribute vec3 velocity;
    attribute vec4 color;
    varying vec4 vColor;
    void main() {
        vColor = color;
        vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = size * adjustSize * (100.0 / length(modelViewPosition.xyz));
        gl_Position = projectionMatrix * modelViewPosition;
    }`,
    fragmentShader: `precision mediump float;
    uniform sampler2D texture;
    varying vec4 vColor;
    void main() {
        vec4 color = vec4(texture2D(texture, gl_PointCoord));
        gl_FragColor = color * vColor;
    }`,
  });

  return new Points(bufferGeometry, shaderMaterial);
};
