import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import { autolinkConfig } from "./plugins/rehype-autolink-config";
import rehypeSlug from "rehype-slug";
import astroI18next from "astro-i18next";
import alpinejs from "@astrojs/alpinejs";
import AstroPWA from "@vite-pwa/astro";
import icon from "astro-icon";
import vercel from "@astrojs/vercel"; // Tambahkan adapter Vercel

// https://astro.build/config
export default defineConfig({
	site: "https://astros.zank.studio",
	output: "static", // Pastikan output static untuk Vercel
	adapter: vercel(), // Tambahkan adapter Vercel

	vite: {
		define: {
			__DATE__: `'${new Date().toISOString()}'`,
		},
	},

	integrations: [
		tailwind(),
		sitemap(),
		// Konfigurasi astro-i18next yang benar untuk Vercel
		astroI18next({
			defaultLocale: "en",
			locales: ["en", "id"],
			// Gunakan loadPath untuk file JSON
			loadPath: "./src/locales/{{lng}}/{{ns}}.json",
			// Atau jika mau tetap di public folder:
			// loadPath: "./public/locales/{{lng}}/{{ns}}.json",
			i18next: {
				interpolation: {
					escapeValue: false
				},
				// Fallback ke bahasa default jika terjemahan tidak ditemukan
				fallbackLng: "en",
				// Debug hanya di development
				debug: process.env.NODE_ENV === "development"
			}
		}),
		alpinejs(),
		AstroPWA({
			mode: "production",
			base: "/",
			scope: "/",
			includeAssets: ["favicon.svg"],
			registerType: "autoUpdate",
			manifest: {
				name: "Astros - Starter Template for Astro with Tailwind CSS",
				short_name: "Astros",
				theme_color: "#ffffff",
				icons: [
					{
						src: "pwa-192x192.png",
						sizes: "192x192",
						type: "image/png",
					},
					{
						src: "pwa-512x512.png",
						sizes: "512x512",
						type: "image/png",
					},
					{
						src: "pwa-512x512.png",
						sizes: "512x512",
						type: "image/png",
						purpose: "any maskable",
					},
				],
			},
			workbox: {
				navigateFallback: "/404",
				globPatterns: ["*.js"],
				// Tambahkan file locales ke cache
				runtimeCaching: [
					{
						urlPattern: /\/locales\/.*\.json/,
						handler: 'CacheFirst',
						options: {
							cacheName: 'locales-cache',
							expiration: {
								maxEntries: 10,
								maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
							}
						}
					}
				]
			},
			devOptions: {
				enabled: false,
				navigateFallbackAllowlist: [/^\/404$/],
				suppressWarnings: true,
			},
		}),
		icon(),
	],

	markdown: {
		rehypePlugins: [
			rehypeSlug,
			[rehypeAutolinkHeadings, autolinkConfig],
		],
	},

	experimental: {
		contentCollectionCache: true,
	},

	// Build optimization untuk Vercel
	build: {
		format: 'directory',
		inlineStylesheets: 'auto'
	}
});