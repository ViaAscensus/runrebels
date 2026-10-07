# Architektur & Produktentscheidungen — RunRebels / Laufrausch

Dieses Dokument fasst die Produkt- und Architekturentscheidungen für den
ersten Piloten zusammen. Es ist das Ergebnis eines ausführlichen
Abstimmungsprozesses mit dem Projektinhaber, nicht eine einseitige
technische Annahme.

## 1. Rahmen

- **Plattform:** RunRebels — gedacht als Dach für mehrere Challenges über
  die Zeit, nicht nur für die erste.
- **Erste Challenge:** Laufrausch — die Neujahrschallenge.
- **Rechtlich:** Anbieter/Impressum/Haftung = ASCENSUS (Patrick Spengler,
  Einzelunternehmen). Zahlung läuft über das bestehende ASCENSUS-
  Stripe-Konto. Die Marke nach außen ist bewusst eigenständig von
  ascensus.fit, rechtlich aber nicht getrennt — eine bewusst akzeptierte
  Vereinfachung, um keine neue Rechtsform/Gewerbeanmeldung zu brauchen.
- **Mandantenmodell:** Single-Tenant für den Piloten (nur ein Veranstalter:
  Patrick). Datenmodell trägt von Anfang an ein `organizer`-Feld, damit
  eine spätere Multi-Tenant-/White-Label-Erweiterung eine Erweiterung
  bleibt, kein Rewrite. Aktuell keine anderen Veranstalter in Aussicht.
- **Zielgröße:** ~200 Teilnehmer erwartet für den Piloten. Architektur
  (Datenbank, Hosting) für 10x ausgelegt — der eigentliche Flaschenhals
  bei einem unerwarteten Ansturm liegt nicht in der Technik, sondern in
  drei operativen Stellen: der manuellen Foto-Prüfung durch eine Person,
  dem Medaillen-Bestand/Fulfillment, und dem Zahlungsvolumen auf einem
  Stripe-Konto, das ursprünglich für ein Einzelcoaching-Geschäft angelegt
  wurde.

## 2. Zeitfenster

- Jede RunRebels-Challenge läuft standardmäßig einen **vollen
  Kalendermonat**. Für Laufrausch: 1.–31. Januar.
- **+3 Tage Kulanzfrist** für Nachsynchronisation (späte Strava-Syncs,
  Datei-Uploads, Fotos), finale Wertung am 3. Februar.

## 3. Vier Teilnahme-Kategorien

1. **Freie Distanz / Kumulativ-Ziel** — Summe aller Kilometer im
   Challenge-Zeitraum, unabhängig von Tempo oder Einzeldistanz. Wer ein
   definiertes Kilometer-Ziel erreicht, bekommt die **Teilnahme-Medaille**.
   Das ist die Hauptkategorie für die große Mehrheit (Neujahrsvorsatz-
   Zielgruppe).

2. **Bestzeit-Wertung (10 km)** — feste Referenzdistanz, beliebig oft im
   Zeitraum laufbar, nur die schnellste Zeit zählt. Getrennte Männer- und
   Frauen-Podien (Top 3 je Kategorie, Sondermedaille). Begründung für
   10 km statt 5 km: lang genug, um für die ambitionierten Vereinsläufer
   als echter Wettkampf zu zählen, kurz genug, um zugänglich zu bleiben.
   - **Divers:** Zeit wird immer erfasst und zählt normal in die
     Kumulativ- und Gesamtwertung. Standardmäßig ohne eigene öffentliche
     Platzierung (freie Wahl, in der Männer- oder Frauen-Podium-Wertung
     zu laufen) — Grund ist Datenschutz, nicht Ablehnung: bei vermutlich
     0–2 Personen in dieser Kategorie wäre ein öffentliches Podium
     faktisch eine Veröffentlichung, wer diese Person ist. Explizites,
     jederzeit widerrufbares **Opt-in** für eine eigene, öffentlich
     sichtbare Divers-Ehrenkategorie (Rechtsgrundlage: Art. 6 Abs. 1 lit.
     a DSGVO, ausdrückliche Einwilligung).

3. **Januar-Gesamtwertung** — kombinierte Rangliste über beide Metriken:
   **1 Punkt pro gelaufenem Kilometer** + **Platzierungspunkte aus der
   Bestzeit-Wertung** (Platz 1 = 50 Punkte, linear abnehmend). Kilometer
   dominieren bewusst gegenüber der Zeit — die Zielgruppe ist primär die
   Neujahrsvorsatz-Masse, nicht eine zweite Elite-Wertung für die
   ohnehin schon mit der Bestzeit-Medaille ausgezeichneten schnellen
   Läufer.

4. **Kinderdistanz (1 km, bis 12 Jahre)** — **nicht-kompetitiv**, keine
   öffentliche Rangliste mit Namen/Platzierungen von Minderjährigen, nur
   eine Teilnahme-Urkunde. Anmeldung ausschließlich durch ein Elternteil
   (DSGVO Art. 8: unter 16 Jahren keine eigene Einwilligungsfähigkeit für
   Online-Dienste). Einreichung nur per Foto-Upload, kein Strava-Konto
   vorausgesetzt.

