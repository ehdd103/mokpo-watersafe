import type { MetadataRoute } from "next";
export default function manifest(): MetadataRoute.Manifest { return { name: "목포 워터세이프", short_name: "워터세이프", description: "목포시 수인성 질병 위험 대응 지도 · 가상 데이터", start_url: "/", display: "standalone", background_color: "#f8fafc", theme_color: "#0e7490", lang: "ko", icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }] }; }
