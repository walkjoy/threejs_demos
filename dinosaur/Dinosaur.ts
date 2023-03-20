import {
  Vector3,
  Mesh,
  Group,
  MeshToonMaterial,
  Matrix4,
  CylinderGeometry,
  LineBasicMaterial,
  Line,
  BufferGeometry,
  TorusGeometry,
  BufferAttribute,
} from 'three';
import { makeCube } from './utils';
import { TweenMax, TweenLite } from 'gsap';

const greenMat = new MeshToonMaterial({
  color: 0x267326,
});

const lightGreenMat = new MeshToonMaterial({
  color: 0x95c088,
});

const yellowMat = new MeshToonMaterial({
  color: 0xfdde8c,
});

const redMat = new MeshToonMaterial({
  color: 0xcb3e4c,
});

const whiteMat = new MeshToonMaterial({
  color: 0xfaf3d7,
});

const brownMat = new MeshToonMaterial({
  color: 0x874a5c,
});

const blackMat = new MeshToonMaterial({
  color: 0x403133,
});

const tailMat = new LineBasicMaterial({
  color: 0x5da683,
  linewidth: 5,
});

export class Dinosaur {
  isSneezing: boolean; //是否正在打喷嚏
  neckLen: number; // 脖子长度（身体与头部在z轴上的距离）
  tailAmplitude: number; // 尾巴振幅
  tailAngle: number; // 尾巴摆动角度
  tailSpeed: number; // 尾巴摆动速度
  wingAmplitude: number; // 翅膀振幅
  wingAngle: number; // 翅膀摆动角度
  wingSpeed: number; // 翅膀摆动速度
  speedRate: number; // 速率
  maxSneezingRate: number; // 最大打喷嚏速率

  meshGroup: Group; // 全部mesh
  body: Group; // 身体部分集合
  tail: Group; //尾部集合
  head: Group; // 头部集合
  mouth: Group; // 嘴部集合
  legs: Group; //腿部集合

  face: Mesh; // 脸部
  hornL: Mesh; // 左角
  hornR: Mesh; // 右角
  earL: Mesh; // 左耳朵
  earR: Mesh; // 右耳朵
  eyeL: Mesh; // 左眼睛
  eyeR: Mesh; // 右眼睛
  noseL: Mesh; // 左鼻孔
  noseR: Mesh; // 右鼻孔
  irisL: Mesh; //左虹膜
  irisR: Mesh; // 右虹膜
  jaw: Mesh; // 下巴
  tongue: Mesh; // 舌头
  lips: Mesh; // 嘴唇
  cheekL: Mesh; // 左脸颊
  cheekR: Mesh; // 右脸颊

  belly: Mesh; // 腹部
  wingL: Mesh; // 左翅膀
  wingR: Mesh; // 右翅膀
  finBody1: Mesh; // 第一个背鳍
  finBody2: Mesh; // 第二个背鳍
  finBody3: Mesh; // 第三个背鳍

  tailLine: Line; // 尾巴线
  tailTip: Mesh; // 尾巴尖儿

  legFL: Mesh; // 左前足
  legFR: Mesh; // 右前足
  legBL: Mesh; // 左后足
  legBR: Mesh; // 右后足

  bodyW: number; // 身体横截面宽度
  bodyH: number; // 身体横截面高度
  bodyL: number; // 身体长度

  wingThick: number; //翅膀厚度

  faceW: number; // 脸部横截面宽度
  faceH: number; // 脸部横截面高度
  faceL: number; // 脸部长度

  fireRate: number;
  smokeTime: number;
  fireTime: number;