## 4. Dateneingabe — drei gleichwertige Wege

Keine eigene Tracking-App (GPS-Live-Tracking wäre für eine Einzelperson
ein mehrmonatiges bis mehrjähriges Projekt für sich allein). Stattdessen:

1. **Strava-OAuth** — Teilnehmer verknüpft sein vorhandenes Strava-Konto,
   Aktivitäten werden per Webhook übernommen. Primärer Weg für alle, die
   Strava schon nutzen (De-facto-Standard unter Läufern).
2. **.FIT-/.GPX-Datei-Upload** — direkter Export aus der Uhr/App, ohne
   Strava-Konto. Enthält die komplette Zeitreihe (Pace-Verlauf,
   Höhenprofil), nicht nur einen Endwert — technisch die zuverlässigste
   der drei Optionen, weil kein OAuth-Partnerschaftsantrag bei
   Garmin/Polar nötig ist (das hätte einen wochenlangen Freigabeprozess
   bedeutet).
   - Geräte-spezifische Hilfeseite nötig: Garmin und Polar exportieren
     nur über das jeweilige **Web-Portal** (connect.garmin.com /
     flow.polar.com), nicht über die mobile App. Suunto und COROS
     exportieren direkt aus der App. Apple Watch hat **keinen** nativen
     Export — Nutzer sehen auf der Hilfeseite sowohl den einfacheren
     Strava-Weg (Apple-Watch-Workouts syncen über die Strava-iPhone-App
     automatisch) als auch den Datei-Export-Weg über eine
     Drittanbieter-App (z. B. HealthFit).
3. **Manueller Foto-Upload** — letzter Fallback für Teilnehmer ganz ohne
   Sportuhr-App, einziger Weg für die Kinderdistanz. Eine KI liest Zeit/
   Distanz aus dem Foto (Uhr-Display) aus und füllt das Formular vor —
   der Teilnehmer muss die ausgelesenen Werte aber aktiv bestätigen oder
   korrigieren, bevor die Einreichung zählt (Selbstbestätigung, keine
   blinde KI-Übernahme).

## 5. Anti-Cheat

Kein selbstgebauter GPS-Jitter-Filter oder KI-Fälschungserkennung — das
wäre für 200 Teilnehmer unverhältnismäßiger Aufwand gegenüber dem
tatsächlichen Risiko. Stattdessen zweistufig:

1. **Automatische Schwellenwerte**, nur relevant für die Bestzeit-
   Top-3-Wertung (dort gibt es einen Sachpreis, also einen echten Anreiz):
   - Pace-Schwellenwert geschlechtsspezifisch: Männer < 30 Minuten/10 km,
     Frauen < 32–33 Minuten/10 km (knapp über echter Welt-/Landesklasse,
     damit keine echte starke Läuferin fälschlich markiert wird).
   - Kilometer-Plausibilität (unrealistische Tagesdistanz).
2. Schlägt ein Schwellenwert an: **KI erstellt eine kurze Einschätzung**
   des konkreten Falls (z. B. Pace im Verhältnis zur Historie des
   Teilnehmers) → Fall landet mit dieser Einschätzung in einer
   Prüf-Warteschlange beim Veranstalter. **Die KI entscheidet nie selbst.**

## 6. Zahlung & Fulfillment

- **Bezahlpflichtig**, Checkout über das bestehende ASCENSUS-Stripe-
  Konto, als **Line-Items** aufgebaut (Startgebühr = Line-Item 1), damit
  ein Merch-Artikel später als Line-Item 2 dazukommt, ohne den
  Checkout-Flow neu zu bauen. Kein Merchandise im Piloten.
- **Medaillen:** mit Puffer bestellen (~220–230 statt exakt 200, wegen
  Nachmeldungen und 2-Wochen-Lieferzeit bei individuellem Design).
- **Fulfillment:** Selbst-Verpackung mit Vereinshelfern bevorzugt (kein
  Dienstleister-Mindestvertrag nötig, bei 200 Sendungen einmalig günstiger
  als jeder Fulfillment-Dienstleister). Falls keine Helfer verfügbar sind:
  deutsche Kleinserien-Anbieter ohne Mindestvertrag (z. B. Beckmann
  Systemlogistik, Klein-Paket Fulfillment) als Rückfalloption, Aufschlag
  ca. €0,90–2,50 Pick&Pack pro Sendung gegenüber Eigenregie.

## 7. Infrastruktur

- Coolify auf demselben Hostinger-VPS (Paris) wie ascensus.fit — aber **eigene**
  PocketBase- und **eigene** n8n-Instanz, nicht die von ASCENSUS
  mitgenutzt. Datentrennung trotz geteiltem Server.
- Repo: `ViaAscensus/runrebels` (dieses Repository).
- PocketBase-Collections-Entwurf: siehe `docs/datenmodell.md`.

## 8. Markenphilosophie & CI

