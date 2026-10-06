# Infrastruktur-Setup — Coolify, PocketBase, n8n

Checkliste zum Ausführen (z. B. durch Claude Cowork mit Zugriff auf das
Coolify-Dashboard und den Server). Jeder Schritt ist einzeln abhakbar.
Reihenfolge ist absichtlich so gewählt, dass jeder Schritt auf dem
vorherigen aufbaut — nicht vorziehen.

Kontext, falls der ausführende Agent das Repo sonst nicht kennt: RunRebels
läuft auf **demselben Hetzner-Server wie ascensus.fit**, aber mit
**eigener** PocketBase- und **eigener** n8n-Instanz — keine der beiden
wird mit ASCENSUS geteilt. Details zu Datenmodell/Architektur stehen in
`docs/architektur.md` und `docs/datenmodell.md`.

## 0. Vorbereitung — Entscheidungen, die VOR dem ersten Klick stehen müssen

- [ ] **Domain festlegen und registrieren.** Noch nicht entschieden. Die
      Marke heißt RunRebels (Plattform), die erste Challenge Laufrausch —
      ein naheliegender Kandidat ist `runrebels.de` oder `runrebels.com`,
      final offen. Ohne registrierte Domain können die folgenden Schritte
      (Subdomains, SSL) nicht abgeschlossen werden. **Blockiert alles
      Weitere in diesem Dokument.**
- [ ] DNS-Zugriff auf diese Domain sicherstellen (A-Record/CNAME auf den
      Hetzner-Server setzen können).
- [ ] Zugriff auf das Coolify-Dashboard des bestehenden Hetzner-Servers
      bestätigen (dasselbe, auf dem ascensus.fit läuft).

Ab hier wird `<domain>` als Platzhalter für die in diesem Schritt
festgelegte Domain verwendet.

## 1. DNS

- [ ] A-Record `<domain>` → Server-IP (dieselbe IP wie ascensus.fit)
- [ ] A-Record `pb.<domain>` → Server-IP (eigene PocketBase-Subdomain,
      analog zu `pb.ascensus.fit`)
