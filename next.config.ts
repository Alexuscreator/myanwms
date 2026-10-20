import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export', // Добавляем для статического экспорта
  // cacheComponents и partialPrefetching нужно убрать
};

export default nextConfig;
