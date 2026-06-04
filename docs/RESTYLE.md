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

## Vision finale (fase futura): pixel art autoprodotta

La firma visiva del sito sarà pixel art prodotta con uno strumento proprio,
`idkcraft-studio`: l'AI genera una base ad alta risoluzione, una pipeline
deterministica (downscale + quantizzazione CIELAB su palette) la rende pixel art
pulita.

- **Robottino AI pixelato** come compagno del laboratorio: incarna il rapporto
  human+AI in modo immediato.
- **Scene animate** del lab (loop semplici: io che lavoro, il robottino che
  galleggia / emette una lucina, vapore, scintille).
- **Perché è forte:** la firma visiva *dimostra* la tesi del welcome (l'umano
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
  arancione deep. Via il gradient blu e il noise generico. L'arancione (caldo, da
  banco di lavoro/CRT) stacca dal blu che usano tutti.
- **Tipografia:** Geist per il body, **Space Mono** come firma (titoli, etichette di
  stato, metadati, numeri). Il mono è la voce del codice/laboratorio: tecnico, non
  fantasy.
- **Card:** squadrate, bordo 1px, intestazione in mono coi metadati (stato/anno).
  Hover: il bordo prende l'arancione + micro-lift verticale. Niente rotazione.
- **Filtri:** logica invariata (è testata), restyle a "toolbar di strumenti":
  label in mono, attivi in arancione.
- **Motion:** secco e veloce (durate corte, easing lineare, niente rotazioni); idea
  guida: i contenuti che si "caricano" in sequenza come in un terminale.
  `prefers-reduced-motion` resta gestito.
- **Status bar:** una sottile barra di stato in basso, stile barra di un IDE
  (build, lingua, ultimo aggiornamento) come tocco-firma.
- **Navbar:** minimale, in alto.
- **Footer:** pannello tecnico (link, last-updated derivato dal git, motion toggle),
  in mono sobrio.

## Cosa rimandiamo

- **Pixel art e animazioni:** fase successiva, dopo che l'estetica di base regge.
- **Contenuti dei progetti:** riscrittura delle schede nella nuova voce e
  ricurazione della lista (decidere quali e quanti progetti tenere, usare davvero lo
  status "Esplorazione" per gli spike). È un lavoro di contenuto separato, a monte
  della scrittura, e richiede una selezione che spetta a Simone.

## Stato

- Voce + label "Esplorazione" già su `main` (deployate).
- Branch `restyle/laboratory`: design system di base in corso.
