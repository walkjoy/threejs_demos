import {Vector3} from 'three';

const gravity = new Vector3(0, -0.005, 0);
const friction = 0.998;
const textureSize = 128.0;
const maxInstances = 5; //最好不要超过，不然卡顿

enum ParticleType {
  SEED='seed',
  Tail='tail'
} 
export { gravity, friction, textureSize, maxInstances, ParticleType };