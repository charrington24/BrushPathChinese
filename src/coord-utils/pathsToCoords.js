import polygonize from './polygonize';
import getTotalLengthAllPaths from './getTotalLengthAllPaths';


export default function pathsToCoords ( paths, scale, numPoints, translateX, translateY ) {
  const totalLengthAllPaths = getTotalLengthAllPaths( paths );

  let runningPointsTotal = 0;

  let separatePathsCoordsCollection = [];

  for (let index = 0; index < paths.length; index++) {
    const item = paths[index];

    let pointsForPath;
    if (index + 1 === paths.length) {
      // ensures that the total number of points = the actual requested number (because using rounding)
      pointsForPath = numPoints - runningPointsTotal;
    } else {
      pointsForPath = Math.round(numPoints * item.getTotalLength() / totalLengthAllPaths);
      runningPointsTotal += pointsForPath;
    }

    const newCoords = polygonize(item, pointsForPath, scale, translateX, translateY);

    separatePathsCoordsCollection.push(...newCoords);
  }


  return structuredClone(separatePathsCoordsCollection);
}

