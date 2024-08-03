import svgpathtools as spt
from svgpathtools import svg2paths, wsvg
from xml.etree import ElementTree as ET

def flip_svg_vertically(svg_file, output_file):
    # Parse the SVG file
    tree = ET.parse(svg_file)
    root = tree.getroot()

    # Get the viewBox attribute to determine the height of the SVG
    viewBox = root.attrib.get('viewBox')
    if viewBox:
        _, _, _, svg_height = map(float, viewBox.split())
    else:
        raise ValueError("SVG does not have a viewBox attribute.")

    # Function to flip the path vertically
    def flip_path(path_str, height):
        path = spt.parse_path(path_str)
        for segment in path:
            print(segment)
            if hasattr(segment, 'start'):
                segment.start = complex(segment.start.real, height - segment.start.imag)
            if hasattr(segment, 'end'):
                segment.end = complex(segment.end.real, height - segment.end.imag)
            if hasattr(segment, 'control'):
                segment.control = complex(segment.control.real, height - segment.control.imag)

        return path.d()

    # Flip all path elements
    for elem in root.findall('.//{http://www.w3.org/2000/svg}path'):
        path_data = elem.attrib['d']
        flipped_path_data = flip_path(path_data, svg_height)
        elem.attrib['d'] = flipped_path_data

    # Write the modified SVG to the output file
    tree.write(output_file)

# Example usage:
flip_svg_vertically('input.svg', 'output.svg')
