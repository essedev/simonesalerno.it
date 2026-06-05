<script lang="ts">
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import { page } from '$app/state';
	import type { LanguageSelectorProps } from '$lib/types';
	import { getLanguageUrl } from '$lib/utils/language-url';

	// Props ricevuti dal layout parent.
	let {
		languages = [],
		selectedLanguage = 'en',
		navigation = {},
		slugMap = { projects: {}, articles: {} }
	}: LanguageSelectorProps = $props();

	function buildLanguageUrl(targetLang: string): string {
		return getLanguageUrl({
			pathname: page.url.pathname,
			search: page.url.search,
			navigation,
			slugMap,
			targetLang
		});
	}
</script>

<!-- Selettore lingua come segmented control mono: cella attiva in accento,
     l'altra spenta e cliccabile. -->
<div
	class="inline-flex items-center gap-0.5 rounded-md border border-white/10 bg-white/[0.02] p-0.5 font-mono text-xs"
	role="group"
	aria-label="Lingua"
>
	{#each languages as language (language.code)}
		{#if language.code === selectedLanguage}
			<span aria-current="true" class="rounded-sm bg-accent/15 px-2 py-0.5 text-accent"
				>{language.code.toUpperCase()}</span
			>
		{:else}
			{@const url = `${base}${buildLanguageUrl(language.code)}`}
			<a
				href={url}
				onclick={(e) => {
					e.preventDefault();
					goto(url, { noScroll: true });
				}}
				class="rounded-sm px-2 py-0.5 text-gray-500 transition-colors hover:bg-white/5 hover:text-white"
				>{language.code.toUpperCase()}</a
			>
		{/if}
	{/each}
</div>
