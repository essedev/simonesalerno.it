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

<!-- Toggle lingua inline (IT / EN): attiva in accento, l'altra cliccabile. -->
<div class="flex items-center gap-1.5 font-mono text-sm">
	{#each languages as language, i (language.code)}
		{#if i > 0}
			<span class="text-white/20">/</span>
		{/if}
		{#if language.code === selectedLanguage}
			<span class="text-accent">{language.code.toUpperCase()}</span>
		{:else}
			{@const url = `${base}${buildLanguageUrl(language.code)}`}
			<a
				href={url}
				onclick={(e) => {
					e.preventDefault();
					goto(url, { noScroll: true });
				}}
				class="text-gray-500 transition-colors hover:text-white">{language.code.toUpperCase()}</a
			>
		{/if}
	{/each}
</div>
