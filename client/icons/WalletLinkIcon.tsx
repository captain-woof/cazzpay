import * as React from "react";
import { SVGProps } from "react";

const SvgWalletLinkIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 16.933 16.933"
    height={64}
    width={64}
    {...props}
  >
    <g
      style={{
        strokeWidth: 16.00000381,
      }}
      transform="scale(.01654)"
    >
      <circle
        cx={512}
        cy={512}
        r={512}
        style={{
          fill: "#0052ff",
          strokeWidth: 16.00000381,
        }}
      />
      <path
        d="M516.3 361.83c60.28 0 108.1 37.18 126.26 92.47H764C742 336.09 644.47 256 517.27 256 372.82 256 260 365.65 260 512.49S370 768 517.27 768c124.35 0 223.82-80.09 245.84-199.28H642.55c-17.22 55.3-65 93.45-125.32 93.45-83.23 0-141.56-63.89-141.56-149.68.04-86.77 57.43-150.66 140.63-150.66z"
        style={{
          fill: "#fff",
          strokeWidth: 16.00000381,
        }}
      />
    </g>
  </svg>
);

export default SvgWalletLinkIcon;
