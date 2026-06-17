import withSerwistInit from "@serwist/next";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // idb-keyval usa IndexedDB (API de browser). Excluímos do bundle do servidor
  // para evitar TypeError durante o prerender estático.
  serverExternalPackages: ["idb-keyval"],
};

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development", // Desativar em dev para não cachear HMR
  reloadOnOnline: false,
});

export default withSerwist(nextConfig);
