<script lang="ts">
	import { ACCENT_THEMES, ACCENT_COOKIE, type AccentTheme } from '$lib/themes';
	import { untrack } from 'svelte';

	// `accent` arriva dal layout (cookie risolto in SSR): l'indicatore parte gia'
	// sulla selezione giusta e il colore e' applicato pre-paint sull'attributo style
	// di <html>, quindi qui non serve ne' rileggere lo storage ne' ri-applicarlo al load.
	let { accent = 'blue', lang = 'it' }: { accent?: string; lang?: string } = $props();

	// Valore iniziale dalla prop; poi `active` e' gestito localmente da select().
	let active = $state(untrack(() => accent));
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
	function animateTo(from: AccentTheme, to: AccentTheme) {
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

	function select(theme: AccentTheme) {
		const from = ACCENT_THEMES.find((t) => t.id === active) ?? ACCENT_THEMES[0];
		if (theme.id === active) return;
		active = theme.id;
		// Cookie (non localStorage): leggibile dal server, applica il tema in SSR.
		document.cookie = `${ACCENT_COOKIE}=${theme.id}; path=/; max-age=31536000; samesite=lax`;
		if (motionReduced()) setVars(theme.accent, theme.soft);
		else animateTo(from, theme);
	}

	// Cleanup client-only del raf in volo (in un $effect, cosi' non gira in SSR).
	$effect(() => () => cancelAnimationFrame(rafId));

	let labelPrefix = $derived(lang === 'en' ? 'Accent' : 'Accento');
	let activeIndex = $derived(ACCENT_THEMES.findIndex((t) => t.id === active));
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
	{#each ACCENT_THEMES as theme (theme.id)}
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
