<script lang="ts">
	import { browser } from '$app/environment';

	let { lang = 'it' }: { lang?: string } = $props();

	type Theme = {
		id: string;
		accent: string;
		soft: string;
		h: number;
		s: number;
		l: number;
		it: string;
		en: string;
	};

	// I tre accenti. 'blue' e' il default del brand (gia' nel token CSS e usato dalle
	// OG pre-generate); gli altri sono variazioni scelte dal visitatore. Sovrascrivere
	// --color-accent su <html> cambia tutto il sito (text/border/bg-accent, glow e
	// ombre derivano dal token). Ogni tema porta anche HSL per animare la transizione.
	const THEMES: Theme[] = [
		{
			id: 'blue',
			accent: '#2cc3f7',
			soft: '#7dd9fb',
			h: 197,
			s: 92,
			l: 57,
			it: 'Azzurro',
			en: 'Blue'
		},
		{
			id: 'orange',
			accent: '#ff7a1a',
			soft: '#ffae73',
			h: 28,
			s: 100,
			l: 55,
			it: 'Arancione',
			en: 'Orange'
		},
		{
			id: 'violet',
			accent: '#a855f7',
			soft: '#c9a8fb',
			h: 271,
			s: 91,
			l: 65,
			it: 'Viola',
			en: 'Violet'
		}
	];

	let active = $state('blue');
	let rafId = 0;

	function setVars(accent: string, soft: string) {
		const el = document.documentElement;
		el.style.setProperty('--color-accent', accent);
		el.style.setProperty('--color-accent-soft', soft);
	}

	// Replica la logica motion del sito (data-motion override + prefers-reduced-motion).
	function motionReduced(): boolean {
		const m = document.documentElement.dataset.motion;
		if (m === 'reduced') return true;
		if (m === 'full') return false;
		return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	}

	const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

	// "Ricalibrazione dell'hue": ruota la tinta dal colore attuale al nuovo lungo il
	// percorso piu' breve del cerchio cromatico, poi fa snap al valore esatto.
	function animateTo(from: Theme, to: Theme) {
		cancelAnimationFrame(rafId);
		let dh = to.h - from.h;
		if (dh > 180) dh -= 360;
		if (dh < -180) dh += 360;
		const duration = 600;
		const start = performance.now();
		const step = (now: number) => {
			const t = Math.min(1, (now - start) / duration);
			const e = easeInOutCubic(t);
			const h = from.h + dh * e;
			const s = from.s + (to.s - from.s) * e;
			const l = from.l + (to.l - from.l) * e;
			setVars(
				`hsl(${h.toFixed(1)} ${s.toFixed(1)}% ${l.toFixed(1)}%)`,
				`hsl(${h.toFixed(1)} ${Math.max(s - 8, 0).toFixed(1)}% ${Math.min(l + 18, 90).toFixed(1)}%)`
			);
			if (t < 1) rafId = requestAnimationFrame(step);
			else setVars(to.accent, to.soft);
		};
		rafId = requestAnimationFrame(step);
	}

	// All'avvio ripristina la scelta salvata, sempre istantaneo (niente sweep al load).
	$effect(() => {
		if (!browser) return;
		const stored = localStorage.getItem('accent');
		const theme = THEMES.find((t) => t.id === stored) ?? THEMES[0];
		active = theme.id;
		setVars(theme.accent, theme.soft);
		return () => cancelAnimationFrame(rafId);
	});

	function select(theme: Theme) {
		const from = THEMES.find((t) => t.id === active) ?? THEMES[0];
		if (theme.id === active) return;
		active = theme.id;
		localStorage.setItem('accent', theme.id);
		if (motionReduced()) setVars(theme.accent, theme.soft);
		else animateTo(from, theme);
	}

	let labelPrefix = $derived(lang === 'en' ? 'Accent' : 'Accento');
	let activeIndex = $derived(THEMES.findIndex((t) => t.id === active));
</script>

<div
	class="fixed bottom-6 left-6 z-50 flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.02] p-1.5 backdrop-blur-md"
	role="group"
	aria-label={labelPrefix}
>
	<!-- Indicatore di selezione che scivola tra i quadratini (passo = w-5 + gap-1.5 = 26px). -->
	<span
		class="pointer-events-none absolute top-1.5 left-1.5 h-5 w-5 rounded-sm ring-2 ring-white/80 ring-offset-2 ring-offset-black transition-transform duration-300 ease-out"
		style="transform: translateX({activeIndex * 26}px);"
	></span>
	{#each THEMES as theme (theme.id)}
		<button
			type="button"
			onclick={() => select(theme)}
			aria-label="{labelPrefix} {lang === 'en' ? theme.en : theme.it}"
			aria-pressed={active === theme.id}
			class="h-5 w-5 cursor-pointer rounded-sm transition-transform hover:scale-110"
			style="background-color: {theme.accent};"
		></button>
	{/each}
</div>
