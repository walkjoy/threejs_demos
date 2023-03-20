import React, { useEffect, useRef, useState } from 'react';
import {
  AmbientLight,
  BoxGeometry,
  BufferGeometry,
  CubicBezierCurve3,
  CurvePath,
  DoubleSide,
  ExtrudeGeometry,
  Line,
  LineBasicMaterial,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  PerspectiveCamera,
  QuadraticBezierCurve3,
  Ray,
  Raycaster,
  RepeatWrapping,
  Scene,
  Shape,
  Texture,
  TextureLoader,
  TubeBufferGeometry,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three';

import { geoMercator } from 'd3';
import ChinaMapData from './china.json';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import TweenMax from '../TweenMax.min.js';
import { MeshLine, MeshLineMaterial } from './THREE.MeshLine';

const ChinaMap = curve => {
  const mount = useRef<HTMLDivElement | null>(null);
  const [text, setText] = useState({});

  useEffect(() => {
    if (!mount.current) return;
    const container = mount.current;
    let width = container.clientWidth;
    let height = container.clientHeight;

    const renderer = new WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);

    const scene = new Scene();
    // 背景图
    // const textureLoader = new TextureLoader();
    // const texture = textureLoader.load('https://img.alicdn.com/tfs/TB1mi6tt.Y1gK0jSZFMXXaWcVXa-1735-1024.png');
    // scene.background = texture;

    const camera = new PerspectiveCamera(45, width / height, 100, 1000);
    camera.position.set(0, -90, 150);
    camera.lookAt(0, 0, 0);

    const controller = new OrbitControls(camera, renderer.domElement);
    controller.enableRotate = false;
    // controller.enableZoom = false;
    const ambientLight = new AmbientLight(0xffffff); // 环境光
    scene.add(ambientLight);

    const renderScene = () => {
      controller.update();
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

    const raycaster = new Raycaster();
    const mouse = new Vector2();
    const eventOffset = {};
    // const onMouseMove = event => {
    //   mouse.y = -(event.clientY / height) * 2 + 1;
    //   eventOffset.x = event.clientX - 200;
    //   eventOffset.y = event.clientY;
    //   mouse.x = ((event.clientX - 200) / width) * 2 - 1;
    //   setText(pre => ({
    //     ...pre,
    //     left: eventOffset.x + 2 + 'px',
    //     top: eventOffset.y + 2 + 'px',
    //   }));
    // };
    // window.addEventListener('mousemove', onMouseMove, false);

    const activeInstersect: any[] = [];

    const createProvinceInfo = () => {
      // 显示省份的信息
      if (activeInstersect.length !== 0 && activeInstersect[0].object.parent.properties.name) {
        const properties = activeInstersect[0].object.parent.properties;

        setText(pre => ({
          ...pre,
          text: properties.name,
          show: 'visible',
        }));
      } else {
        setText(pre => ({
          ...pre,
          show: 'hidden',
        }));
      }
    };

    const centerPoints: Record<string, [number, number]> = {};
    const initMap = chinaJson => {
      // 建一个空对象存放对象
      const map = new Object3D();

      // 墨卡托投影转换
      const projection = geoMercator().center([104.0, 37.5]).scale(80).translate([0, 0]);
      chinaJson.features.forEach(elem => {
        // 定一个省份3D对象
        const province = new Object3D();
        // 每个的 坐标 数组
        const coordinates = elem.geometry.coordinates;

        // 获取省会位置
        const [xc, yc] = projection(elem.properties.center ?? []) ?? [];
        centerPoints[elem.properties.name] = [xc ?? 0, yc ?? 0];

        // 循环坐标数组
        coordinates.forEach(multiPolygon => {
          multiPolygon.forEach(polygon => {
            const shape = new Shape();
            const lineMaterial = new LineBasicMaterial({
              color: 'white',
            });
            const points = [];
            for (let i = 0; i < polygon.length; i++) {
              const [x, y] = projection(polygon[i]);
              if (i === 0) {
                shape.moveTo(x, -y);
              }
              shape.lineTo(x, -y);
              points.push(new Vector3(x, -y, 4.01));
            }
            const lineGeometry = new BufferGeometry().setFromPoints(points);

            const extrudeSettings = {
              depth: 4,
              bevelEnabled: false,
            };

            const geometry = new ExtrudeGeometry(shape, extrudeSettings);
            const material = new MeshBasicMaterial({
              color: 'grey',
              transparent: true,
              opacity: 0.6,
            });
            const material1 = new MeshBasicMaterial({
              color: 'grey',
              transparent: true,
              opacity: 0.5,
            });
            /* const material = new THREE.MeshBasicMaterial({ color: '#dedede', transparent: false, opacity: 0.6 });
            const material1 = new THREE.MeshBasicMaterial({ color: '#dedede', transparent: false, opacity: 0.5 }); */
            const mesh = new Mesh(geometry, [material, material1]);
            const line = new Line(lineGeometry, lineMaterial);
            province.add(mesh);
            province.add(line);
          });
        });

        // 将geo的属性放到省份模型中
        province.properties = elem.properties;
        if (elem.properties.centroid) {
          const [x, y] = projection(elem.properties.centroid);
          province.properties._centroid = [x, y];
        }

        map.add(province);
      });

      scene.add(map);
    };

    const loadMapData = () => {
      initMap(ChinaMapData);
    };

    loadMapData();

    const start = new Vector3(centerPoints['北京市'][0], -centerPoints['北京市'][1], 4.01);

    const end = new Vector3(centerPoints['浙江省'][0], -centerPoints['浙江省'][1], 4.01);
    const middle = new Vector3(
      (centerPoints['北京市'][0] + centerPoints['浙江省'][0]) / 2 - 100 / Math.sqrt(start.distanceToSquared(end) + 1),
      (-centerPoints['北京市'][1] - centerPoints['浙江省'][1]) / 2 - 100 / Math.sqrt(start.distanceToSquared(end) + 1),
      4.01 * 10,
    );
    console.log(10 / Math.sqrt(start.distanceToSquared(end) + 1));
    const pathC = new QuadraticBezierCurve3(start, middle, end);

    const geometry = new BufferGeometry().setFromPoints(pathC.getPoints(100));

    const getTexture = (length, lineColor, lightColor, isHalf) => {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 1;
      const ctx = canvas.getContext('2d');
      const gradient = ctx?.createLinearGradient(0, 0, 256, 1);
      gradient?.addColorStop(0, lineColor);
      gradient?.addColorStop(isHalf ? length : length / 2, lightColor);
      gradient?.addColorStop(length, lineColor);
      gradient?.addColorStop(length, lineColor);
      gradient?.addColorStop(1, lineColor);
      ctx.fillStyle = gradient;
      ctx?.fillRect(0, 0, 256, 1);
      const textureZZZ = new Texture(canvas);
      textureZZZ.needsUpdate = true;
      textureZZZ.wrapS = RepeatWrapping;
      textureZZZ.wrapT = RepeatWrapping;
      return textureZZZ;
    };
    const meshLine = new MeshLine();
    meshLine.setGeometry(geometry);

    const textureXXX = getTexture(1, 'rgba(171,157,245,1)', 'rgba(239,238,255,1)', false);
    textureXXX.anisotropy = 16;
    textureXXX.wrapS = RepeatWrapping;
    textureXXX.wrapT = RepeatWrapping;

    const material = new MeshLineMaterial({
      map: textureXXX, // 材质
      useMap: true, // 使用材质
      lineWidth: 2, // 线宽
      sizeAttenuation: false, // 是否随距离衰减
      transparent: true, // 开启透明度
      dashRadio: 0.8,
      dashOffset: 0,
      depthTest: false,
      dashArray: 2,
    });

    material.uniforms.resolution.value.set(1720, 594);
    const meshLLL = new Mesh(meshLine.geometry, material);
    scene.add(meshLLL);
    console.log(material.uniforms);

    const animate = () => {
      // raycaster.setFromCamera(mouse, camera);
      // const intersects = raycaster.intersectObjects(scene.children, true);
      // if (activeInstersect && activeInstersect.length > 0) {
      //   activeInstersect.forEach(element => {
      //     element.object.material[0].color.set('#02A1E2');
      //     element.object.material[1].color.set('#3480C4');
      //   });
      // }
      // activeInstersect = [];
      // for (let i = 0; i < intersects.length; i++) {
      //   if (intersects[i].object.material && intersects[i].object.material.length === 2) {
      //     activeInstersect.push(intersects[i]);
      //     intersects[i].object.material[0].color.set(0xff0000);
      //     intersects[i].object.material[1].color.set(0xff0000);
      //     break; // 只取第一个
      //   }
      // }
      createProvinceInfo();
      // material.uniforms.visibility.value = (time / 3000) % 1.0;
      material.uniforms.dashOffset.value -= 0.02;
      // TweenMax.to(material.uniforms.dashOffset, 0.16, {
      //   value: '-=0.01',
      // });
      renderScene();
      requestAnimationFrame(animate);
    };

    animate();

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      // container.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div ref={mount} style={{ width: '100%', height: '100%', position: 'relative' }}>
      {/* <div
        style={{
          zIndex: 2,
          background: 'white',
          position: 'absolute',
          padding: 10,
          left: text.left,
          top: text.top,
          visibility: text.show ?? 'hidden',
        }}
      >
        {text.text}
      </div> */}
    </div>
  );
};

export default ChinaMap;
