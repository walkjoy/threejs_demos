import React, { useEffect, useRef, useState } from 'react';
import {
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
  AmbientLight,
  SphereGeometry,
  TextureLoader,
  MeshPhongMaterial,
  DoubleSide,
  Mesh,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import clouds from './clouds.jpg';
import earth from './earth.jpg';

const Earth: React.FC = () => {
  const mount = useRef<HTMLDivElement | null>(null);
  const [isAnimating, setAnimating] = useState(true);
  const controls = useRef<{ [key: string]: () => void } | null>(null);

  const setCamera = (width: number, height: number) => {
    // 透视相机 视角越大，看到的场景越大，那么中间的物体相对于整个场景来说，就越小了
    const camera = new PerspectiveCamera(45, width / height, 1, 10000);
    camera.position.z = -500;
    camera.position.x = -500;
    camera.position.y = 500;
    camera.lookAt(0, 0, 0);
    return camera;
  };

  const setLight = () => {
    // A light source positioned directly above the scene, with color fading from the sky color to the ground color.
    // 位于场景正上方的光源，颜色从天空颜色渐变为地面颜色。
    //  const light = new HemisphereLight(0xffffbb, 0x080820, 1);

    // 环境光
    const light = new AmbientLight(0xffffff);
    light.position.set(100, 100, 200);

    return light;
    // 平行光
    // 位置不同，方向光作用于物体的面也不同，看到的物体各个面的颜色也不一样
    // const light = new DirectionalLight(0xffffbb, 1);
    // light.position.set(-1, 1, 1);
  };

  const setEarth = () => {
    const earthGeo = new SphereGeometry(200, 100, 100);
    const earthMater = new MeshPhongMaterial({
      map: new TextureLoader().load(earth),
      side: DoubleSide,
    });
    return new Mesh(earthGeo, earthMater);
  };

  const setCloud = () => {
    const cloudsGeo = new SphereGeometry(201, 100, 100);
    const cloudsMater = new MeshPhongMaterial({
      alphaMap: new TextureLoader().load(clouds),
      transparent: true,
      opacity: 0.2,
    });
    return new Mesh(cloudsGeo, cloudsMater);
  };
  useEffect(() => {
    if (!mount.current) return;
    const container = mount.current;
    let width = container.clientWidth;
    let height = container.clientHeight;
    let frameId: number;
    const renderer = new WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setClearColor('#000000');
    container.appendChild(renderer.domElement);

    const camera = setCamera(width, height);
    const scene = new Scene();

    const light = setLight();
    scene.add(light);

    const earthMesh = setEarth();
    scene.add(earthMesh);

    const cloudsMesh = setCloud();
    scene.add(cloudsMesh);

    const controls = new OrbitControls(camera, renderer.domElement);
    renderer.clear();

    const renderScene = () => {
      renderer.render(scene, camera);
    };

    const animate = () => {
      controls.update();
      earthMesh.rotation.y -= 0.005;

      cloudsMesh.rotation.y -= 0.01;
      cloudsMesh.rotation.z += 0.01;

      renderScene();
      frameId = requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => {
      width = container.clientWidth;
      height = container.clientHeight;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderScene();
    };

    const start = () => {
      if (!frameId) {
        frameId = requestAnimationFrame(animate);
      }
    };

    const stop = () => {
      cancelAnimationFrame(frameId);
      frameId = NaN;
    };

    window.addEventListener('resize', handleResize);
    start();

    return () => {
      stop();
      window.removeEventListener('resize', handleResize);
      container.removeChild(renderer.domElement);

      scene.remove(earthMesh);
      scene.remove(cloudsMesh);
    };
  }, []);

  useEffect(() => {
    if (isAnimating) {
      controls.current?.start();
    } else {
      controls.current?.stop();
    }
  }, [isAnimating]);

  return <div ref={mount} style={{ width: '100%', height: 500 }} onClick={() => setAnimating(pre => !pre)} />;
};

export default Earth;