  constructor(pos: Vector3, speedRate: number, maxSneezingRate: number) {
    this.isSneezing = false;
    this.neckLen = 10;
    this.tailAmplitude = 3;
    this.tailAngle = 0;
    this.tailSpeed = 0.07;
    this.speedRate = speedRate;
    this.maxSneezingRate = maxSneezingRate;
    this.wingAmplitude = Math.PI / 8;
    this.wingAngle = 0;
    this.wingSpeed = 0.1;

    this.fireRate = 0;
    this.smokeTime = 0;
    this.fireTime = 0;

    this.meshGroup = new Group();
    this.body = new Group();
    this.tail = new Group();
    this.head = new Group();
    this.mouth = new Group();
    this.legs = new Group();

    this.bodyW = 30;
    this.bodyH = 30;
    this.bodyL = 40;
    this.wingThick = 5;
    this.faceW = 60;
    this.faceH = 50;
    this.faceL = 80;

    /** 初始化腹部 */
    this.belly = makeCube(greenMat, this.bodyW, this.bodyH, this.bodyL, pos.x, pos.y, pos.z, 0, 0, Math.PI / 4); // 肚子:体积30x30x40，位于中心点，沿z轴倾斜Math.PI /4度

    /** 初始化翅膀 */
    this.wingL = makeCube(
      yellowMat,
      this.wingThick,
      this.bodyH,
      this.bodyL / 2,
      pos.x + this.bodyW / 2,
      pos.y + this.bodyH / 2,
      pos.z,
      -Math.PI / 4,
      0,
      -Math.PI / 4,
    ); // 左翅膀: 体积5x30x20，位于中心点的左上方，x轴翻转Math.PI /4度，z轴翻转Math.PI /4度
    this.wingL.geometry.applyMatrix4(new Matrix4().makeTranslation(0, this.bodyH, 10)); // 平移一段距离（使其与身体边缘脱离）
    this.wingR = this.wingL.clone();
    this.wingR.position.x = -this.wingL.position.x; // 右翅膀与左翅膀x轴对称
    this.wingR.rotation.z = -this.wingL.rotation.z; // 右翅膀与左翅膀z轴

    /** 初始化沿z轴排放的3个背鳍片 */
    const pyramidGemo = new CylinderGeometry(0, 10, 10, 4, 1); // 四角锥
    this.finBody1 = new Mesh(pyramidGemo, greenMat);
    this.finBody1.scale.set(0.2, 1, 1); // 沿x轴拍扁，成为背鳍形状
    this.finBody1.position.z = pos.z + 10;
    this.finBody1.position.y = pos.y + this.bodyH - 7; //陷进入一点
    this.finBody2 = this.finBody1.clone();
    this.finBody2.position.z = pos.z + 0;
    this.finBody3 = this.finBody1.clone();
    this.finBody3.position.z = pos.z + -10;

    /** 初始化尾巴 */
    this.tail = new Group();
    this.tail.position.z = -20; // pos.z - this.bodyL / 2;
    this.tail.position.y = 10; // pos.y + this.bodyH / 3;

    // 尾巴线
    const points = [];
    points.push(new Vector3(0, 0, 0));
    points.push(new Vector3(0, 5, -10));
    points.push(new Vector3(0, -5, -20));
    points.push(new Vector3(0, 0, -30));
    const tailGeom = new BufferGeometry().setFromPoints(points);
    this.tailLine = new Line(tailGeom, tailMat);

    // 尾巴尖儿
    const tipGemo = pyramidGemo.clone();
    tipGemo.applyMatrix4(new Matrix4().makeRotationX(-90)); // 沿着X轴旋转90度
    this.tailTip = new Mesh(tipGemo, yellowMat);
    this.tailTip.scale.set(0.2, 1, 1);
    this.tailTip.position.z = -35; // pos.z - this.bodyL / 2 - n
    this.tailTip.position.y = 0; // pos.y

    this.tail.add(this.tailLine, this.tailTip); // 尾巴 = 尾巴线 + 尾巴尖

    this.body.add(this.belly, this.wingL, this.wingR, this.tail, this.finBody1, this.finBody2, this.finBody3); // Body = 腹部 + 翅膀 + 尾巴 + 背鳍

    /** 初始化头部 */
    const headCenterX = 0,
      headCenterY = pos.y + this.faceH / 2,
      headCenterZ = pos.z + this.faceL / 2 + this.bodyL / 2 + this.neckLen;

    // 脸部
    this.face = makeCube(greenMat, this.faceW, this.faceH, this.faceL, headCenterX, headCenterY, headCenterZ, 0, 0, 0); // 脸部:体积60x50x80，距离中心点（0，25，40）

    // 犄角
    const hornGeom = new CylinderGeometry(0, 6, 10, 4, 1);
    this.hornL = new Mesh(hornGeom, yellowMat);
    this.hornL.position.x = 10;
    this.hornL.position.y = this.faceH + 5; // face.pos.y + 5 (hornGeom.height / 2)
    this.hornL.position.z = headCenterZ - this.faceL / 2 + 6; // face.pos.z -  this.faceL / 2  + hornGeom.radiusBottom
    this.hornR = this.hornL.clone();
    this.hornR.position.x = -10;

    // 耳朵
    this.earL = makeCube(
      greenMat,
      5,
      20,
      10,
      headCenterX - this.faceW / 2 - 5,
      headCenterY + this.faceH / 2 + 5,
      headCenterZ - this.faceL / 2 + 5,
      -Math.PI / 4,
      0,
      Math.PI / 4,
    );

    this.earR = this.earL.clone();
    this.earR.position.x = -this.earL.position.x;
    this.earR.rotation.z = -this.earL.rotation.z;

    // 嘴部
    this.mouth.position.x = headCenterX;
    this.mouth.position.y = pos.y; // pos.y + this.faceH / n?;
    this.mouth.position.z = headCenterZ + this.faceL / 2 - 30; //pos.z + this.faceL - jawL = 0 + 80 - 30 = 50;

    // 嘴部-下巴
    this.jaw = makeCube(greenMat, 30, 10, 30, 0, -5, 15, 0, 0, 0); // 体积：30x10x30
    // 嘴部-舌头
    this.tongue = makeCube(redMat, 20, 10, 20, 0, -3, 15, 0, 0, 0);

    // 嘴唇
    const lipsGeom = new TorusGeometry(6, 2, 2, 10, Math.PI);
    this.lips = new Mesh(lipsGeom, blackMat);
    this.lips.position.x = headCenterX;
    this.lips.position.y = pos.y + 5;
    this.lips.position.z = headCenterZ + this.faceL / 2 + 1;
    this.lips.rotation.z = -Math.PI;

    this.mouth.add(this.jaw, this.tongue);

    // 脸颊
    this.cheekL = makeCube(
      lightGreenMat,
      4,
      20,
      20,
      headCenterX - this.faceW / 2,
      headCenterY,
      headCenterZ + this.faceL / 5,
      0,
      0,
      0,
    );
    this.cheekR = this.cheekL.clone();
    this.cheekR.position.x = headCenterX + this.faceW / 2;

    // 眼睛
    this.eyeL = makeCube(
      whiteMat,
      10,
      22,
      22,
      headCenterX - this.faceW / 2,
      headCenterY + this.faceH / 5,
      headCenterZ - this.faceL / 3,
      0,
      0,
      0,
    );
    this.eyeR = this.eyeL.clone();
    this.eyeR.position.x = headCenterX + this.faceW / 2;

    // 虹膜
    this.irisL = makeCube(
      brownMat,
      12,
      12,
      12,
      headCenterX - this.faceW / 2,
      headCenterY + this.faceH / 5,
      headCenterZ - this.faceL / 3,
      0,
      0,
      0,
    );
    this.irisR = this.irisL.clone();
    this.irisR.position.x = headCenterX + this.faceW / 2;

    // 鼻子
    this.noseL = makeCube(
      blackMat,
      5,
      5,
      4,
      headCenterX - this.faceW / 4,
      headCenterY + this.faceH / 6,
      headCenterZ + this.faceL / 2,
      0,
      0,
      0,
    );
    this.noseR = this.noseL.clone();
    this.noseR.position.x = headCenterX + this.faceW / 4;

    this.head.add(
      this.face,
      this.mouth,
      this.earL,
      this.earR,
      this.hornL,
      this.hornR,
      this.lips,
      this.cheekL,
      this.cheekR,
      this.eyeL,
      this.eyeR,
      this.noseL,
      this.noseR,
      this.irisL,
      this.irisR,
    );

    /** 初始化腿部 */
    this.legFL = makeCube(
      greenMat,
      15,
      10,
      20,
      pos.x - this.bodyW / 2,
      pos.y - this.bodyH,
      pos.z + this.bodyL / 3,
      0,
      0,
      0,
    );
    this.legFR = this.legFL.clone();
    this.legFR.position.x = pos.x + this.bodyW / 2;
    this.legBL = this.legFL.clone();
    this.legBL.position.z = pos.z - this.bodyL / 3;
    this.legBR = this.legFR.clone();
    this.legBR.position.z = pos.z - this.bodyL / 3;

    this.legs.add(this.legFR, this.legFL, this.legBL, this.legBR);

    /** FINAL */
    this.meshGroup.add(this.body, this.head, this.legs);
    // this.meshGroup.traverse(function (object) {
    //   if (object instanceof Mesh) {
    //     object.castShadow = true;
    //     object.receiveShadow = true;
    //   }
    // });
  }

