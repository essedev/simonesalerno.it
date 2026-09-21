import { ContentLoader } from '$lib/utils/content';
import { ACCENT_COOKIE, resolveAccentId } from '$lib/themes';
import type { LayoutServerLoad } from './$types';
import type { LayoutData, WelcomeContent, AboutContent, ContactContent } from '$lib/types';

export const load: LayoutServerLoad = async ({ url, cookies }): Promise<LayoutData> => {
	const loader = new ContentLoader();
	const pathParts = url.pathname.split('/');
	const lang = pathParts[1] || 'en';

	// Tema accento salvato (cookie): passato all'AccentPicker perché parta già
	// con la selezione corretta in SSR (niente scatto dell'indicatore al load).
	const accent = resolveAccentId(cookies.get(ACCENT_COOKIE));

	// Verifica che la lingua sia valida (necessaria prima di caricare il resto)
	const languages = await loader.loadConfig('languages');
	const validLang = languages.find((l) => l.code === lang)?.code || 'en';

	// Il resto dei caricamenti è indipendente: eseguili in parallelo.
	const [
		navigation,
		global,
		welcome,
		about,
		contact,
		projectsPage,
		blogPage,
		projects,
		articles,
		slugMap
	] = await Promise.all([
		loader.loadConfig('navigation'),
		loader.loadGlobal(validLang),
		loader.loadPage('welcome', validLang) as Promise<WelcomeContent>,
		loader.loadPage('about', validLang) as Promise<AboutContent>,
		loader.loadPage('contact', validLang) as Promise<ContactContent>,
		loader.loadPage('projects', validLang),
		loader.loadPage('blog', validLang),
		loader.loadProjects(validLang),
		loader.loadArticles(validLang),
		loader.loadSlugMap()
	]);

	return {
		selectedLanguage: validLang,
		languages,
		navigation,
		global,
		welcome,
		about,
		contact,
		projectsPage,
		blogPage,
		projects,
		articles,
		slugMap,
		accent
	};
};
