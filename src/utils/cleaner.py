import svgpathtools as spt
from lxml import etree as ET

def flip_svg_vertically(svg_file, output_file):
    parser = ET.XMLParser(remove_blank_text=True)
    tree = ET.parse(svg_file, parser)
    root = tree.getroot()

    viewBox = root.attrib.get('viewBox')
    if viewBox:
        _, _, _, svg_height = map(float, viewBox.split())
    else:
        raise ValueError("SVG does not have a viewBox attribute.")
    
    def flip_path(path_str, height):
        path = spt.parse_path(path_str)
        for segment in path:
            if hasattr(segment, 'start'):
                segment.start = complex(segment.start.real, height - segment.start.imag)
            if hasattr(segment, 'end'):
                segment.end = complex(segment.end.real, height - segment.end.imag)
            if hasattr(segment, 'control'):
                segment.control1 = complex(segment.control.real, height - segment.control.imag)
        return path.d()

    for elem in root.findall('.//{http://www.w3.org/2000/svg}style'):
        parent = elem.getparent()
        if parent is not None:
            parent.remove(elem)

    new_group = ET.Element('g', style="fill:none;stroke:#000000;stroke-width:50;stroke-linecap:round;stroke-linejoin:round;", transform="scale(1, 1) translate(0, 0)")

    for elem in root.findall('.//{http://www.w3.org/2000/svg}path'):
        if "clip-path" in elem.attrib:
            path_data = elem.attrib['d']
            flipped_path_data = flip_path(path_data, svg_height)
            new_path = ET.Element('path', d=flipped_path_data)
            new_group.append(new_path)

    root.clear()
    root.attrib['viewBox'] = "0 0 1024 1024"
    root.append(new_group)

    tree.write(output_file, pretty_print=True, xml_declaration=True, encoding='UTF-8')

flip_svg_vertically('input.svg', 'output.svg')
