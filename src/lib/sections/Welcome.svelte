<script lang="ts">
	import type { WelcomeSectionProps } from '$lib/types';
	import { inview, type Options } from 'svelte-inview';
	import ContentRenderer from '$lib/components/ui/ContentRenderer.svelte';

	// Receive welcome data as props
	let { welcome }: WelcomeSectionProps = $props();

	let isInView = $state(false);
	const options: Options = {
		rootMargin: '-50px',
		unobserveOnEnter: true
	};
</script>

<div
	use:inview={options}
	oninview_change={(event) => {
		const { inView } = event.detail;
		isInView = inView;
	}}
	class="relative flex flex-col items-start text-left {isInView
		? 'inview-reveal animate'
		: 'inview-reveal opacity-0'}"
>
	<div class="mb-12 overflow-hidden">
		<h1
			class="font-mono -mt-2 text-left text-[3rem] leading-[1.15] font-medium sm:text-[5rem] lg:-mt-3 xl:-mt-4 xl:text-[6rem] 2xl:-mt-6 2xl:text-[7.5rem]"
		>
			{welcome.title}
		</h1>
	</div>

	<ContentRenderer
		content={welcome.description}
		className="flex max-w-xl flex-col gap-y-4 text-left"
		blockClasses={{
			paragraph: 'text-base text-gray-300 sm:text-lg lg:text-xl'
		}}
	/>

	<p class="font-mono mt-10 text-sm text-gray-500">
		{welcome.eyebrow} <span class="text-accent">· AI Engineer</span>
	</p>
</div>
