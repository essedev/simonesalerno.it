/**
 * Pre-genera le immagini OG a build time (Node) come PNG statici in static/og/.
 * Riusa la stessa pipeline del vecchio endpoint runtime: OgDataResolver ->
 * generateHtmlLayout -> satori (HTML->SVG) -> sharp (SVG->PNG). Niente più
 * generazione runtime sul Worker, niente endpoint, niente superficie injection.
 *
 * Va eseguito con vite-node (per risolvere $lib e import.meta.glob):
 *   vite-node --config vite.og.config.ts scripts/generate-og-images.ts
 */
import { Resvg } from '@resvg/resvg-js';
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import satori from 'satori';
import { html } from 'satori-html';
import sharp from 'sharp';
import { ContentLoader } from '../src/lib/utils/content';
import { OgDataResolver } from '../src/lib/utils/og/data-resolver';
import {
	createLaboratoryBackgroundSvg,
	generateHtmlLayout
} from '../src/lib/utils/og/html-generator';

const OUT_DIR = join(process.cwd(), 'static/og');
const MONO_DIR = join(process.cwd(), 'node_modules/@fontsource/martian-mono/files');
const SANS_DIR = join(process.cwd(), 'node_modules/@fontsource/ibm-plex-sans/files');
const WIDTH = 1200;
const HEIGHT = 630;
// Noise applicato via sharp (composite) DOPO il render, non dentro satori: evita di
// processare un data-URI da 170KB per ogni immagine (era ~il 99% del tempo).
// Opacità 0.5 + blend overlay, come la vecchia background CSS.
const NOISE_PATH = join(process.cwd(), 'static/noise.png');
const NOISE_OPACITY = 0.5;

// satori supporta woff (non woff2): usiamo i .woff di @fontsource (offline e
// deterministici, niente fetch a build time). Martian Mono per logo/etichette,
// IBM Plex Sans per titoli/testo (stesso accoppiamento del sito).
function loadFont(dir: string, family: string, weight: number): Buffer {
	return readFileSync(join(dir, `${family}-latin-${weight}-normal.woff`));
}

interface Job {
	name: string;
	params: Parameters<OgDataResolver['resolveLayout']>[0];
}

async function main(): Promise<void> {
	if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

	const fonts = [
		{
			name: 'Martian Mono',
			data: loadFont(MONO_DIR, 'martian-mono', 400),
			weight: 400 as const,
			style: 'normal' as const
		},
		{
			name: 'Martian Mono',
			data: loadFont(MONO_DIR, 'martian-mono', 500),
			weight: 500 as const,
			style: 'normal' as const
		},
		{
			name: 'Martian Mono',
			data: loadFont(MONO_DIR, 'martian-mono', 700),
			weight: 700 as const,
			style: 'normal' as const
		},
		{
			name: 'IBM Plex Sans',
			data: loadFont(SANS_DIR, 'ibm-plex-sans', 400),
			weight: 400 as const,
			style: 'normal' as const
		},
		{
			name: 'IBM Plex Sans',
			data: loadFont(SANS_DIR, 'ibm-plex-sans', 500),
			weight: 500 as const,
			style: 'normal' as const
		},
		{
			name: 'IBM Plex Sans',
			data: loadFont(SANS_DIR, 'ibm-plex-sans', 600),
			weight: 600 as const,
			style: 'normal' as const
		}
	];

	const resolver = new OgDataResolver();
	const loader = new ContentLoader();
	const languages = (await loader.loadConfig('languages')).map((l) => l.code);

	const jobs: Job[] = [];

	// Home (una sola, il layout non dipende dalla lingua)
	jobs.push({ name: 'home', params: { type: 'home', lang: languages[0] } });

	// Listing: una per sezione e lingua
	for (const lang of languages) {
		for (const section of ['projects', 'blog'] as const) {
			jobs.push({ name: `listing-${section}-${lang}`, params: { type: 'listing', section, lang } });
		}
	}

	// Detail progetti: una per traduzione disponibile
	const projects = await loader.loadProjects();
	for (const p of projects) {
		for (const lang of Object.keys(p.translations)) {
			const t = p.translations[lang];
			jobs.push({
				name: `detail-projects-${p.meta.id}-${lang}`,
				params: {
					type: 'detail',
					section: 'projects',
					lang,
					title: t.title,
					excerpt: t.excerpt,
					imageKey: p.meta.og_image_key
				}
			});
		}
	}

	// Detail articoli
	const articles = await loader.loadArticles();
	for (const a of articles) {
		for (const lang of Object.keys(a.translations)) {
			const t = a.translations[lang];
			jobs.push({
				name: `detail-blog-${a.meta.id}-${lang}`,
				params: {
					type: 'detail',
					section: 'blog',
					lang,
					title: t.title,
					excerpt: t.excerpt,
					imageKey: a.meta.og_image_key
				}
			});
		}
	}

	// Tile noise: scala l'alpha esistente del PNG per NOISE_OPACITY (dest-in con un
	// pixel bianco a quell'opacità), da applicare poi in overlay sulla base.
	const noiseTile = await sharp(NOISE_PATH)
		.ensureAlpha()
		.composite([
			{
				input: Buffer.from([255, 255, 255, Math.round(255 * NOISE_OPACITY)]),
				raw: { width: 1, height: 1, channels: 4 },
				tile: true,
				blend: 'dest-in'
			}
		])
		.png()
		.toBuffer();

	// Helper: layout HTML -> PNG buffer (satori -> resvg)
	const renderPng = async (layout: string): Promise<Buffer> => {
		const markup = html(layout);
		const svg = await satori(markup as Parameters<typeof satori>[0], {
			width: WIDTH,
			height: HEIGHT,
			fonts
		});
		return new Resvg(svg, { fitTo: { mode: 'width', value: WIDTH } }).render().asPng();
	};

	// Base condivisa (sfondo Laboratorio + noise in overlay), calcolata UNA volta: il
	// noise sta SOTTO il contenuto. Lo sfondo e' un SVG (grid prospettico + glow) reso
	// da resvg, non da satori che non gestisce grid/prospettiva.
	const basePng = new Resvg(createLaboratoryBackgroundSvg(), {
		fitTo: { mode: 'width', value: WIDTH }
	})
		.render()
		.asPng();
	const baseImage = await sharp(basePng)
		.composite([{ input: noiseTile, tile: true, blend: 'overlay' }])
		.png()
		.toBuffer();

	let count = 0;
	for (const job of jobs) {
		const config = await resolver.resolveLayout(job.params);
		// Contenuto su sfondo trasparente, composito SOPRA la base (gradiente+noise)
		const content = await renderPng(generateHtmlLayout(config));
		await sharp(baseImage)
			.composite([{ input: content }])
			.png({ compressionLevel: 9 })
			.toFile(join(OUT_DIR, `${job.name}.png`));
		count++;
	}

	console.log(`Generated ${count} OG images in static/og/`);
}

main().catch((error) => {
	console.error('OG generation failed:', error);
	process.exit(1);
});
