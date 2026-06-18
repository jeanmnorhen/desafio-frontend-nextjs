import withSerwistInit from "@serwist/next";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // idb-keyval e pusher-js usam APIs do browser. Excluímos do bundle do servidor
  // para evitar TypeError durante o prerender estático.
  serverExternalPackages: ["idb-keyval", "pusher-js"],
};

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development", // Desativar em dev para não cachear HMR
  reloadOnOnline: false,
});

export default withSerwist(nextConfig);