  update() {
    if (this.isSneezing) return;

    this.tailAngle += this.tailSpeed / this.speedRate;
    this.wingAngle += this.wingSpeed / this.speedRate;

    // 更新尾巴线
    const prePosAttr = this.tailLine.geometry.getAttribute('position');
    prePosAttr.needsUpdate = true;
    let newPos = new Float32Array(prePosAttr.array);

    for (let i = 0; i < prePosAttr.count; i++) {
      newPos[i * 3] = Math.cos(this.tailAngle / 2 + (Math.PI / 10) * i) * this.tailAmplitude * i * i; // 改变x
      newPos[i * 3 + 1] = Math.sin(this.tailAngle - (Math.PI / 3) * i) * this.tailAmplitude * i * i; // 改变y
    }
    this.tailLine.geometry.setAttribute('position', new BufferAttribute(newPos, 3));

    // 更新尾巴尖
    this.tailTip.position.x = newPos[(prePosAttr.count - 1) * 3];
    this.tailTip.position.y = newPos[(prePosAttr.count - 1) * 3 + 1];
    this.tailTip.position.z = newPos[(prePosAttr.count - 1) * 3 + 2];

    // 更新翅膀
    this.wingL.rotation.z = -Math.PI / 4 + Math.cos(this.wingAngle) * this.wingAmplitude;
    this.wingR.rotation.z = Math.PI / 4 - Math.cos(this.wingAngle) * this.wingAmplitude;
  }

