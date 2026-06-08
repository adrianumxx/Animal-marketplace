# SPEC.md — ANIMA DEL PROGETTO
# Compila questo file con Opus UNA volta sola all'inizio.
# Dopo, ogni sessione parte da qui. Zero rispiegazioni.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## IDENTITÀ

Nome:        [Nome Progetto]
Tipo:        [ ] Marketplace  [ ] SaaS  [ ] Landing  [ ] App  [ ] Dashboard
Tagline:     [Una frase. Quella che va sul hero.]
Status:      [ ] Da zero  [ ] In corso  [ ] Rilancio

In una frase per mia nonna:
> [Spiega cosa fa il prodotto in modo che lo capisca chiunque]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## PROBLEMA + SOLUZIONE

Il problema reale che risolvo:
[Descrivi il dolore dell'utente PRIMA di trovare questo prodotto]

Come lo risolvo:
[La soluzione — senza tecnicismi]

Perché nessun altro lo fa così:
[1 frase — il tuo vantaggio reale]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## UTENTE TARGET

Chi è:          [età, professione, contesto di vita]
Cosa vuole:     [obiettivo principale — 1 cosa sola]
Cosa teme:      [la sua paura più grande]
Come decide:    [su cosa basa la fiducia — prezzo? recensioni? brand?]
Dove si trova:  [paese, città, online, lingua]

### Cosa deve SENTIRE aprendo il sito (scegli 1-2)
[ ] "Questo è serio, mi posso fidare"
[ ] "Finalmente qualcuno che capisce il mio problema"
[ ] "Questo è il migliore sul mercato"
[ ] "È facile, trovo subito quello che cerco"
[ ] "Voglio comprarlo adesso"
[ ] [altro: _______________]

### Cosa NON deve MAI sentire
[ ] Confusione
[ ] Sfiducia
[ ] "Sembra una truffa"
[ ] Lentezza
[ ] [altro: _______________]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## COMPETITOR

| Nome | Punto di forza | Punto debole | Come li battiamo |
|------|---------------|--------------|-----------------|
| [1]  | [forza]       | [debolezza]  | [come]          |
| [2]  | [forza]       | [debolezza]  | [come]          |
| [3]  | [forza]       | [debolezza]  | [come]          |

Sito che voglio eguagliare per qualità design: [nome]
Sito che voglio battere per UX: [nome]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## DESIGN LANGUAGE

Feeling visivo (scegli 1):
[ ] Caldo e umano      [ ] Freddo e tech      [ ] Lusso e premium
[ ] Minimal e pulito   [ ] Bold e d'impatto   [ ] Playful e giovane
[ ] Editoriale         [ ] Brutalist          [ ] Futuristico

Colori:
--bg-primary:    [hex]    light  |  [hex]    dark
--bg-secondary:  [hex]    light  |  [hex]    dark
--text-primary:  [hex]    light  |  [hex]    dark
--accent:        [hex]    (uguale in entrambi i temi)

Font display (titoli):   [nome o "scegli tu per massima scena"]
Font body (testo):       [nome o "scegli tu"]

Effetto 3D/motion principale:
[ ] Tilt 3D card al hover        [ ] Drone view dall'alto
[ ] Parallax scroll              [ ] Particelle Three.js
[ ] Spline model embeddato       [ ] Split text animation
[ ] Tutto il massimo possibile

Le immagini devono comunicare: [emozione/stile]
Le foto sono: [ ] reali  [ ] illustrazioni  [ ] 3D render  [ ] mix

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## MVP — PAGINE E SEZIONI

Lista solo quello che serve per lanciare e vendere oggi.
Non aggiungere "sarebbe bello avere". Solo il necessario.

### Pagine
```
/ → [descrizione in 5 parole]
/[route] → [descrizione]
/[route] → [descrizione]
```

### Sezioni della homepage in ordine
```
1. Hero          → [titolo principale + CTA primario]
2. [sezione]     → [scopo]
3. [sezione]     → [scopo]
4. [sezione]     → [scopo]
5. CTA finale    → [azione che vuoi dall'utente]
```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## API E INTEGRAZIONI
# Queste si integrano SOLO dopo che il design è approvato visivamente.

| API / Servizio | Scopo | Priorità | Status |
|----------------|-------|----------|--------|
| [nome]         | [cosa fa] | alta/media | da fare |
| [nome]         | [cosa fa] | alta/media | da fare |

Auth provider:    [ ] NextAuth  [ ] Clerk  [ ] Supabase  [ ] Custom
Database:         [ ] Supabase  [ ] PlanetScale  [ ] MongoDB  [ ] Custom
Payment:          [ ] Stripe  [ ] Mollie  [ ] PayPal  [ ] nessuno
Email:            [ ] Resend  [ ] SendGrid  [ ] nessuno
Storage:          [ ] Cloudinary  [ ] S3  [ ] Supabase Storage  [ ] nessuno

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## COMPONENTI LOCKED
# Aggiorna questa lista man mano che approvi i componenti

| Componente | Path | Approvato il |
|------------|------|-------------|
| Navbar | src/components/layout/Navbar.tsx | [data] |
| Footer | src/components/layout/Footer.tsx | [data] |
| SearchBar | src/components/ui/SearchBar.tsx | [data] |
| ThemeToggle | src/components/ui/ThemeToggle.tsx | [data] |

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## METRICHE DI SUCCESSO

Il prodotto ha funzionato se:
- [ ] L'utente trova quello che cerca in < 30 secondi
- [ ] Il primo investitore/cliente dice "lo voglio" nei primi 10 secondi
- [ ] Il sito è indistinguibile dai leader del settore
- [ ] Funziona perfettamente su mobile e desktop
- [ ] Dark e light mode senza eccezioni

Il codice ha funzionato se:
- [ ] Zero colori hardcodati nel codebase
- [ ] Zero errori TypeScript in strict mode
- [ ] Build passa senza warning critici
- [ ] Lighthouse score > 90 su tutto

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Questo file si scrive una volta.
Si legge all'inizio di ogni sessione.
Non si cambia senza una decisione consapevole.
