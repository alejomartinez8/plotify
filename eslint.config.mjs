import nextConfig from "eslint-config-next";

const eslintConfig = [{ ignores: ["coverage/**"] }, ...nextConfig];

export default eslintConfig;
