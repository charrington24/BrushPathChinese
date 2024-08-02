import { interpolateStatic } from "../grading/interpolate";

// Function to interpolate the SVG content

export default function runInterp() {
  // Read SVG file

  var data1 = `<svg version="1.1" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
 
  <g transform="scale(1, -1) translate(0, -900)">


    <path d="M 323 706 Q 325 699 328 694 Q 334 686 367 671 Q 474 619 574 561 Q 600 545 617 543 Q 627 545 631 559 Q 641 576 613 621 Q 575 684 334 717 Q 321 719 323 706 Z" class="stroke1"/>
    <path d="M 312 541 Q 314 535 316 531 Q 320 524 347 512 Q 455 461 563 397 Q 588 380 606 380 Q 615 382 619 396 Q 629 414 602 457 Q 564 519 321 554 Q 320 555 319 555 Q 310 555 312 541 Z" class="stroke2"/>
</g>
</svg>`
;

var data = `
     <svg xmlns="http://www.w3.org/2000/svg" width="109" height="109" viewBox="0 0 109 109"> 
        <g id="kvg:StrokePaths_04e00" style="fill:none;stroke:#000000;stroke-width:3;stroke-linecap:round;stroke-linejoin:round;"> 
            <g id="kvg:04e00" kvg:element="一" kvg:radical="general"> 
                <path id="kvg:04e00-s1" kvg:type="㇐" d="M11,54.25c3.19,0.62,6.25,0.75,9.73,0.5c20.64-1.5,50.39-5.12,68.58-5.24c3.6-0.02,5.77,0.24,7.57,0.49"/> 
            </g> 
        </g> 
        <g id="kvg:StrokeNumbers_04e00" font-size="8" fill="#210c0c"> <text transform="matrix(1 0 0 1 4.25 54.13)">1</text> </g> 
     </svg> 
`

  // Pass the SVG content to the interpolateStatic function
  const interpolatedContent = interpolateStatic(data1);

  // Print the output to the console
  console.log(interpolatedContent);
}
