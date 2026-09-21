<script lang="ts">
	import { base } from '$app/paths';
	import type { ArticleCardProps } from '$lib/types';
	import OptimizedImage from './OptimizedImage.svelte';

	let {
		title,
		excerpt,
		featuredImage,
		featuredImagePlaceholder,
		link,
		publishedDate,
		tags,
		selectedLanguage
	}: ArticleCardProps & { selectedLanguage?: string } = $props();

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		const locale = selectedLanguage === 'it' ? 'it-IT' : 'en-US';
		return date.toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric' });
	};
</script>

<a href={`${base}${link}`} class="archive-card group flex h-full flex-col">
	<div class="px-5 pt-5">
		<OptimizedImage
			src={featuredImage}
			alt={title}
			className="archive-card__media aspect-video rounded-md"
			showPlaceholder={Boolean(featuredImagePlaceholder)}
			sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
		/>
	</div>

	<div class="flex flex-1 flex-col p-5">
		<div class="mb-3 font-mono text-xs tracking-wider text-gray-500 uppercase">
			{formatDate(publishedDate)}
		</div>

		<h5 class="mb-2 text-xl font-medium text-gray-100">{title}</h5>
		<p class="mb-4 text-sm text-gray-400">{excerpt}</p>

		{#if tags && tags.length > 0}
			<div class="mt-auto flex flex-wrap gap-1.5 font-mono text-[0.7rem] text-gray-400">
				{#each tags.slice(0, 4) as tag (tag)}
					<span class="border border-white/10 px-2 py-0.5">{tag}</span>
				{/each}
				{#if tags.length > 4}
					<span class="px-1 py-0.5 text-gray-500">+{tags.length - 4}</span>
				{/if}
			</div>
		{/if}
	</div>
</a>