  prepareToSneeze(s: number) {
    const speed = 0.7 * this.speedRate;
    TweenLite.to(this.head.rotation, speed, {
      x: -s * 0.12,
      ease: Back.easeOut,
    });
    TweenLite.to(this.head.position, speed, {
      z: this.neckLen - s * 2.2,
      y: s * 2.2,
      ease: Back.easeOut,
    });
    TweenLite.to(this.mouth.rotation, speed, {
      x: s * 0.18,
      ease: Back.easeOut,
    });

    TweenLite.to(this.lips.position, speed / 2, {
      z: 75,
      y: 10,
      ease: Back.easeOut,
    });
    TweenLite.to(this.lips.scale, speed / 2, {
      x: 0,
      y: 0,
      ease: Back.easeOut,
    });

    TweenMax.to(this.noseL.scale, speed, {
      x: 1 + s * 0.1,
      y: 1 + s * 0.1,
      ease: Back.easeOut,
    });
    TweenMax.to(this.noseR.scale, speed, {
      x: 1 + s * 0.1,
      y: 1 + s * 0.1,
      ease: Back.easeOut,
    });
    TweenMax.to(this.eyeL.scale, speed, {
      y: 1 + s * 0.01,
      ease: Back.easeOut,
    });
    TweenMax.to(this.eyeR.scale, speed, {
      y: 1 + s * 0.01,
      ease: Back.easeOut,
    });
    TweenMax.to(this.irisL.scale, speed, {
      y: 1 + s * 0.05,
      z: 1 + s * 0.05,
      ease: Back.easeOut,
    });
    TweenMax.to(this.irisR.scale, speed, {
      y: 1 + s * 0.05,
      z: 1 + s * 0.05,
      ease: Back.easeOut,
    });
    TweenMax.to(this.irisL.position, speed, {
      y: 30 + s * 0.8,
      ease: Back.easeOut,
    });
    TweenMax.to(this.irisR.position, speed, {
      y: 30 + s * 0.8,
      ease: Back.easeOut,
    });
    TweenMax.to(this.earL.rotation, speed, {
      x: -s * 0.1,
      y: -s * 0.1,
      ease: Back.easeOut,
    });
    TweenMax.to(this.earR.rotation, speed, {
      x: -s * 0.1,
      y: s * 0.1,
      ease: Back.easeOut,
    });
    TweenMax.to(this.wingL.rotation, speed, {
      z: -Math.PI / 4 - s * 0.1,
      ease: Back.easeOut,
    });
    TweenMax.to(this.wingR.rotation, speed, {
      z: Math.PI / 4 + s * 0.1,
      ease: Back.easeOut,
    });
    TweenMax.to(this.body.rotation, speed, {
      x: -s * 0.05,
      ease: Back.easeOut,
    });
    TweenMax.to(this.body.scale, speed, {
      y: 1 + s * 0.01,
      ease: Back.easeOut,
    });
    TweenMax.to(this.body.position, speed, {
      z: -s * 2,
      ease: Back.easeOut,
    });

    TweenMax.to(this.tail.rotation, speed, {
      x: s * 0.1,
      ease: Back.easeOut,
    });
  }

