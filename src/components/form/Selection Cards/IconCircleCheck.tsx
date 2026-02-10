import * as React from "react";

function IconCircleCheck({ size = 24, color = "#343B95", stroke = 2 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke={color}
        strokeWidth={stroke}
        fill="rgba(255,255,255,0.85)"
      />
      <path
        d="M8 12.5l2.5 2.5 5-5"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

export default IconCircleCheck;
