import React, { useEffect, useRef, useState } from 'react';
import {
  BoxGeometry,
  BufferGeometry,
  Line,
  LineBasicMaterial,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  Scene,
  Vector3,
  WebGLRenderer,
} from 'three';

const First = () => {
  const mount = useRef<HTMLDivElement | null>(null);
  const [isAnimating, setAnimating] = useState(true);
  const controls = useRef<{ [key: string]: () => void } | null>(null);

  useEffect(() => {
    if (!mount.current) return;
    const container = mount.current;
    let width = container.clientWidth;
    let height = container.clientHeight;
    let frameId: number;

    const scene = new Scene();
    const camera = new PerspectiveCamera(75, width / height, 0.1, 1000);
    const renderer = new WebGLRenderer({ antialias: true });
    const geometry = new BoxGeometry(1, 1, 1);
    const material = new MeshBasicMaterial();
    const cube = new Mesh(geometry, material);

    const lineMaterial = new LineBasicMaterial({ color: 0x0000ff });
    const points = [];
    points.push(new Vector3(-3, 0, 0));
    points.push(new Vector3(0, 3, 0));
    points.push(new Vector3(3, 0, 0));
    const lineGeometry = new BufferGeometry().setFromPoints(points);

    const line = new Line(lineGeometry, lineMaterial);

    camera.position.z = 4;
    scene.add(cube);
    scene.add(line);
    renderer.setClearColor('#000000');
    renderer.setSize(width, height);

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
      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;

      renderScene();
      frameId = window.requestAnimationFrame(animate);
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

    container.appendChild(renderer.domElement);
    window.addEventListener('resize', handleResize);
    start();

    controls.current = { start, stop };
    return () => {
      stop();
      window.removeEventListener('resize', handleResize);
      container.removeChild(renderer.domElement);

      scene.remove(cube);
      geometry.dispose();
      material.dispose();
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

export default First;
