import { TweenMax, gsap } from 'gsap';
import MotionPathPlugin from 'gsap/MotionPathPlugin';
import { Mesh, MeshPhysicalMaterial } from 'three';
import { makeCube } from './utils';

gsap.registerPlugin(MotionPathPlugin);

const particleMat = new MeshPhysicalMaterial({
  transparent: true,
  opacity: 0.5,
  color: 0xffffff,
});
export class SmokingParticle {
  color: {
    r: number;
    g: number;
    b: number;
  };
  mesh: Mesh;
  speedRate: number;
  maxSneezingRate: number;
  addToAwaitingParticles: (p: any) => void;
  constructor(speedRate: number, maxSneezingRate: number, addToAwaitingParticles: (p: any) => void) {
    this.speedRate = speedRate;
    this.maxSneezingRate = maxSneezingRate;
    this.color = {
      r: 0,
      g: 0,
      b: 0,
    };
    this.addToAwaitingParticles = addToAwaitingParticles;
    this.mesh = makeCube(particleMat, 4, 4, 4, 0, 0, 0, 0, 0, 0);
    this.addToAwaitingParticles(this);
  }

  initialize() {
    this.mesh.rotation.x = 0;
    this.mesh.rotation.y = 0;
    this.mesh.rotation.z = 0;

    this.mesh.position.x = 0;
    this.mesh.position.y = 0;
    this.mesh.position.z = 0;

    this.mesh.scale.x = 1;
    this.mesh.scale.y = 1;
    this.mesh.scale.z = 1;

    (this.mesh.material as any).opacity = 0.5;
    this.addToAwaitingParticles(this);
  }

  updateColor() {
    (this.mesh.material as any).color.setRGB(this.color.r, this.color.g, this.color.b);
  }

  // disposeAll(){
  //   this.mesh.geometry.dispose();
  //   (this.mesh.material as any).dispose();
  // }

  // 黑烟飞
  fly() {
    const _this = this;
    const speed = this.speedRate * 0.01;
    const ease = Strong.easeOut;
    const initX = this.mesh.position.x;
    const initY = this.mesh.position.y;
    const initZ = this.mesh.position.z;

    const bezier = {
      type: 'cubic',
      path: [
        {
          x: initX,
          y: initY,
          z: initZ,
        },
        {
          x: initX + 50 - Math.random() * 10,
          y: initY + 20 + Math.random() * 2,
          z: initZ - 60,
        },
        {
          x: initX + 50 + Math.random() * 20,
          y: initY + 30 + Math.random() * 5,
          z: initZ - 30,
        },
        {
          x: initX + 50 - Math.random() * 20,
          y: initY + 50 + Math.random() * 10,
          z: initZ,
        },
      ],
    };

    TweenMax.to(this.mesh.position, speed, {
      motionPath: bezier,
      ease: ease,
      // onComplete:()=>{
      //   _this.disposeAll();
      // }
    });
    TweenMax.to(this.mesh.rotation, speed, {
      x: Math.random() * Math.PI * 3,
      y: Math.random() * Math.PI * 3,
      ease: ease,
    });
    TweenMax.to(this.mesh.scale, speed, {
      x: Math.random() * 0.1,
      y: Math.random() * 0.1,
      z: Math.random() * 0.1,
      ease: ease,
    });
    TweenMax.to(this.mesh.material, speed, {
      opacity: 0,
      ease: ease,
      onComplete: function () {
        _this.initialize();
      },
    });
  }

  // 火星燃
  fire(fireRate: number) {
    const _this = this;
    const speed = 1 * this.speedRate;
    const ease = Strong.easeOut;
    const initX = this.mesh.position.x;
    const initY = this.mesh.position.y;
    const initZ = this.mesh.position.z;

    TweenMax.to(this.mesh.position, speed, {
      x: Math.random() > 0.5 ? initX + Math.random() * 10 : initX - Math.random() * 10,
      y: initY - 3 * fireRate,
      z: Math.max(initZ + 15 * fireRate, initZ + 40),
      ease: ease,
      // onComplete:()=>{
      //   _this.disposeAll();
      // }
    });
    TweenMax.to(this.mesh.rotation, speed, {
      x: Math.random() * Math.PI * 3,
      y: Math.random() * Math.PI * 3,
      ease: ease,
    });

    const bezierScale = [
      {
        x: 1,
        y: 1,
        z: 1,
      },
      {
        x: fireRate / this.maxSneezingRate + Math.random() * 0.3,
        y: fireRate / this.maxSneezingRate + Math.random() * 0.3,
        z: fireRate / this.maxSneezingRate + Math.random() * 0.1,
      },
      {
        x: fireRate / this.maxSneezingRate + Math.random() * 0.5,
        y: fireRate / this.maxSneezingRate + Math.random() * 0.5,
        z: fireRate / this.maxSneezingRate + Math.random() * 0.2,
      },
      {
        x: fireRate / this.maxSneezingRate + Math.random() * 0.6,
        y: fireRate / this.maxSneezingRate + Math.random() * 0.6,
        z: (fireRate * 2) / this.maxSneezingRate + Math.random() * 0.4,
      },
      {
        x: (fireRate * 2) / this.maxSneezingRate + Math.random() * 0.5,
        y: (fireRate * 2) / this.maxSneezingRate + Math.random() * 0.5,
        z: (fireRate * 4) / this.maxSneezingRate + Math.random() * 0.5,
      },
      {
        x: fireRate * 2 + Math.random() * 5,
        y: fireRate * 2 + Math.random() * 5,
        z: fireRate * 2 + Math.random() * 5,
      },
    ];

    TweenMax.to(this.mesh.scale, speed * 2, {
      motionPath: bezierScale,
      ease: ease,
      onComplete: function () {
        _this.initialize();
      },
    });

    TweenMax.to(this.mesh.material, speed, {
      opacity: 0,
      ease: ease,
    });

    const bezierColor = [
      {
        r: 255 / 255,
        g: 205 / 255,
        b: 74 / 255,
      },
      {
        r: 255 / 255,
        g: 205 / 255,
        b: 74 / 255,
      },
      {
        r: 255 / 255,
        g: 205 / 255,
        b: 74 / 255,
      },
      {
        r: 247 / 255,
        g: 34 / 255,
        b: 50 / 255,
      },
      {
        r: 0 / 255,
        g: 0 / 255,
        b: 0 / 255,
      },
    ];

    TweenMax.to(this.color, speed, {
      motionPath: bezierColor,
      ease: Strong.easeOut,
      onUpdate: function () {
        _this.updateColor();
      },
    });
  }
}