- **Positionierung:** "Rebellisch im Ton, seriös in der Auswertung" — laut,
  frech, hyped nach außen (Sprache, Design), aber darunter ein faires,
  transparentes, technisch vertrauenswürdiges System (Anti-Cheat,
  nachvollziehbare Punkteformel). Weder "Laufen ist bierernst" noch
  "virtuelle Läufe sind unseriöses Spielzeug".
- **Namen:** RunRebels = Plattform (Dach-Marke für künftige Challenges),
  Laufrausch = Name dieser ersten, konkreten Challenge.
- **CI ist noch nicht final entschieden** — sechs durchgesprochene
  Richtungen (warmes Orange/Pop-Energy, Magenta/Tiefpurpur,
  Electric-Lime/Night-Run, Startnummer-Signalgelb, Asphalt & Spraydose,
  digitale GPS-Anzeige) haben noch keinen klaren Treffer ergeben. Bis ein
  Referenzpunkt gefunden ist, läuft der technische Bau mit einem
  **austauschbaren Platzhalter** (Magenta/Tiefpurpur: `#F23E9E` /
  `#2B1240`, Schriften Unbounded + Manrope) als CSS-Variablen — ein
  Wechsel der finalen Marke betrifft dann nur diese Variablen, nicht die
  Architektur.
- Visuelle Stimmung darf sich **innerhalb derselben Palette** nach Bereich
  unterscheiden (Wettkampf-Bereich dunkler/datenlastiger, Familie/
  Kinderdistanz heller/verspielter) — aber nicht als zwei getrennte
  visuelle Systeme, um den Pflegeaufwand für ein von einer Person
  gebautes Projekt nicht zu verdoppeln.

## 9. Noch offen (nicht blockierend für den Bau)

- Genaues Registrierungs-Startdatum
- Höhe der Startgebühr
- Design von Startnummer/Urkunde/Medaille
- Finale CI (siehe Abschnitt 8)
- Höhe des Schweiz-Aufschlags (`events.aufschlag_ch_cent`)
- Strava-API-App und Athleten-Kapazität, Mail-Aliase, SMTP (siehe
  `docs/infrastruktur-setup.md`, Abschnitt 5)

## 10. Entscheidungen aus der Planung (Okt 2026)

**Technik**
- Statisches Frontend aus dem Repo (Coolify Static Site, manueller
  Redeploy), PocketBase-SDK im Browser, n8n für Zahlung/Strava/Auswertung.
- Stripe Checkout (gehostet) mit Line-Items. Teilnehmer + Bestellung werden
  vor der Zahlung als `offen` angelegt, Stripe-Webhook läuft über n8n.
- Strava per Webhook (+ Nachabgleich in der Kulanzfrist), Tokens
  verschlüsselt von n8n gespeichert. FIT/GPX serverseitig in n8n.
- Foto-Auslesung: Gemini API (Google AI Studio, bezahlte Stufe), nur Foto +
  fester Prompt; AVV/EU-Verarbeitung vorher mit dem Datenschutzanwalt
  klären. Teilnehmer bestätigt die Werte aktiv.
- Standings werden bei jeder `ok`-Einreichung neu berechnet, plus
  nächtlicher Abgleich.

**Prüfung**
- Eigene, nicht verlinkte Prüfseite im RunRebels-Design, Login mit dem
  PocketBase-Superuser (später auf eine `pruefer`-Collection erweiterbar).
- Ablehnung nur mit Pflicht-Begründung; Teilnehmer kann neu einreichen,
  max. 3 abgelehnte Einreichungen pro Tag. Manuelle Sperre möglich.
- Kinder reichen nur per Foto/Datei durch die Eltern ein (kein Strava).
- Anzeigename ist frei wählbar (`teilnehmer.anzeigename`).

**Ablauf, Geld, Versand**
- Kulanzfrist 3 Tage nach Challenge-Ende. Urkunde sofort als PDF, Medaille
  gesammelt nach der Kulanzfrist.
- Storno bis `anmeldeschluss`, Erstattung abzüglich Stripe-Gebühr, manuell
  über `storno@runrebels.com`; Status `storniert`. Danach keine Erstattung.
- Keine Mindestteilnehmerzahl; Absage nur bei höherer Gewalt (volle
  Erstattung).
- Versand nach DE/AT/CH, Adresse bei der Anmeldung (in `fulfillment`).
  Schweiz: Aufschlag als eigenes Line-Item.
- Unbezahlte Anmeldungen: zwei Zahlungserinnerungen (24 h nach Anmeldung,
  3 Tage vor `anmeldeschluss`), dann Status `verfallen`, Löschung nach
  30 Tagen.

**E-Mails** (von `runner@runrebels.com`, reine Service-Mails): Anmeldebestätigung,
2 Zahlungserinnerungen, Start-Erinnerung, Einreichung angenommen,
Einreichung abgelehnt, Ergebnis + Urkunde, Medaille versandt.

**Recht:** Eigene Texte für runrebels.com (Impressum, Datenschutz,
Teilnahmebedingungen/Storno), Entwurf durch Claude, Prüfung durch den
Anwalt vor dem Launch.
