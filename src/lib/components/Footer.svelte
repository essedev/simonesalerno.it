<script lang="ts">
	import { base } from '$app/paths';
	import { page } from '$app/state';
	import type { FooterProps } from '$lib/types';
	import { handleAnchorClick } from '$lib/utils';
	import { getTranslation } from '$lib/utils/translations';
	import Logo from './Logo.svelte';
	import MotionToggle from './ui/MotionToggle.svelte';

	let { data }: FooterProps = $props();

	let isLanguageCodeValid = $derived(
		data.languages.some((l) => l.code === page.url.pathname.split('/')[1])
	);

	let copyrightText = $derived(getTranslation(data.global, 'copyright'));

	let homeHref = $derived(
		`${base}${page.url.pathname.split('/')[2] ? '/' + data.selectedLanguage : isLanguageCodeValid ? '/' + data.selectedLanguage + '#top' : '/en'}`
	);
</script>

<footer class="mt-12 border-t border-white/5">
	<div class="mx-auto w-full max-w-screen-2xl px-4 py-12 sm:px-8 lg:px-14">
		<div class="flex flex-col justify-between gap-10 md:flex-row">
			<!-- Brand -->
			<div class="flex flex-col gap-3">
				<a href={homeHref} onclick={handleAnchorClick} aria-label="essedev">
					<Logo />
				</a>
				<p class="font-mono text-sm text-gray-500">
					half engineer, <span class="text-accent">half wizard</span>
				</p>
			</div>

			<!-- Navigazione -->
			<nav class="flex flex-col gap-2 font-mono text-sm">
				{#each data.global.navigation as route (route.name)}
					<a
						href={`${base}/${data.selectedLanguage}${route.link}`}
						onclick={handleAnchorClick}
						class="text-gray-400 transition-colors hover:text-accent">{route.name}</a
					>
				{/each}
			</nav>
		</div>

		<!-- Riga di sistema -->
		<div
			class="mt-10 flex flex-col gap-3 border-t border-white/5 pt-6 font-mono text-xs text-gray-500 sm:flex-row sm:items-center sm:justify-between"
		>
			<span>{copyrightText}</span>
			<div class="flex flex-wrap items-center gap-x-4 gap-y-2">
				<a
					href={`${base}/${data.selectedLanguage}/rss.xml`}
					class="transition-colors hover:text-accent">RSS</a
				>
				<a href={`${base}/sitemap.xml`} class="transition-colors hover:text-accent">Sitemap</a>
				<a
					href="https://github.com/essedev/simonesalerno.it"
					target="_blank"
					rel="noreferrer"
					class="transition-colors hover:text-accent">Source</a
				>
				<MotionToggle lang={data.selectedLanguage} />
			</div>
		</div>
	</div>
</footer>
