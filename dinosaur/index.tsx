import {
  PerspectiveCamera,
  Scene,
  // Vector3,
  WebGLRenderer,
  HemisphereLight,
  DirectionalLight,
  PCFSoftShadowMap,
  Vector3,
  Object3D,
} from 'three';
import React, { useEffect, useRef, useState } from 'react';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Dinosaur } from './Dinosaur';
import { SmokingParticle } from './SmokingParticle';

const DinosaurApp = () => {
  const [clickCount, setClickCount] = useState('00');
  const ctxRef = useRef<HTMLDivElement | null>(null);
  const maxSneezingRate = 5;
  const sneezeDelay = 500;
  const speedRate = 0.5;

  let sneezeTimeout: any = null;
  let sneezingRate = 0;

  useEffect(() => {
    if (!ctxRef) return;
    const container = ctxRef?.current;
    let width = container?.clientWidth || 0;
    let height = container?.clientHeight || 0;

    const scene = new Scene();

    const renderer = new WebGLRenderer({
      alpha: true,
      antialias: true,
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = PCFSoftShadowMap;
    renderer.setClearAlpha(0); //开启透明
    renderer.setSize(width, height);
    container?.appendChild(renderer.domElement);

    const camera = new PerspectiveCamera(45, width / height, 1, 2000);
    camera.position.set(-800, 300, 800);
    camera.lookAt(scene.position);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.minPolarAngle = -Math.PI / 2;
    controls.maxPolarAngle = Math.PI / 2;
    controls.enableZoom = true;
    controls.enablePan = true;

    const light = new HemisphereLight(0xffffff, 0xb3858c, 0.8);
    const backLight = new DirectionalLight(0xffffff, 0.4);
    backLight.position.set(200, 100, 100);
    backLight.castShadow = true;

    scene.add(light, backLight);
    const dinosaur = new Dinosaur(new Vector3(0, 0, 0), speedRate, maxSneezingRate);
    scene.add(dinosaur.meshGroup);

    const renderScene = () => {
      controls && controls.update();
      renderer.render(scene, camera);
    };

    const handleResize = () => {
      width = container?.clientWidth || 0;
      height = container?.clientHeight || 0;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      controls && controls.update();
      renderScene();
    };

    const sneeze = () => {
      dinosaur.sneeze(sneezingRate);
      sneezingRate = 0;
      setClickCount('00');
    };

    const handlePointerDown = (e: PointerEvent) => {
      e.preventDefault();

      if (sneezeTimeout) clearTimeout(sneezeTimeout);

      sneezingRate += (maxSneezingRate - sneezingRate) / 10;
      setClickCount('' + parseInt((sneezingRate * 100) / maxSneezingRate + ''));
      dinosaur.prepareToSneeze(sneezingRate);

      sneezeTimeout = setTimeout(sneeze, sneezeDelay * speedRate);
      dinosaur.isSneezing = true;
    };

    let awaitingSmokeParticles: SmokingParticle[] = [];

    const getSmokeParticle = () => {
      if (awaitingSmokeParticles.length < 1) {
        return new SmokingParticle(speedRate, maxSneezingRate, addToAwaitingParticles);
      } else {
        return awaitingSmokeParticles.pop();
      }
    };

    const addToAwaitingParticles = (p: SmokingParticle) => {
      awaitingSmokeParticles.push(p);
    };

    const animateTEST = () => {
      renderScene();
      dinosaur.update();

      // 黑烟
      if (dinosaur.smokeTime > 0) {
        const noseTarget = Math.random() > 0.5 ? dinosaur.noseL : dinosaur.noseR;
        const p = getSmokeParticle();
        const pos = noseTarget.localToWorld(new Vector3(0, 0, 2));

        if (p) {
          p.mesh.position.x = pos.x;
          p.mesh.position.y = pos.y;
          p.mesh.position.z = pos.z;
          (p.mesh.material as any).color.setHex(0x333333);

          scene.add(p.mesh);
          p.fly();
          dinosaur.smokeTime--;
        }
      }

      // 火星
      if (dinosaur.fireTime > 0) {
        const noseTarget = Math.random() > 0.5 ? dinosaur.noseL : dinosaur.noseR;
        const p = getSmokeParticle();
        const pos = noseTarget.localToWorld(new Vector3(0, 0, 2));

        if (p) {
          p.mesh.position.x = pos.x;
          p.mesh.position.y = pos.y;
          p.mesh.position.z = pos.z;
          (p.mesh.material as any).color.setHex(0xff794d);
          (p.mesh.material as any).opacity = 1;

          scene.add(p.mesh);
          p.fire(dinosaur.fireRate);
          dinosaur.fireTime--;
        }
      }

      requestAnimationFrame(animateTEST);
    };
    animateTEST();

    document.addEventListener('resize', handleResize);
    document.addEventListener('pointerdown', handlePointerDown, false);

    return () => {
      scene.traverse((obj:Object3D)=>{
        scene.remove(obj);
      })
      renderer.dispose();
      setClickCount('00');
      container!.removeChild(renderer.domElement);
      scene.remove(dinosaur.meshGroup);
      document.removeEventListener('resize', handleResize);
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, []);

  return (
    <div
      style={{
        height: '100%',
        width: '100%',
        position: 'relative',
        backgroundColor: '#652e37',
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <div ref={ctxRef} style={{ height: '100%', width: '100%', position: 'absolute', top: '0', left: '0' }}></div>
      <div style={{ fontSize: '50px', color: '#267326' }}>蓄力值：{clickCount}</div>
    </div>
  );
};

export default DinosaurApp;
