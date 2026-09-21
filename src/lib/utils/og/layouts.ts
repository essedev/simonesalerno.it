import { logoBase64 } from '$lib/assets/logo-base64.js';

/**
 * Common styles and constants for OG layouts (restyle "Laboratorio")
 */
export const OG_CONSTANTS = {
	WIDTH: 1200,
	HEIGHT: 630,
	COLORS: {
		BG: '#0c0c0c',
		ACCENT: '#2cc3f7',
		ACCENT_SOFT: '#7dd9fb',
		TEXT: {
			PRIMARY: '#f4f4f5',
			SECONDARY: '#d4d4d8',
			MUTED: '#8a8a8a',
			FAINT: '#5a5a5a'
		}
	},
	FONTS: {
		MONO: 'Martian Mono',
		SANS: 'IBM Plex Sans'
	}
} as const;

/**
 * Base layout configuration for different page types
 */
export interface LayoutConfig {
	type: 'home' | 'listing' | 'detail';
	title?: string;
	subtitle?: string;
	excerpt?: string;
	coverImage?: string;
}

/**
 * Create home page layout data
 */
export function createHomeLayoutData(): LayoutConfig & {
	logo: { src: string; width: number; height: number };
	brandText: { primary: string; secondary: string };
} {
	return {
		type: 'home',
		logo: { src: logoBase64, width: 180, height: 180 },
		brandText: { primary: 'esse', secondary: 'dev' }
	};
}

/**
 * Create listing page layout data
 */
export function createListingLayoutData(
	title: string,
	subtitle?: string
): LayoutConfig & {
	logo: { src: string; width: number; height: number };
} {
	return {
		type: 'listing',
		title,
		subtitle,
		logo: { src: logoBase64, width: 80, height: 80 }
	};
}

/**
 * Create detail page layout data
 */
export function createDetailLayoutData(
	title: string,
	excerpt?: string,
	coverImage?: string
): LayoutConfig & {
	logo: { src: string; width: number; height: number };
	hasImage: boolean;
} {
	return {
		type: 'detail',
		title,
		excerpt: excerpt && excerpt.length > 200 ? excerpt.slice(0, 200) + '...' : excerpt,
		coverImage,
		logo: { src: logoBase64, width: 120, height: 120 },
		hasImage: !!coverImage
	};
}
