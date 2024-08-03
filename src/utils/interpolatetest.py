import xml.etree.ElementTree as ET
import math
import svgpathtools
from svgpathtools import svg2paths
from svgpathtools import parse_path

def get_total_length_all_paths(paths):
    return sum(path_length(path) for path in paths)

def path_length(path):
    # Placeholder for path length calculation logic
    return path.length()

def range_func(start, stop=None, step=1):
    if stop is None:
        stop = start
        start = 0
    return [start + step * i for i in range(math.ceil((stop - start) / step))]

def polygonize(path, num_points, scale, translate_x, translate_y):
    length = path_length(path)
    print(path.point(length * 1 / num_points))
    return [
        [
            path.point(math.floor(length * i / num_points)).real * scale + translate_x,
            path.point(math.floor(length * i / num_points)).imag * scale + translate_y
        ]
        for i in range_func(num_points)
    ]

def point_at_length(path, length):
    # Placeholder for point at length calculation logic
    return [0, 0]

def paths_to_coords(paths, scale, num_points, translate_x, translate_y):
    total_length_all_paths = get_total_length_all_paths(paths)
    running_points_total = 0
    separate_paths_coords_collection = []

    for index, item in enumerate(paths):
        if index + 1 == len(paths):
            points_for_path = num_points - running_points_total
        else:
            points_for_path = round(num_points * path_length(item) / total_length_all_paths)
            running_points_total += points_for_path
        separate_paths_coords_collection.extend(
            polygonize(item, points_for_path, scale, translate_x, translate_y)
        )
    return separate_paths_coords_collection

def interpolate(input_svg, target_length):
    namespaces = {'svg': 'http://www.w3.org/2000/svg'}
    doc = ET.fromstring(input_svg)
    base_length = get_total_length_all_paths(doc.findall('.//svg:path', namespaces))
    svg = doc.find('.//svg:svg', namespaces)
    scale = target_length / base_length
    coords = []

    for path in svg.findall('.//svg:path', namespaces):
        coords.append(
            paths_to_coords(
                [path],
                1,
                math.floor(path_length(path) * scale / 10),
                0,
                0
            )
        )
    return coords

def interpolate_static(input_svg):
    namespaces = {'svg': 'http://www.w3.org/2000/svg'}
    # doc = ET.fromstring(input_svg)
    # for child in doc:
    #     print(child.tag, child.attrib)
    #     for child2 in child:
    #         print("\t"+child2.tag, child2.attrib)
    #     print()
    # print(doc)

    paths, attributes = svg2paths('input.svg')


    base_length = get_total_length_all_paths(paths)
    # svg = doc.findall('.//svg:g/svg:path', namespaces)
    # print("...")
    # print(svg)
    # print("...")

    coords = []

    for path in paths:
        # print(path)
        print(path_length(path))
        coords.append(
            paths_to_coords(
                [path],
                1,
                path_length(path),
                0,
                0
            )
        )
    return {
        'coords': coords,
        'total_len': base_length
    }

# Example usage
if __name__ == "__main__":
    input_svg = '''<svg version="1.1" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <g stroke="lightgray" stroke-dasharray="1,1" stroke-width="1" transform="scale(4, 4)">
    <line x1="0" y1="0" x2="256" y2="256"/>
    <line x1="256" y1="0" x2="0" y2="256"/>
    <line x1="128" y1="0" x2="128" y2="256"/>
    <line x1="0" y1="128" x2="256" y2="128"/>
  </g>
  <g transform="scale(1, -1) translate(0, -900)">

    <path d="M 323 706 Q 325 699 328 694 Q 334 686 367 671 Q 474 619 574 561 Q 600 545 617 543 Q 627 545 631 559 Q 641 576 613 621 Q 575 684 334 717 Q 321 719 323 706 Z" class="stroke1"/>
    <path d="M 312 541 Q 314 535 316 531 Q 320 524 347 512 Q 455 461 563 397 Q 588 380 606 380 Q 615 382 619 396 Q 629 414 602 457 Q 564 519 321 554 Q 320 555 319 555 Q 310 555 312 541 Z" class="stroke2"/>
    <text x="336" y="704" style="transform-origin:336px 704px; transform:scale(1,-1);">1</text>
    <text x="317" y="548" style="transform-origin:317px 548px; transform:scale(1,-1);">2</text></g>
</svg>'''

    result = interpolate_static(input_svg)
    print(result)


# path = parse_path("M 336 704 L 450 666 L 554 620 L 587 595 L 614 558")
# path2 = parse_path("M 317 548 L 347 531 L 455 496 L 543 456 L 578 430 L 602 395")


# print(path.reversed().d())
# print(path2.reversed().d())
