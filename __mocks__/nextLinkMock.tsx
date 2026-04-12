import React from "react";

// Minimal stub for next/link — renders a plain <a> tag
const Link = ({
  href,
  children,
  ...rest
}: { href: string; children: React.ReactNode; [key: string]: any }) =>
  React.createElement("a", { href, ...rest }, children);

export default Link;
