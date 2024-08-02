import pathsToCoords from "../coord-utils/pathsToCoords";
import getTotalLengthAllPaths from "../coord-utils/getTotalLengthAllPaths";

const parser = new DOMParser();

export function interpolate(inputSvg: string, targetLength: number): number[][][] {

    var doc = parser.parseFromString(inputSvg, "image/svg+xml");
    const baseLength = getTotalLengthAllPaths(doc.getElementsByTagName("path"));
    
    const svg = doc.getElementsByTagName("svg")[0];
    const scale = targetLength / baseLength;


    var paths = svg.getElementsByTagName("path");
    var coords: number[][][] = [];
    for (var i = 0; i < paths.length; i++) {
        coords[i] = pathsToCoords(
            [paths[i]],
            1,
            Math.floor(paths[i].getTotalLength() * scale / 10),
            0,
            0
        );
    }
    return structuredClone(coords);
}

type interpData = {
    coords : number[][][],
    totalLen : number,
}

export function interpolateStatic(inputSvg: string): interpData {
    var doc = parser.parseFromString(inputSvg, "image/svg+xml");
    const baseLength = getTotalLengthAllPaths(doc.getElementsByTagName("path"));
    
    const svg = doc.getElementsByTagName("svg")[0];
  

    var paths = svg.getElementsByTagName("path");
    var coords: number[][][] = [];
    for (var i = 0; i < paths.length; i++) {
        coords[i] = pathsToCoords(
            [paths[i]],
            1,
            paths[i].getTotalLength(),
            0,
            0
        );
    }
    var data = {
        coords: coords, totalLen : baseLength
    }
    return data;
}

export default {interpolate, interpolateStatic}