  sneeze(s: number) {
    const _this = this;
    const sneezeEffect = 1 - s / this.maxSneezingRate;
    const speed = 0.1 * this.speedRate;
    this.fireTime = Math.round(s * 20 + 20);

    TweenLite.to(this.head.rotation, speed, {
      x: s * 0.05,
      ease: Back.easeOut,
    });
    TweenLite.to(this.head.position, speed, {
      z: this.neckLen + s * 2.4,
      y: -s * 0.4,
      ease: Back.easeOut,
    });

    TweenLite.to(this.mouth.rotation, speed, {
      x: 0,
      ease: Strong.easeOut,
    });

    TweenLite.to(this.lips.position, speed * 2, {
      z: 82,
      y: 5,
      ease: Strong.easeIn,
    });

    TweenLite.to(this.lips.scale, speed * 2, {
      x: 1,
      y: 1,
      ease: Strong.easeIn,
    });

    TweenMax.to(this.noseL.scale, speed, {
      y: sneezeEffect,
      ease: Strong.easeOut,
    });
    TweenMax.to(this.noseR.scale, speed, {
      y: sneezeEffect,
      ease: Strong.easeOut,
    });
    TweenMax.to(this.noseL.position, speed, {
      y: 40, // - (sneezeEffect * 5),
      ease: Strong.easeOut,
    });
    TweenMax.to(this.noseR.position, speed, {
      y: 40, // - (sneezeEffect * 5),
      ease: Strong.easeOut,
    });
    TweenMax.to(this.irisL.scale, speed, {
      y: sneezeEffect / 2,
      z: 1,
      ease: Strong.easeOut,
    });
    TweenMax.to(this.irisR.scale, speed, {
      y: sneezeEffect / 2,
      z: 1,
      ease: Strong.easeOut,
    });
    TweenMax.to(this.eyeL.scale, speed, {
      y: sneezeEffect / 2,
      ease: Back.easeOut,
    });
    TweenMax.to(this.eyeR.scale, speed, {
      y: sneezeEffect / 2,
      ease: Back.easeOut,
    });

    TweenMax.to(this.wingL.rotation, speed, {
      z: -Math.PI / 4 + s * 0.15,
      ease: Back.easeOut,
    });
    TweenMax.to(this.wingR.rotation, speed, {
      z: Math.PI / 4 - s * 0.15,
      ease: Back.easeOut,
    });

    TweenMax.to(this.body.rotation, speed, {
      x: s * 0.02,
      ease: Back.easeOut,
    });
    TweenMax.to(this.body.scale, speed, {
      y: 1 - s * 0.03,
      ease: Back.easeOut,
    });
    TweenMax.to(this.body.position, speed, {
      z: s * 2,
      ease: Back.easeOut,
    });

    TweenMax.to(this.irisL.position, speed * 7, {
      y: 35,
      ease: Back.easeOut,
    });
    TweenMax.to(this.irisR.position, speed * 7, {
      y: 35,
      ease: Back.easeOut,
    });
    TweenMax.to(this.earR.rotation, speed * 3, {
      x: s * 0.2,
      y: s * 0.2,
      ease: Back.easeOut,
    });
    TweenMax.to(this.earL.rotation, speed * 3, {
      x: s * 0.2,
      y: -s * 0.2,
      ease: Back.easeOut,
      onComplete: function () {
        _this.backToNormal(s);
        _this.fireRate = s / 100; // 缩小fire尺寸
      },
    });

    TweenMax.to(this.tail.rotation, speed * 3, {
      x: -s * 0.1,
      ease: Back.easeOut,
    });
  }

