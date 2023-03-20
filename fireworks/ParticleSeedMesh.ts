import {ParticleMesh} from './ParticleMesh';
import{
  Vector3
} from 'three';
import{getOffsetXYZ, getOffsetRGBA} from './utils';
import{friction,ParticleType} from './contants';

export class ParticleSeedMesh extends ParticleMesh {
  constructor(particleSize: number, num: number, vels: Vector3[]) {
    super(particleSize, num, vels, ParticleType.SEED);
  }
  update(gravity: Vector3) {
    const { position, velocity, color } = this.mesh.geometry.attributes;
    const decrementRandom = () => (Math.random() > 0.3 ? 0.99 : 0.96);
    const decrementByVel = (v:number) => (Math.random() > 0.3 ? 0 : (1 - v) * 0.1);
    const shake = () => (Math.random() > 0.5 ? 0.05 : -0.05);
    const dice = () => Math.random() > 0.1;
    const _f = friction * 0.98;
    for (let i = 0; i < this.particleNum; i++) {
      const { x, y, z } = getOffsetXYZ(i);
      velocity.array[y] += gravity.y;
      velocity.array[x] *= _f;
      velocity.array[z] *= _f;
      velocity.array[y] *= _f;
      position.array[x] += velocity.array[x];
      position.array[y] += velocity.array[y];
      position.array[z] += velocity.array[z];
      if (dice()) position.array[x] += shake();
      if (dice()) position.array[z] += shake();
      const { a } = getOffsetRGBA(i);
      color.array[a] *= decrementRandom() - decrementByVel(color.array[a]);
      if (color.array[a] < 0.001) color.array[a] = 0;
    }
    position.needsUpdate = true;
    velocity.needsUpdate = true;
    color.needsUpdate = true;
  }
}