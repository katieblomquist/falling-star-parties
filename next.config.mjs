/** @type {import('next').NextConfig} */
const nextConfig = {
  // @react-pdf/renderer uses React.Component as a class constructor internally.
  // Bundling it through the RSC bundler gives it a different React instance,
  // causing "Component is not a constructor". Externalising it makes Next.js
  // load it natively via Node require, which resolves the singleton correctly.
  serverExternalPackages: ["@react-pdf/renderer", "@react-pdf/reconciler"],
};
export default nextConfig;
