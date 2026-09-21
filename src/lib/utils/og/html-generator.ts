import { escapeHtml } from './escape.js';
import { OG_CONSTANTS, type LayoutConfig } from './layouts.js';

const { WIDTH, HEIGHT, COLORS } = OG_CONSTANTS;
const MONO = OG_CONSTANTS.FONTS.MONO;
const SANS = OG_CONSTANTS.FONTS.SANS;

/**
 * Sfondo "Laboratorio": nero + pavimento a griglia in prospettiva con glow cyan.
 * E' un SVG standalone (renderizzato da resvg nello script, non da satori, che non
 * gestisce grid/prospettiva). Le linee convergono verso un punto di fuga sull'orizzonte;
 * un radial glow cyan illumina il pavimento, un fade nero in alto tiene pulita l'area testo.
 */
export function createLaboratoryBackgroundSvg(): string {
	const horizon = 300;
	const vpx = WIDTH / 2;
	const a = COLORS.ACCENT;
	const lines: string[] = [];

	// linee verticali che convergono al punto di fuga
	for (let xb = -700; xb <= WIDTH + 700; xb += 88) {
		lines.push(
			`<line x1="${xb}" y1="${HEIGHT}" x2="${vpx}" y2="${horizon}" stroke="${a}" stroke-width="1.5" stroke-opacity="0.12"/>`
		);
	}
	// linee orizzontali con spaziatura prospettica (fitte verso l'orizzonte)
	const N = 13;
	for (let i = 1; i <= N; i++) {
		const t = i / N;
		const y = horizon + (HEIGHT - horizon) * t * t;
		const op = (0.05 + 0.15 * t).toFixed(3);
		lines.push(
			`<line x1="0" y1="${y.toFixed(1)}" x2="${WIDTH}" y2="${y.toFixed(1)}" stroke="${a}" stroke-width="1.5" stroke-opacity="${op}"/>`
		);
	}

	return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
		<defs>
			<radialGradient id="glow" cx="50%" cy="60%" r="58%">
				<stop offset="0%" stop-color="${a}" stop-opacity="0.20"/>
				<stop offset="42%" stop-color="${a}" stop-opacity="0.05"/>
				<stop offset="100%" stop-color="${a}" stop-opacity="0"/>
			</radialGradient>
			<linearGradient id="topfade" x1="0" y1="0" x2="0" y2="1">
				<stop offset="0%" stop-color="${COLORS.BG}" stop-opacity="1"/>
				<stop offset="30%" stop-color="${COLORS.BG}" stop-opacity="1"/>
				<stop offset="50%" stop-color="${COLORS.BG}" stop-opacity="0"/>
			</linearGradient>
		</defs>
		<rect width="${WIDTH}" height="${HEIGHT}" fill="${COLORS.BG}"/>
		<rect width="${WIDTH}" height="${HEIGHT}" fill="url(#glow)"/>
		<g>${lines.join('')}</g>
		<rect width="${WIDTH}" height="${HEIGHT}" fill="url(#topfade)"/>
		<rect x="0" y="${horizon}" width="${WIDTH}" height="2" fill="${a}" opacity="0.08"/>
	</svg>`;
}

/** Contenitore radice trasparente (il contenuto va composito SOPRA lo sfondo). */
function baseContainer(children: string, extra = ''): string {
	return `<div style="display:flex; width:${WIDTH}px; height:${HEIGHT}px; position:relative; background:transparent; font-family:'${SANS}'; color:${COLORS.TEXT.PRIMARY}; ${extra}">${children}</div>`;
}

/** Logo testuale essedev (Martian Mono, "dev" in accento). */
function essedevLogo(fontSize: number): string {
	return `<div style="display:flex; align-items:center; font-family:'${MONO}'; font-weight:700; font-size:${fontSize}px; letter-spacing:-0.03em;"><span style="color:${COLORS.TEXT.PRIMARY};">esse</span><span style="color:${COLORS.ACCENT};">dev</span></div>`;
}

/** Riga di stato mono "Human vision · AI execution". */
function statusLine(): string {
	return `<div style="display:flex; align-items:center; font-family:'${MONO}'; font-weight:500; font-size:18px; letter-spacing:0.02em; color:${COLORS.TEXT.MUTED};"><span>Human vision</span><span style="color:${COLORS.ACCENT}; margin:0 10px;">·</span><span style="color:${COLORS.ACCENT};">AI execution</span></div>`;
}

/**
 * Home: status line in alto, nome come titolo + marchio/ruolo mono, location in basso.
 */
export function createHomeHtml(): string {
	const content = `
		<div style="display:flex; flex-direction:column; justify-content:space-between; width:100%; height:100%; padding:68px 90px;">
			${statusLine()}
			<div style="display:flex; flex-direction:column;">
				<div style="display:flex; font-family:'${SANS}'; font-weight:600; font-size:88px; letter-spacing:-0.02em; color:${COLORS.TEXT.PRIMARY};"><span>Simone Salerno</span></div>
				<div style="display:flex; align-items:center; font-family:'${MONO}'; font-weight:500; font-size:30px; margin-top:22px;"><span style="color:${COLORS.TEXT.SECONDARY};">esse</span><span style="color:${COLORS.ACCENT};">dev</span><span style="color:${COLORS.TEXT.FAINT}; margin:0 16px;">·</span><span style="color:${COLORS.TEXT.MUTED};">AI Engineer</span></div>
			</div>
			<div style="display:flex; font-family:'${MONO}'; font-weight:500; font-size:18px; color:${COLORS.TEXT.FAINT};"><span>Milano, IT</span></div>
		</div>`;
	return baseContainer(content);
}

/**
 * Listing: status line in alto, titolo sezione grande al centro, logo essedev in basso.
 */
export function createListingHtml(title: string, subtitle?: string): string {
	const sub = subtitle
		? `<div style="display:flex; font-family:'${SANS}'; font-weight:400; font-size:30px; color:${COLORS.TEXT.MUTED}; margin-top:18px;"><span>${escapeHtml(subtitle)}</span></div>`
		: '';
	const content = `
		<div style="display:flex; flex-direction:column; justify-content:space-between; width:100%; height:100%; padding:68px 90px;">
			${statusLine()}
			<div style="display:flex; flex-direction:column;">
				<div style="display:flex; font-family:'${SANS}'; font-weight:600; font-size:82px; letter-spacing:-0.01em; color:${COLORS.TEXT.PRIMARY};"><span>${escapeHtml(title)}</span></div>
				${sub}
			</div>
			${essedevLogo(30)}
		</div>`;
	return baseContainer(content);
}

/**
 * Detail: logo in alto, titolo + excerpt (con eventuale cover a destra), status line in basso.
 */
export function createDetailHtml(title: string, excerpt?: string, coverImage?: string): string {
	// Cover disabilitata: le featured sono placeholder-only (vedi docs), quindi OG
	// detail text-only. Per riattivare le cover reali in futuro: SHOW_COVER = true.
	const SHOW_COVER = false;
	const hasImage = SHOW_COVER && !!coverImage;
	const trimmed = excerpt
		? excerpt.length > 160
			? excerpt.slice(0, 160) + '...'
			: excerpt
		: undefined;

	const textCol = `
		<div style="display:flex; flex-direction:column; width:${hasImage ? '600px' : '100%'};">
			<div style="display:flex; font-family:'${SANS}'; font-weight:600; font-size:52px; line-height:1.1; letter-spacing:-0.01em; color:${COLORS.TEXT.PRIMARY};"><span>${escapeHtml(title)}</span></div>
			${
				trimmed
					? `<div style="display:flex; font-family:'${SANS}'; font-weight:400; font-size:24px; line-height:1.4; color:${COLORS.TEXT.MUTED}; margin-top:24px;"><span>${escapeHtml(trimmed)}</span></div>`
					: ''
			}
		</div>`;

	const imageCol = hasImage
		? `<div style="display:flex; align-items:center; justify-content:center;"><img src="${coverImage}" style="width:380px; height:300px; border-radius:16px; object-fit:cover; border:2px solid rgba(44,195,247,0.45);" /></div>`
		: '';

	const content = `
		<div style="display:flex; flex-direction:column; justify-content:space-between; width:100%; height:100%; padding:68px 90px;">
			${essedevLogo(30)}
			<div style="display:flex; flex-direction:row; align-items:center; gap:56px;">
				${textCol}
				${imageCol}
			</div>
			${statusLine()}
		</div>`;
	return baseContainer(content);
}

/**
 * Generate HTML layout based on type and data
 */
export function generateHtmlLayout(config: LayoutConfig): string {
	switch (config.type) {
		case 'home':
			return createHomeHtml();
		case 'listing':
			return createListingHtml(config.title || 'Page', config.subtitle);
		case 'detail':
			return createDetailHtml(config.title || 'Article', config.excerpt, config.coverImage);
		default:
			return createHomeHtml();
	}
}
