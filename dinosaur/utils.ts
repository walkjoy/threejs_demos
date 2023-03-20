import { BoxGeometry, Mesh } from 'three';

const makeCube = (
  mat: any,
  w: number,
  h: number,
  d: number,
  posX: number,
  posY: number,
  posZ: number,
  rotX: number,
  rotY: number,
  rotZ: number,
) => {
  var geom = new BoxGeometry(w, h, d);
  var mesh = new Mesh(geom, mat);
  mesh.position.x = posX;
  mesh.position.y = posY;
  mesh.position.z = posZ;
  mesh.rotation.x = rotX;
  mesh.rotation.y = rotY;
  mesh.rotation.z = rotZ;
  return mesh;
};

export { makeCube };
