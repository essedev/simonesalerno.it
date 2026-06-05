import type { Action } from 'svelte/action';

type RevealParams = {
	/** Ritardo in ms, per lo stagger nelle liste. */
	delay?: number;
	/** rootMargin dell'observer. Default: scatta quando l'elemento e' 100px dentro dal basso. */
	margin?: string;
};

/**
 * Reveal-on-scroll unificato. L'elemento parte con la classe `.reveal` (opacita' 0
 * + leggero offset verticale, definita in globals.css) e riceve `is-visible` quando
 * entra nel viewport, una volta sola. Sostituisce il boilerplate svelte-inview che
 * era duplicato in ogni sezione. Il motion gate (reduced motion / data-motion) e'
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
				node.classList.add('is-visible');
				observer.unobserve(node);
			}
		},
		{ rootMargin: params?.margin ?? '0px 0px -100px 0px' }
	);

	observer.observe(node);

	return {
		destroy() {
			observer.disconnect();
		}
	};
};
