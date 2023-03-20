import { getRandomNumInRange } from './utils';
import { Vector3, Group, MathUtils } from 'three';
import { gravity } from './contants';
import { ParticleMesh } from './ParticleMesh';
import { ParticleSeedMesh } from './ParticleSeedMesh';

/**
 * 烟花基类
 */
export class Firework {
  meshGroup: Group; // mesh组
  isExplode: boolean; // 是否炸开
  petalsNum: number; // 花瓣数
  duration: number; // 生命时长
  seed: ParticleMesh;
  flowerSizeRate: any;
  flower: ParticleMesh;
  particleSize: number; //粒子数

  constructor(particleSize: number) {
    this.meshGroup = new Group();
    this.isExplode = false;
    const max = 400;
    const min = 150;
    this.petalsNum = getRandomNumInRange(max, min);
    this.duration = 80;
    this.seed = this.getSeed();
    this.meshGroup.add(this.seed.mesh);
    this.flowerSizeRate = MathUtils.mapLinear(this.petalsNum, min, max, 0.3, 0.6);
    this.flower;
    this.particleSize = particleSize;
  }

  // 返回烟花的引子mesh（开始上升部分）
  getSeed() {
    const num = 40; // 引子的粒子数
    const vels = [];
    vels.push(new Vector3(0, Math.random() * 2 + 0.5, 0)); // 第一个引子粒子需要更快
    for (let i = 1; i < num; i++) {
      const vx = 0;
      const vy = Math.random() * 1.7 + 0.2;
      const vz = 0;
      vels.push(new Vector3(vx, vy, vz));
    }
    const pm = new ParticleSeedMesh(this.particleSize, num, vels);
    const x = Math.random() * 120 - 60;
    const y = -50;
    const z = Math.random() * 80 - 40;
    pm.mesh.position.set(x, y, z); // 随机生成烟花点燃位置
    return pm;
  }

	/**
	 * 烟花炸开
	 * @param pos 烟花绽放的位置
	 */
  explode(pos: Vector3) {
    this.isExplode = true;
    this.flower = this.getFlower(pos);
    this.meshGroup.add(this.flower.mesh);
    this.meshGroup.remove(this.seed.mesh);
    this.seed.disposeAll();
  }

  /**
   * 获得烟花炸开的粒子组
   * @param pos 烟花爆炸的位置
   * @returns
   */
  getFlower(pos: Vector3) {
    const num = this.petalsNum;
    const vels = [];
    let radius;
    const dice = Math.random();

    if (dice > 0.7) {
			// 中心爆
			radius = getRandomNumInRange(120, 100) * 0.01;
      for (let i = 0; i < num; i++) {
        const theta = MathUtils.degToRad(Math.random() * 360); 
        const phi = MathUtils.degToRad(Math.random() * 360);
        const vx = Math.sin(theta) * Math.cos(phi) * radius;
        const vy = Math.sin(theta) * Math.sin(phi) * radius;
        const vz = Math.cos(theta) * radius;
        const vel = new Vector3(vx, vy, vz);
        vel.multiplyScalar(this.flowerSizeRate);
        vels.push(vel);
      }
    } else {
			// 梯度螺旋爆
      const zStep = 180 / num;
      const trad = (360 * (Math.random() * 20 + 5)) / num;
      const xStep = trad;
      const yStep = trad;
      radius = getRandomNumInRange(120, 60) * 0.01;
      for (let i = 0; i < num; i++) {
        const sphereRate = Math.sin(MathUtils.degToRad(zStep * i));
        const vz = Math.cos(MathUtils.degToRad(zStep * i)) * radius;
        const vx = Math.cos(MathUtils.degToRad(xStep * i)) * sphereRate * radius;
        const vy = Math.sin(MathUtils.degToRad(yStep * i)) * sphereRate * radius;
        const vel = new Vector3(vx, vy, vz);
        vel.multiplyScalar(this.flowerSizeRate);
        vels.push(vel);
      }
    }

    const particleMesh = new ParticleMesh(this.particleSize, num, vels);
    particleMesh.mesh.position.set(pos.x, pos.y, pos.z);
    return particleMesh;
  }

	/**
	 * 更新烟花
	 * 未炸开则更新引线
	 * 炸开则更新烟花
	 * @param gravity 重力
	 */
  update(gravity: Vector3) {
    if (!this.isExplode) {
      this.drawTail();
    } else {
      this.flower.update(gravity);
      if (this.duration > 0) this.duration -= 1;
    }
  }

	// 更新引线
  drawTail() {
    this.seed.update(gravity);
    const { position, velocity } = this.seed.mesh.geometry.attributes;
    let count = 0;
    let isComplete;

    // 计算仍在上升粒子的数量
    for (let i = 0, l = velocity.array.length; i < l; i++) {
      const v = velocity.array[i];
      const index = i % 3;
      if (index === 1 && v > 0) {
        count++;
      }
    }

    isComplete = count == 0;
    if (!isComplete) return;

    // expolde if all seed particle start falling
    const { x, y, z } = this.seed.mesh.position;
    const flowerPos = new Vector3(x, y, z);
    let highestPos = 0;
    let offsetPos;
    for (let i = 0, l = position.array.length; i < l; i++) {
      const p = position.array[i];
      const index = i % 3;
      if (index === 1 && p > highestPos) {
        highestPos = p;
        offsetPos = new Vector3(position.array[i - 1], p, position.array[i + 2]);
      }
    }
    offsetPos && flowerPos.add(offsetPos);
    this.explode(flowerPos);
  }
}