  backToNormal(s: number) {
    const _this = this;
    const speed = 1 * this.speedRate;
    TweenLite.to(this.head.rotation, speed, {
      x: 0,
      ease: Strong.easeInOut,
    });
    TweenLite.to(this.head.position, speed, {
      z: this.neckLen,
      y: 0,
      ease: Back.easeOut,
    });
    TweenMax.to(this.noseL.scale, speed, {
      x: 1,
      y: 1,
      ease: Strong.easeInOut,
    });
    TweenMax.to(this.noseR.scale, speed, {
      x: 1,
      y: 1,
      ease: Strong.easeInOut,
    });
    TweenMax.to(this.noseL.position, speed, {
      y: 40,
      ease: Strong.easeInOut,
    });
    TweenMax.to(this.noseR.position, speed, {
      y: 40,
      ease: Strong.easeInOut,
    });
    TweenMax.to(this.irisL.scale, speed, {
      y: 1,
      z: 1,
      ease: Back.easeOut,
    });
    TweenMax.to(this.irisR.scale, speed, {
      y: 1,
      z: 1,
      ease: Back.easeOut,
    });
    TweenMax.to(this.irisL.position, speed * 0.7, {
      y: 30,
      ease: Back.easeOut,
    });
    TweenMax.to(this.irisR.position, speed * 0.7, {
      y: 30,
      ease: Back.easeOut,
    });
    TweenMax.to(this.eyeL.scale, speed, {
      y: 1,
      ease: Strong.easeOut,
    });
    TweenMax.to(this.eyeR.scale, speed, {
      y: 1,
      ease: Strong.easeOut,
    });
    TweenMax.to(this.body.rotation, speed, {
      x: 0,
      ease: Back.easeOut,
    });
    TweenMax.to(this.body.scale, speed, {
      y: 1,
      ease: Back.easeOut,
    });
    TweenMax.to(this.body.position, speed, {
      z: 0,
      ease: Back.easeOut,
    });

    TweenMax.to(this.wingL.rotation, speed * 1.3, {
      z: -Math.PI / 4,
      ease: Back.easeInOut,
    });
    TweenMax.to(this.wingR.rotation, speed * 1.3, {
      z: Math.PI / 4,
      ease: Back.easeInOut,
    });

    TweenMax.to(this.earL.rotation, speed * 1.3, {
      x: 0,
      y: 0,
      ease: Back.easeInOut,
    });
    TweenMax.to(this.earR.rotation, speed * 1.3, {
      x: 0,
      y: 0,
      ease: Back.easeInOut,
      onComplete: function () {
        _this.isSneezing = false;
        _this.smokeTime = Math.round(s * 50 + 20);
      },
    });

    TweenMax.to(this.tail.rotation, speed * 1.3, {
      x: 0,
      ease: Back.easeOut,
    });

    TweenLite.to(this.mouth.rotation, speed, {
      x: 0,
      ease: Strong.easeOut,
    });

    TweenLite.to(this.lips.position, speed, {
      z: this.faceL + this.bodyL / 2 + this.neckLen + 1,
      y: 5,
      x: 0,
      ease: Back.easeIn,
    });
    TweenLite.to(this.lips.scale, speed, {
      x: 1,
      y: 1,
      ease: Back.easeIn,
    });
  }
}
