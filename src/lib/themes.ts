// Temi accento del sito: fonte unica condivisa tra l'AccentPicker (client, per i
// label e l'applicazione del colore) e il lato server (hooks + layout, per applicare
// il tema salvato pre-paint dal cookie ed evitare il flash al caricamento). 'blue' è
// il default del brand: è già nel token CSS (@theme) e usato dalle OG pre-generate.

export type AccentTheme = {
	id: string;
	accent: string;
	soft: string;
	it: string;
	en: string;
};

export const ACCENT_THEMES: AccentTheme[] = [
	{
		id: 'blue',
		accent: '#2cc3f7',
		soft: '#7dd9fb',
		it: 'Azzurro',
		en: 'Blue'
	},
	{
		id: 'orange',
		accent: '#ff7a1a',
		soft: '#ffae73',
		it: 'Arancione',
		en: 'Orange'
	},
	{
		id: 'violet',
		accent: '#a855f7',
		soft: '#c9a8fb',
		it: 'Viola',
		en: 'Violet'
	}
];

export const ACCENT_COOKIE = 'accent';
export const DEFAULT_ACCENT = 'blue';

/** Id di tema valido, con fallback al default per valori sconosciuti o assenti. */
export function resolveAccentId(id: string | undefined | null): string {
	return ACCENT_THEMES.some((t) => t.id === id) ? (id as string) : DEFAULT_ACCENT;
}

/**
 * Variabili CSS per l'attributo `style` su <html> (applicazione SSR del tema).
 * Vuoto per il default: è già definito nel token @theme, niente da sovrascrivere.
 */
export function accentStyleVars(id: string | undefined | null): string {
	const t = ACCENT_THEMES.find((x) => x.id === id);
	if (!t || t.id === DEFAULT_ACCENT) return '';
	return `--color-accent:${t.accent};--color-accent-soft:${t.soft}`;
}
