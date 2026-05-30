import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    output: 'export', // Говорит Next.js собрать статику
    images: {
        unoptimized: true, // Необходимо для статического экспорта
    },
    basePath: '/tiptapdemo', // ВАЖНО: это имя твоего репозитория на GitHub (myagkowww/tiptapdemo)
};

export default nextConfig;
