<script lang="ts">
	import { base } from '$app/paths';
	import { page } from '$app/state';
	import type { LayoutData } from '$lib/types/content';
	import { handleAnchorClick } from '$lib/utils';
	import { Menu, X } from '@lucide/svelte';
	import { fade } from 'svelte/transition';
	import Logo from './Logo.svelte';
	import LanguageSelector from './ui/LanguageSelector.svelte';

	// Ricevi dati come props
	let {
		data,
		menuOpen = $bindable(),
		isFloatingNavVisible = false
	}: { data: LayoutData; menuOpen: boolean; isFloatingNavVisible?: boolean } = $props();

	function handleMenuClick() {
		menuOpen = !menuOpen;
	}

	let isLanguageCodeValid = $derived(
		data.languages.some((l) => l.code === page.url.pathname.split('/')[1])
	);
</script>

<header id="top" class="border-b border-white/5">
	<nav
		class="mx-auto flex w-full max-w-screen-2xl items-center justify-between px-4 py-6 sm:px-8 lg:px-14"
	>
		<a
			href={`${base}${page.url.pathname.split('/')[2] ? '/' + data.selectedLanguage : isLanguageCodeValid ? '/' + data.selectedLanguage + '#top' : '/' + 'en'}`}
			onclick={handleAnchorClick}
			aria-label="Simone Salerno"
		>
			<Logo />
		</a>

		<div
			class="hidden items-center gap-x-7 text-base whitespace-nowrap lg:flex lg:gap-x-9 lg:text-lg"
		>
			{#each data.global.navigation as route, i (route.name)}
				<a
					href={`${base}/${data.selectedLanguage}${route.link}`}
					onclick={handleAnchorClick}
					class="group flex items-baseline gap-x-2 text-gray-400 transition-colors hover:text-white"
				>
					<span class="font-mono text-xs text-accent/70 transition-colors group-hover:text-accent"
						>0{i + 1}</span
					>
					<span>{route.name}</span>
				</a>
			{/each}

			<div class="2xl:ms-2">
				<LanguageSelector
					languages={data.languages}
					selectedLanguage={data.selectedLanguage}
					navigation={data.navigation}
					slugMap={data.slugMap}
				/>
			</div>
		</div>

		<div class="flex h-10 w-10 items-center justify-center lg:hidden">
			{#if menuOpen}
				<div class="fixed top-10 left-7 z-40" transition:fade={{ duration: 300 }}>
					<LanguageSelector
						languages={data.languages}
						selectedLanguage={data.selectedLanguage}
						navigation={data.navigation}
						slugMap={data.slugMap}
					/>
				</div>

				<button
					class={`fixed top-[2.8rem] z-40 flex h-10 w-10 items-center justify-center ${isFloatingNavVisible ? 'right-4' : 'right-9'}`}
					transition:fade={{ duration: 300 }}
					onclick={handleMenuClick}
				>
					<X class="h-9 w-9" />
				</button>

				<div
					class="fullscreen-overlay z-30 flex flex-col items-center justify-center bg-black/60 text-2xl backdrop-blur-sm"
					transition:fade={{ duration: 300 }}
				>
					<div class="flex flex-col gap-y-3">
						{#each data.global.navigation as route (route.name)}
							<a
								href={`${base}/${data.selectedLanguage}${route.link}`}
								onclick={(event) => (handleAnchorClick(event), handleMenuClick())}>{route.name}</a
							>
						{/each}
					</div>
				</div>
			{:else}
				<button transition:fade={{ duration: 300 }} onclick={handleMenuClick}>
					<Menu class="h-9 w-9" />
				</button>
			{/if}
		</div>
	</nav>

	<div
		class="mx-auto flex w-full max-w-screen-2xl items-center justify-between border-t border-white/5 px-4 py-1.5 font-mono text-[0.7rem] tracking-wide text-gray-500 sm:px-8 lg:px-14"
	>
		<span>Human vision &middot; <span class="text-accent">AI execution</span></span>
		<span class="hidden sm:block">Milano, IT</span>
	</div>
</header>
