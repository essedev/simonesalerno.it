<script lang="ts">
	import { base } from '$app/paths';
	import { page } from '$app/state';
	import type { LayoutData } from '$lib/types/content';
	import { handleAnchorClick } from '$lib/utils';
	import { Menu } from '@lucide/svelte';
	import { fade } from 'svelte/transition';
	import LanguageSelector from './ui/LanguageSelector.svelte';

	// Receive data as props from parent layout
	let {
		data,
		menuOpen = $bindable(),
		scrollY
	}: { data: LayoutData; menuOpen: boolean; scrollY: number } = $props();

	function handleMenuClick() {
		menuOpen = !menuOpen;
	}

	let isLanguageCodeValid = $derived(
		data.languages.some((l) => l.code === page.url.pathname.split('/')[1])
	);

	let show = $derived(() => scrollY > 350 && !menuOpen);
</script>

{#if show()}
	<header
		class="pointer-events-none fixed top-[1.7rem] z-50 flex w-full justify-end sm:top-4 sm:left-0 sm:justify-center"
		in:fade={{ duration: 300 }}
		out:fade={{ duration: 200 }}
	>
		<nav class="pointer-events-auto rounded-lg bg-neutral-900/20">
			<div
				class="flex items-center gap-5 rounded-lg border border-white/5 bg-white/[.03] px-5 py-2 text-base backdrop-blur-md"
			>
				<a
					href={`${base}${page.url.pathname.split('/')[2] ? '/' + data.selectedLanguage : isLanguageCodeValid ? '/' + data.selectedLanguage + '#top' : '/' + 'en'}`}
					class="me-4 pt-[0.95rem] pb-4 sm:px-3"
					onclick={handleAnchorClick}
					aria-label="Logo"
				>
					<span class="font-mono text-base font-semibold sm:text-lg"
						>esse<span class="text-accent">dev</span></span
					>
				</a>

				{#each data.global.navigation as route (route.name)}
					<a
						href={`${base}/${data.selectedLanguage}${route.link}`}
						class="hidden px-3 sm:flex"
						onclick={handleAnchorClick}>{route.name}</a
					>
				{/each}

				<div class="hidden sm:flex">
					<LanguageSelector
						languages={data.languages}
						selectedLanguage={data.selectedLanguage}
						navigation={data.navigation}
						slugMap={data.slugMap}
					/>
				</div>

				<div class="flex h-10 w-10 items-center justify-center sm:hidden">
					{#if !menuOpen}
						<button
							class="flex h-10 w-10 items-center justify-center"
							transition:fade={{ duration: 100 }}
							onclick={handleMenuClick}
						>
							<Menu class="h-9 w-9" />
						</button>
					{/if}
				</div>
			</div>
		</nav>
	</header>
{/if}
