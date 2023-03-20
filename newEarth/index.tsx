import {
  WebGLRenderer,
  Scene,
  MeshPhongMaterial,
  PerspectiveCamera,
  SphereGeometry,
  Mesh,
  TextureLoader,
  DoubleSide,
  AmbientLight,
  Color,
  DirectionalLight,
  MeshBasicMaterial,
  BackSide,
  PointLight,
  Object3D,
} from 'three';
import React, { useEffect, useRef } from 'react';
import map from './earthmap3k.jpg';
import bump from './earthbump3k.jpg';
import spec from './earthSpec.jpg';
import cloudTrans from './earthcloudmaptrans.jpg';
import cloudMap from './earthcloudmap.jpg';
import galaxy from './galaxy.jpg';

const EarthApp = () => {
  const ctxRef = useRef<HTMLDivElement | null>(null);
  const earthRadius = 80;

  useEffect(() => {
    if (!ctxRef.current) return;
    const container = ctxRef?.current;
    let height = container.clientHeight,
      width = container.clientWidth;

    const scene = new Scene();
    const renderer = new WebGLRenderer({
      alpha: true,
      antialias: true,
    });

    const camera = new PerspectiveCamera(45, width / height, 1, 1000);
    camera.position.set(0, 0, 500);
    camera.lookAt(scene.position);

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearAlpha(0); //开启透明
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);

    // 地球
    const geom = new SphereGeometry(earthRadius, 32, 32);
    const mat = new MeshPhongMaterial({
      map: new TextureLoader().load(map),
      side: DoubleSide,
      bumpMap: new TextureLoader().load(bump),
      specularMap: new TextureLoader().load(spec),
      bumpScale: 0.1,
      specular: new Color('red'),
    });
    const earthMesh = new Mesh(geom, mat);
    scene.add(earthMesh);

    // 云
    const cloudGeom = new SphereGeometry(earthRadius + 2, 32, 32);
    const cloudMat = new MeshPhongMaterial({
      envMap: new TextureLoader().load(cloudMap),
      alphaMap: new TextureLoader().load(cloudTrans),
      transparent: true,
      opacity: 0.3,
    });
    const cloudMesh = new Mesh(cloudGeom, cloudMat);
    cloudMesh.receiveShadow = true;
    cloudMesh.castShadow = true;
    scene.add(cloudMesh);

    // 星尘
    const galaxyGeom = new SphereGeometry(500, 32, 32);
    const galaxyMat = new MeshBasicMaterial({
      map: new TextureLoader().load(galaxy),
      side: BackSide,
    });
    const galaxyMesh = new Mesh(galaxyGeom, galaxyMat);
    scene.add(galaxyMesh);

    // 光
    const ambientLight = new AmbientLight(0x555555);
    ambientLight.position.set(100, 100, 200);
    const directionalLight = new DirectionalLight(0xffffff, 1);
    directionalLight.castShadow = true;
    const pointLight = new PointLight(0xffffff);
    pointLight.position.set(100, 50, 100);
    scene.add(ambientLight, directionalLight, pointLight);

    const animate = () => {
      renderer.render(scene, camera);
      earthMesh.rotation.y += 1 / 64;
      cloudMesh.rotation.y += 1 / 128;

      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      width = container?.clientWidth || 0;
      height = container?.clientHeight || 0;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.render(scene, camera);
    };

    document.addEventListener('resize', handleResize);

    const mouse = { x: 0, y: 0, z: 0 };
    document.addEventListener(
      'mousemove',
      function (event) {
        mouse.x = event.clientX / container.clientWidth - 0.5;
        mouse.y = event.clientY / container.clientHeight - 0.5;
        camera.position.x += mouse.x * 200 - camera.position.x;
        camera.position.y += mouse.y * 200 - camera.position.y;

        camera.lookAt(scene.position);
      },
      false,
    );

    return () => {
      renderer.dispose();
      document.removeEventListener('resize', handleResize);
    };
  });
  return (
    <div
      style={{
        height: '100%',
        width: '100%',
        position: 'relative',
      }}
    >
      <div ref={ctxRef} style={{ height: '100%', width: '100%', position: 'absolute', top: '0', left: '0' }}></div>
    </div>
  );
};

export default EarthApp;
