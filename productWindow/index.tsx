import React, { useEffect, useRef, useState } from 'react';
import {
  AmbientLight,
  DirectionalLight,
  Group,
  Mesh,
  PerspectiveCamera,
  PointLight,
  Scene,
  WebGLRenderer,
} from 'three';
import styles from './index.less';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls';
import { Button } from 'antd';

const ProductWindow = () => {
  const ctxRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!ctxRef || !ctxRef.current) return;
    const container = ctxRef.current;
    let width = container!.clientWidth,
      height = container!.clientHeight;

    const scene = new Scene();
    const camera = new PerspectiveCamera(45, width / height, 1, 800);
    camera.position.set(0, 30, 200);
    camera.lookAt(scene.position);

    const renderer = new WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    renderer.setSize(width, height);
    container?.appendChild(renderer.domElement);

    const ambientLight = new AmbientLight(0x000000);
    ambientLight.position.set(0, 0, 100);
    const directionalLight = new DirectionalLight(0x000000);
    const pointLight = new PointLight(0x000000);
    pointLight.position.set(camera.position.x, camera.position.y, camera.position.z);
    pointLight.lookAt(scene.position);
    scene.add(ambientLight, directionalLight);

    const controls = new TrackballControls(camera, renderer.domElement);
    controls.rotateSpeed = 3.0;
    controls.zoomSpeed = 3.0;
    controls.panSpeed = 1.8;

    const loader = new GLTFLoader();
    let productMesh: Group | null = null;
    loader.load(
      './examples/assets/shoe/scene.gltf',
      function (gltf) {
        productMesh = gltf.scene;
        productMesh.position.y = camera.position.y;
        scene.add(productMesh);
      },
      undefined,
      function (error) {
        console.log('An error happened', error);
        container!.textContent = '请打开本地服务器(http-server . -p 8000)，以支持3D模型加载功能';
      },
    );

    const animate = () => {
      renderer.render(scene, camera);
      // if (productMesh) {
      //   productMesh.rotation.y += 1 / 64;
      // }
      controls.update();
      requestAnimationFrame(animate);
    };

    animate();

    function handleResize() {
      const aspect = container.clientWidth / container.clientHeight;
      camera.aspect = aspect;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      controls.handleResize();
    }
    document.addEventListener('resize', handleResize);

    return () => {
      renderer.dispose();
      document.removeEventListener('resize', handleResize);
    };
  });

  return (
    <div className={styles.container}>
      <div className={styles.productWrap}>
        <div ref={ctxRef} className={styles.window}></div>
        <div className={styles.info}>
          <div className={styles.title}>
            哥伦比亚户外运动鞋休闲鞋跑鞋Columbia Men's Variant X.s.r. Trail Running Shoe
          </div>
          <ul className={styles.notes}>
            <li>100% Synthetic</li>
            <li>Imported</li>
            <li>Rubber sole</li>
            <li>Shaft measures approximately low-top from arch</li>
            <li>
              Seamless engineered mesh with no-sew for supportive protection. Enhanced heel fit via a molded external
              heel counter.
            </li>
            <li>
              New PearlFoam cushioning innovation provides superior energy return and durability in a comfortingly soft
              package.
            </li>
            <li>Unique guiding Fluid Foam cage provides an incredibly smooth transition.</li>
          </ul>
          <div className={styles.btn}>
            <Button style={{ marginLeft: '20px' }}>加入购物车</Button>
            <Button>现在购买</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductWindow;
