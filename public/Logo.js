import * as React from "react";
const SvgLogo = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={512}
    height={512}
    fill="none"
    {...props}
  >
    <rect width={512} height={512} fill="url(#logo_svg__a)" rx={128} />
    <path
      fill="#fff"
      d="M372.8 192.5c0 66.5-68.8 120.4-116.8 159.2-48-38.8-116.8-92.7-116.8-159.2 0-41.3 33.5-74.8 74.8-74.8 29.4 0 54.8 17 67 41.6 12.2-24.6 37.6-41.6 67-41.6 41.3 0 74.8 33.5 74.8 74.8z"
    />
    <defs>
      <linearGradient
        id="logo_svg__a"
        x1={0}
        x2={512}
        y1={0}
        y2={512}
        gradientUnits="userSpaceOnUse"
      >
        <stop
          offset="0%"
          style={{
            stopColor: "#ec4899",
          }}
        />
        <stop
          offset="100%"
          style={{
            stopColor: "#8b5cf6",
          }}
        />
      </linearGradient>
    </defs>
  </svg>
);
export default SvgLogo;
