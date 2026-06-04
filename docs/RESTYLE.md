# Restyle "Laboratorio"

Documento di direzione per il rebrand visivo del portfolio. Traccia cosa stiamo
facendo, le idee considerate (anche quelle scartate, col perché), la vision finale
e cosa realizziamo in questa prima fase. Vive sul branch `restyle/laboratory`.

## Perché

Il sito è tecnicamente solido (SvelteKit, i18n, OG build-time, test, performance)
ma visivamente generico: dark gradient blu-nero + noise + Geist sono il preset del
"dev portfolio 2025". Manca un'identità forte e definita. Questo lavoro non tocca
l'ingegneria, ridefinisce l'identità.

## La voce (già su main)

Prima del look abbiamo sistemato il messaggio. Voce: pulita ma giovane, prima
persona, frasi corte, termini tecnici dove servono. Niente massime da artigiano,
niente buzzword da LLM, niente metriche-feticcio.

Posizionamento AI ribilanciato: AI-first ed entusiasta. L'umano non è il freno che
"valida l'AI", progetta il sistema (architettura, contesto, controlli) e per questo
va veloce. La solidità da ingegnere abilita la delega, non la limita. Edge:
ingegnere solido CHE spinge l'AI più di altri, con output production-ready, non demo.

Il vecchio welcome difensivo ("l'architettura la decide l'umano, l'AI velocizza,
l'umano valida") è stato sostituito. Anche la label dello status `idea` è diventata
"Esplorazione" / "Exploration".

## Idea madre: Il Laboratorio

Il sito è il banco di lavoro di un AI engineer inventore: esperimenti in corso,
esplorazioni e cose finite. La narrazione esiste già nell'articolo
`il-mio-nuovo-laboratorio` (lo scienziato pazzo, il raccoglitore di progetti).

- **Luogo:** il laboratorio.
- **Spirito:** mago / inventore (il codice come magia), nel tono e nei dettagli,
  non come costume.
- **Esecuzione:** linguaggio visivo tecnico, da officina / sistema operativo.

## Idee considerate e scartate

- **Motif grafico "doppia S":** scartato. Le SS richiamano altro; l'handle è
  "essedev". La firma identitaria è concettuale (un'idea), non un glifo.
- **Font Jacquard 12/24 (pixel-medievale):** provato sul welcome, scartato. Bello
  ma fantasy, non fitta col posizionamento serio, e soprattutto mancava un sistema
  in cui calarlo. La firma tipografica sarà un monospace (registro tecnico), non un
  blackletter.
- **Tre direzioni di identità valutate:** Laboratorio, Sistema (terminale/macchina),
  Manifesto (editoriale type-driven). Scelta: Laboratorio come idea madre, con il
  linguaggio del Sistema nell'esecuzione. Il Manifesto è stato scartato perché
  dipende da contenuti forti ancora da scrivere.
- **Font, due round di confronto sul nome:** (1) mono - Space Mono (il bold
  schiacciava, il regular era smunto, niente pesi intermedi), JetBrains Mono, IBM
  Plex Mono, VT323, Pixelify Sans: scelto **Martian Mono** per le etichette. (2)
  serif per il titolo - Instrument Serif, Fraunces, Playfair, Spectral. Fraunces
  italic montato sull'hero e poi **scartato in contesto**: il serif italic grande
  su dark e' l'estetica dei template generati da AI (v0/artifacts), troppo
  riconoscibile. Tornati a **Martian Mono** per titolo ed etichette.
- **Headline dell'hero considerate:** "Ciao, sono Simone." (scartata: spreca il
  punto di massima attenzione, il nome è già nel logo), "L'AI scrive. Io decido.",
  "Architettura mia, codice suo.", "Half engineer, half wizard.", più "Welcome to
  my lab" e "where code feels like magic" (scartate: cliché tech triti). Scelta:
  **"I cast code."**
- **Accento colore:** arancione deep (scartato: complementare al logo blu, ci
  litigava), viola (scartato: armonizza col logo ma è il cliché-AI / purple
  gradient), **ciano `#22d3ee`** (scelto: stessa famiglia fredda del logo,
  retro-CRT, distintivo senza omologarsi all'estetica AI).

## Vision finale (fase futura): pixel art autoprodotta

La firma visiva del sito sarà pixel art prodotta con uno strumento proprio,
`idkcraft-studio`: l'AI genera una base ad alta risoluzione, una pipeline
deterministica (downscale + quantizzazione CIELAB su palette) la rende pixel art
pulita.

- **Robottino AI pixelato** come compagno del laboratorio: incarna il rapporto
  human+AI in modo immediato.
- **Scene animate** del lab (loop semplici: io che lavoro, il robottino che
  galleggia / emette una lucina, vapore, scintille).
- **Perché è forte:** la firma visiva _dimostra_ la tesi del welcome (l'umano
  imposta il sistema, l'AI genera, il processo deterministico valida) invece di
  descriverla a parole. Nessun altro portfolio ha questo.

Note di fattibilità (da tenere a mente quando ci arriveremo):

- Lato sito è leggero: spritesheet + CSS `steps()`, pochi KB, `prefers-reduced-motion`
  già gestito.
- Il pezzo difficile è la produzione: l'animazione richiede coerenza frame-to-frame
  (l'AI è debole lì); il tool oggi genera solo texture 16x16 statiche per un voxel
  game e va esteso (dimensioni, palette dedicata, modulo animazione).
- Strategia: partire da UNA scena hero curata, non animare tutto. La prima scena si
  può validare anche semi-manualmente, senza aspettare che il tool sia pronto.
- Bonus: `idkcraft-studio` può diventare esso stesso un progetto del portfolio (il
  sistema che ha disegnato il sito).

## Cosa facciamo ORA (questo branch, senza pixel art)

Design system di base, su cui la pixel art si poserà in seguito. Decisioni prese:

- **Colore:** dark, nero piatto (`#0c0c0c`) + superfici carbone/zinc + accento
  **azzurro elettrico** (`#2cc3f7`). Via il gradient blu di sfondo e il noise
  generico. L'azzurro sta nella famiglia fredda del logo (coeso) ma saturo e
  brillante (CRT/neon), non il blu desaturato generico. Glow azzurro dal basso come
  orizzonte. Iter colore: arancione scartato (complementare al logo, ci litigava),
  viola (cliché-AI), blu-logo (troppo generico/desaturato), azzurro elettrico vince.
- **Tipografia:** **IBM Plex Sans** per il body (toglie il sapore Vercel di Geist),
  **Martian Mono** per titoli ed etichette tech (firma, stato, metadati, numeri).
  Mono geometrico "da officina", peso medium sul titolo. (Fraunces italic provato sul
  titolo e scartato in contesto: il serif-su-dark grande dà l'aria "template generato
  da AI". Il mono è meno elegante ma più specifico e meno omologato.)
- **Headline hero:** titolo **"I cast code."** Doppio senso di `cast`: il type
  casting della programmazione e il lanciare un incantesimo, il tocco magia senza
  cringe. Resta in inglese anche in IT (brand statement intraducibile; il corpo sotto
  è localizzato). Sostituisce "Ciao, sono Simone." (il nome era già nel logo). Layout
  **allineato a sinistra** (editoriale, respiro a destra per la futura scena pixel
  art), non centrato.
- **Nome:** niente eyebrow-kicker sopra il titolo (troppo template e ridondante col
  logo). Il nome è la **firma in calce** all'hero - "Simone Salerno · AI Engineer"
  (mono, ruolo in azzurro): firma il pezzo invece di presentarsi.
- **Sfondo:** nero piatto + griglia tecnica in prospettiva ancorata in basso
  (il pavimento della "stanza") che sfuma salendo. Profondità di spazio senza
  chiudersi a clessidra.
- **Card:** squadrate, bordo 1px, intestazione in mono coi metadati (stato/anno).
  Hover: il bordo prende l'azzurro + micro-lift verticale. Niente rotazione.
- **Filtri:** logica invariata (è testata), restyle a "toolbar di strumenti":
  label in mono, attivi in azzurro.
- **Motion:** da rifare come SISTEMA coerente a fine restyle, non a mano sul singolo
  componente. Tarare l'animazione alla cieca (senza vedere il movimento negli
  screenshot) non converge: per ora hero con fade base sobrio, custom rimandate.
  Registro voluto: fluido ma non lento, easing che decelera (expoOut), non il
  "secco/veloce" che risultava brusco. `prefers-reduced-motion` gestito.
- **Navbar:** logo testuale temporaneo `essedev_` (mono, "dev" azzurro, cursore
  lampeggiante; l'icona pixel Windows-95 stonava per palette e stile, tornerà con la
  pixel art autoprodotta). Voci come indice numerato (`01 progetti`...) coi numeri
  mono azzurri, lingua in mono. Hamburger sotto 1024px.
- **Status bar:** fascia sotto la navbar (al posto del border piatto), stile barra
  di stato IDE: dot azzurro + ruolo a sinistra, location/lingue a destra. La firma
  dell'hero usa "half engineer, half wizard" per non duplicare il ruolo.
- **Footer:** pannello tecnico (link, last-updated derivato dal git, motion toggle),
  in mono sobrio.

## Cosa rimandiamo

- **Pixel art e animazioni:** fase successiva, dopo che l'estetica di base regge.
- **Contenuti dei progetti:** riscrittura delle schede nella nuova voce e
  ricurazione della lista (decidere quali e quanti progetti tenere, usare davvero lo
  status "Esplorazione" per gli spike). È un lavoro di contenuto separato, a monte
  della scrittura, e richiede una selezione che spetta a Simone.

## Stato (2026-06-04)

- Voce + label "Esplorazione" su `main` (deployate).
- Branch `restyle/laboratory` (11 commit, non mergiato). **Fatto:** palette,
  tipografia, hero, navbar (logo testuale + indice numerato + status bar + toggle
  lingua), card progetti/articoli a scheda d'archivio + badge, filtri mono, footer,
  floating squadrata, back-to-top, arrotondamento via token, shortcut tastiera
  (1-4 sezioni, 0/Home top, End fondo), `//` rimosso dal content delle voci.
- **Resta:** pagine dettaglio/about/contatti/paginazione/404; animazioni come
  sistema; pixel art; contenuti progetti. Prima del merge: `build` + `test:ci`
  (con E2E da aggiornare per nav/welcome/badge) + merge su `main`.
- Log dettagliato in `docs/CYCLES.md` (Ciclo 9).
