<script lang="ts">
	import type { GlobalContent } from '$lib/types';
	import { getTranslation } from '$lib/utils/translations';

	type Status = 'completed' | 'in-progress' | 'idea' | 'archived';

	// Badge di stato del progetto. Unica fonte di stile + etichetta, condivisa da
	// card (listing) e pagina di dettaglio. `class` permette al chiamante di
	// posizionarlo. Stile "riga di sistema": dot + label mono uppercase nel colore
	// dello stato. 'idea'/Esplorazione usa l'accento azzurro del brand.
	let {
		status,
		global,
		class: className = ''
	}: { status: Status; global: GlobalContent | null | undefined; class?: string } = $props();

	const STATUS_STYLE: Record<Status, string> = {
		completed: 'text-emerald-300',
		'in-progress': 'text-amber-300',
		idea: 'text-accent',
		archived: 'text-gray-400'
	};
	const STATUS_KEY = {
		completed: 'statusCompleted',
		'in-progress': 'statusInProgress',
		idea: 'statusIdea',
		archived: 'statusArchived'
	} as const;

	let label = $derived(getTranslation(global, STATUS_KEY[status]));
</script>

<span
	class="inline-flex items-center gap-1.5 font-mono text-[0.7rem] tracking-wider uppercase {STATUS_STYLE[
		status
	]} {className}"
>
	<span class="h-1.5 w-1.5 rounded-full bg-current"></span>
	{label}
</span>
