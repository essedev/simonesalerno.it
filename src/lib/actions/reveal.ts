import type { Action } from 'svelte/action';

type RevealParams = {
	/** Ritardo in ms, per lo stagger nelle liste. */
	delay?: number;
	/** rootMargin dell'observer. Default: scatta quando l'elemento è appena entrato dal
	 *  basso (~10%), così gli elementi successivi compaiono presto, con poco scroll. */
	margin?: string;
};

/**
 * Reveal-on-scroll unificato. L'elemento parte con la classe `.reveal` (opacità 0
 * + leggero offset verticale, definita in globals.css) e riceve `is-visible` quando
 * entra nel viewport, una volta sola. Sostituisce il boilerplate svelte-inview che
 * era duplicato in ogni sezione. Il motion gate (reduced motion / data-motion) è
 * gestito interamente in CSS: qui non serve controllarlo.
 */
export const reveal: Action<HTMLElement, RevealParams | undefined> = (node, params) => {
	if (params?.delay) node.style.transitionDelay = `${params.delay}ms`;

	// Le action girano solo lato client; senza IntersectionObserver mostra subito.
	if (typeof IntersectionObserver === 'undefined') {
		node.classList.add('is-visible');
		return;
	}

	const observer = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				if (!entry.isIntersecting) continue;
				// Doppio rAF: garantisce un frame con lo stato iniziale (opacity 0)
				// prima di rivelare, così la transizione parte sempre, anche per gli
				// elementi già in viewport al load (es. la hero, che altrimenti
				// "saltava" l'animazione).
				requestAnimationFrame(() => requestAnimationFrame(() => node.classList.add('is-visible')));
				observer.unobserve(node);
			}
		},
		{ rootMargin: params?.margin ?? '0px 0px -10% 0px' }
	);

	observer.observe(node);

	return {
		destroy() {
			observer.disconnect();
		}
	};
};