- [ ] A-Record `n8n.<domain>` → Server-IP (eigene n8n-Subdomain)
- [ ] Propagation abwarten/prüfen (`dig <domain>` / `dig pb.<domain>`),
      bevor in Coolify ein Domain-Binding versucht wird — sonst schlägt
      die automatische SSL-Zertifikatsausstellung (Let's Encrypt) fehl.

## 2. Coolify — neues Projekt anlegen

- [ ] In Coolify ein **neues Projekt** `RunRebels` anlegen (getrennt vom
      bestehenden ASCENSUS-Projekt, auch wenn beide auf demselben Server
      laufen — das hält Umgebungsvariablen, Logs und Zugriffsrechte
      auseinander).
- [ ] Innerhalb dieses Projekts drei Resources anlegen (die folgenden
      Abschnitte).

## 3. Coolify — PocketBase-Instanz

- [ ] Neue Resource → **Docker Image** (kein "Database"-Preset
      verwenden — PocketBase läuft als eigenständiger Dienst mit
      eingebauter SQLite-Datei, nicht als separate DB-Resource).
- [ ] Image: `ghcr.io/muchobien/pocketbase:latest` (gängiges,
      gepflegtes PocketBase-Docker-Image — alternativ offizielles
      PocketBase-Binary in einem minimalen eigenen Dockerfile, falls eine
      bestimmte PocketBase-Version erzwungen werden soll).
- [ ] **Persistent Volume** einrichten für `/pb_data` — ohne dieses Volume
      sind alle Daten nach einem Redeploy weg. Das ist der Schritt, der am
      leichtesten übersehen wird.
- [ ] Port `8090` exponieren.
- [ ] Domain binden: `pb.<domain>`, SSL/Let's Encrypt automatisch über
      Coolify aktivieren.
- [ ] Container starten, dann unter `https://pb.<domain>/_/` den
      Admin-Account der neuen Instanz anlegen (eigener Account, nicht der
      von pb.ascensus.fit).
- [ ] **Noch nicht** die Collections aus `docs/datenmodell.md` anlegen —
      das ist Abschnitt 6, nachdem die Instanz läuft und erreichbar ist.

## 4. Coolify — n8n-Instanz

- [ ] Neue Resource → in Coolify gibt es meist ein fertiges **n8n-Template**
      (One-Click-Service) — das bevorzugen, statt ein eigenes Docker-Image
      zu konfigurieren, spart Umgebungsvariablen-Fehler.
- [ ] **Persistent Volume** für `/home/node/.n8n` sicherstellen (enthält
      Workflows, Credentials, Datenbank) — gleiches Risiko wie bei
      PocketBase: ohne Volume ist nach einem Redeploy alles weg.
- [ ] Domain binden: `n8n.<domain>`, SSL aktivieren.
- [ ] `N8N_BASIC_AUTH_ACTIVE=true` plus eigenen
      Benutzername/Passwort setzen (Umgebungsvariablen), bevor die
      Instanz öffentlich erreichbar ist — n8n ohne Basic-Auth exponiert
      sonst die Workflow-Oberfläche offen im Netz.
- [ ] `N8N_ENCRYPTION_KEY` setzen (ein zufälliger String) — verschlüsselt
      gespeicherte Credentials innerhalb von n8n. Einmal gesetzt, nie mehr
      ändern (sonst werden bestehende verschlüsselte Credentials
      unlesbar).

## 5. Externe API-Zugänge vorbereiten (unabhängig von Coolify, aber vor Schritt 6 nötig)

- [ ] **Strava-API-Anwendung registrieren** unter
      `https://www.strava.com/settings/api` — liefert `Client ID` und
      `Client Secret` für den OAuth-Flow. Callback-Domain muss dort auf
      `<domain>` gesetzt werden.
- [ ] **Stripe:** keine neue Einrichtung nötig — läuft laut
      `docs/architektur.md` bewusst über das bestehende
      ASCENSUS-Stripe-Konto. Nur sicherstellen, dass die
      API-Keys (Secret Key) dem ausführenden System hier zugänglich
      gemacht werden (als Umgebungsvariable an der Resource, die den
      Checkout later verarbeitet — noch nicht gebaut).
- [ ] **Vision-KI für den Foto-Upload-Pfad:** API-Key für den gewählten
      Anbieter (z. B. Claude-API) bereitstellen, sobald der
      Foto-Auslese-Baustein gebaut wird — noch kein Coolify-Schritt, nur
      als Hinweis, dass der Key an dieser Stelle gebraucht wird.

## 6. PocketBase-Collections anlegen

- [ ] Sobald `pb.<domain>` erreichbar ist: die sieben Collections aus
      `docs/datenmodell.md` anlegen (`events`, `teilnehmer`,
      `bestellungen`, `einreichungen`, `standings`, `fulfillment`, plus
      eine `organizers`-Collection für das `organizer`-Feld).
      Reihenfolge wegen der Relations: `organizers` → `events` →
      `teilnehmer` → `bestellungen`/`einreichungen` → `standings` →
      `fulfillment`.
- [ ] Für den Piloten in `organizers` genau einen Datensatz anlegen
      (Patrick/ASCENSUS), damit `events.organizer` etwas zum Verweisen
      hat.

## 7. Verifikation

- [ ] `curl -I https://pb.<domain>/api/health` → erwartete Antwort `200`.
- [ ] `curl -I https://n8n.<domain>` → n8n-Login-Seite lädt, Basic-Auth
      greift.
- [ ] In PocketBase-Admin prüfen: alle sieben Collections sichtbar, Relations
      korrekt verlinkt (keine „broken relation"-Warnung).
- [ ] Diese Checkliste im Repo abhaken/committen, damit der nächste
      Schritt (Anwendungscode: Registrierung, Strava-OAuth-Handler,
      Checkout) auf einer bestätigt laufenden Infrastruktur aufsetzt statt
      auf einer Annahme.
