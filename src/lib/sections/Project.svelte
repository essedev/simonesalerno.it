<script lang="ts">
	import { base } from '$app/paths';
	import BackLink from '$lib/components/BackLink.svelte';
	import OptimizedImage from '$lib/components/OptimizedImage.svelte';
	import StatusBadge from '$lib/components/StatusBadge.svelte';
	import ContentRenderer from '$lib/components/ui/ContentRenderer.svelte';
	import type { ProjectSectionProps } from '$lib/types';
	import { getTranslation, translateTags } from '$lib/utils/translations';
	import { ExternalLink } from '@lucide/svelte';
	import { reveal } from '$lib/actions/reveal';

	// Receive props from parent
	let { content, currentLang, global, navigation }: ProjectSectionProps = $props();

	// Get translation with type safety
	let backText = $derived(getTranslation(global, 'back'));

	let currentTranslation = $derived(content.translations[currentLang]);
	let projectsRoute = $derived(navigation?.[currentLang]?.projects ?? 'projects');
	// Fallback per "Indietro" quando si atterra diretto sul dettaglio: la listing.
	let projectsUrl = $derived(`${base}/${currentLang}/${projectsRoute}`);
	// Coppie {raw, label}: link sul tag grezzo (il filtro confronta i raw), testo tradotto.
	let tagLinks = $derived(
		(currentTranslation?.tags ?? []).map((raw) => ({
			raw,
			label: translateTags(global, [raw])[0] ?? raw
		}))
	);
</script>

<div use:reveal class="reveal">
	<div class="flex pb-10 text-2xl 2xl:pb-14">
		<BackLink href={projectsUrl} label={backText} />
	</div>

	{#if content && currentTranslation}
		<article class="flex flex-col gap-y-8">
			<header class="flex flex-col gap-y-6">
				{#if content.meta.status}
					<StatusBadge status={content.meta.status} {global} class="self-start" />
				{/if}

				<h2 class="text-5xl font-normal sm:text-6xl 2xl:text-7xl">
					{currentTranslation.title}
				</h2>

				{#if currentTranslation.excerpt}
					<div class="text-2xl italic">
						<p>{currentTranslation.excerpt}</p>
					</div>
				{/if}

				{#if content.meta.link}
					<a
						href={content.meta.link}
						class="flex w-min items-center gap-x-2 text-2xl underline"
						target="_blank"
						rel="noopener noreferrer"
						data-sveltekit-reload
					>
						<ExternalLink class="h-6 w-6" />
						{content.meta.link}
					</a>
				{/if}

				{#if tagLinks.length > 0}
					<div class="flex flex-wrap gap-1.5 font-mono text-xs text-gray-400">
						{#each tagLinks as tag (tag.raw)}
							<a
								href={`${base}/${currentLang}/${projectsRoute}?tags=${encodeURIComponent(tag.raw)}`}
								class="border border-white/10 px-2 py-1 transition-colors hover:border-accent/50 hover:text-accent"
							>
								{tag.label}
							</a>
						{/each}
					</div>
				{/if}
			</header>

			{#if content.meta.featured_image || content.meta.featuredImagePlaceholder}
				<div class="w-full">
					<OptimizedImage
						src={content.meta.featured_image}
						alt={currentTranslation.title}
						className="aspect-video rounded-xl"
						showPlaceholder={Boolean(content.meta.featuredImagePlaceholder)}
						sizes="100vw"
					/>
				</div>
			{/if}

			{#if currentTranslation.content}
				<ContentRenderer content={currentTranslation.content} className="flex flex-col gap-y-4" />
			{/if}
		</article>
	{/if}
</div>
