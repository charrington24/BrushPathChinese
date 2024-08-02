import { range } from "d3-array";

export default function polygonize(
  path,
  numPoints,
  scale,
  translateX,
  translateY
) {
  //Thank you Noah!! http://bl.ocks.org/veltman/fc96dddae1711b3d756e0a13e7f09f24

  const length = path.getTotalLength();

  const coords = [];

  let x;
  let y;

  for (let i = 0; i < numPoints; i++) {
    const point = path.getPointAtLength((length * i) / numPoints);
    x = point.x * scale + translateX;
    y = point.y * scale + translateY;
    coords.push(structuredClone([x, y]));
  }

  const retcoords = structuredClone(coords)

  return retcoords;
}
