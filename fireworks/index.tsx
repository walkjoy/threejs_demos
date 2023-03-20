import React, { useEffect, useRef, useState } from 'react';
import { Object3D, PerspectiveCamera, Scene, WebGLRenderer } from 'three';
import { Firework } from './Firework';
import { gravity, maxInstances } from './contants';

const Fireworks = () => {
  const [particleSize] = useState(400);
  const instances: Array<any> = [];
  const ctxRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!ctxRef.current) return;

    let scene = new Scene();

    let camera = new PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.set(0, 20, 170);
    camera.lookAt(scene.position);

    const container = ctxRef.current;
    let width = container.clientWidth;
    let height = container.clientHeight;

    let renderer = new WebGLRenderer({
      antialias: true, // 开启抗锯齿
      alpha: true, // 开启透明，不然会挡住其它元素
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearAlpha(0); //开启透明
    renderer.setSize(width, height);

    container.appendChild(renderer.domElement);

    const LightAFirework = () => {
      if (instances.length >= maxInstances) return; // 超出最大实例数不再新生成

      const inst = new Firework(particleSize);
      instances.push(inst);
      scene.add(inst.meshGroup);
    };

    const renderScene = () => {
      renderer.render(scene, camera);
    };

    const handleResize = () => {
      width = container.clientWidth;
      height = container.clientHeight;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderScene();
    };

    const animate = () => {
      const exploadedIdxList = [];

      for (let i = instances.length - 1; i >= 0; i--) {
        const instance = instances[i];
        instance.update(gravity);
        if (instance.isExplode) exploadedIdxList.push(i);
      }

      for (let i = 0, l = exploadedIdxList.length; i < l; i++) {
        const index = exploadedIdxList[i];
        const instance = instances[index];
        if (!instance) return;

        instance.meshGroup.remove(instance.seed.mesh);
        instance.seed.disposeAll();

        if (instance.duration <= 0) {
          scene.remove(instance.meshGroup);
          instance.flower.disposeAll();
          instances.splice(index, 1);
        }
      }

      LightAFirework();

      renderer.render(scene, camera);

      requestAnimationFrame(animate);
    };

    animate();

    document.addEventListener('resize', handleResize);
    return () => {
      scene.traverse((obj: Object3D) => {
        scene.remove(obj);
      });
      renderer.dispose();
      document.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div style={{ height: '100%', width: '100%', position: 'relative' }}>
      <div ref={ctxRef} style={{ height: '100%', width: '100%', position: 'absolute', top: '0', left: '0' }}></div>
      <div
        style={{
          fontSize: '40px',
          height: '100%',
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#333333',
          color: 'lightblue',
        }}
      >
        Inspire creativity, enrich life.
      </div>
    </div>
  );
};

export default Fireworks;
