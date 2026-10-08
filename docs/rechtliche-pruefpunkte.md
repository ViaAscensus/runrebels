# Rechtliche Prüfpunkte für den Anwalt (Stand Oktober 2026)

Vorbereitung für die anwaltliche Prüfung von `web/impressum.html`,
`web/datenschutz.html` und `web/teilnahmebedingungen.html` vor dem Launch.
Pro Punkt: Was wir recherchiert haben (mit Quelle), was der Entwurf derzeit
sagt, und was geklärt werden muss. Die Recherche ersetzt keine Rechtsberatung.

## 1. Foto-Auslesung mit der Gemini API (zwei Konflikte)

**Entscheidung Projektinhaber (Okt 2026):** Fotos der Kinderdistanz gehen **nicht** an Gemini, sie werden von Hand geprüft. Datenschutzerklärung und Teilnahmebedingungen sagen das bereits.

**Befund** (Gemini API – Zusatzbedingungen, Fassung vom 23.03.2026,
<https://ai.google.dev/gemini-api/terms>):

- In der **kostenpflichtigen** Stufe nutzt Google Prompts und Antworten nicht,
  um eigene Produkte zu verbessern. Die Verarbeitung läuft unter dem
  „Zusatz zur Datenverarbeitung“, in dem Google Auftragsverarbeiter ist. In der
  kostenlosen Stufe dürfen Eingaben dagegen von Prüfern gelesen und zur
  Verbesserung genutzt werden. Für Nutzer im EWR, in der Schweiz und im UK
  dürfen nur kostenpflichtige Dienste angeboten werden. Sobald Cloud Billing
  aktiv ist, gilt jede Nutzung der API als kostenpflichtig.
- Es gibt **keine EU-Datenresidenz-Option**. Daten können vorübergehend „in jedem
  Land“ gespeichert oder gecacht werden, in dem Google Einrichtungen hat. Die
  Dauer der Protokollierung ist nur als „begrenzter Zeitraum“ angegeben.
- **Konflikt 1 – Minderjährige:** Die Dienste setzen Nutzer ab 18 voraus und
  dürfen nicht in Apps oder Websites genutzt werden, die sich an Personen unter
  18 richten oder von ihnen wahrscheinlich genutzt werden. RunRebels hat eine
  Kinderdistanz, bei der Eltern Fotos von Uhren der Kinder hochladen.

**Entwurf sagt:** Nur das Foto und eine feste Anweisung gehen an Gemini, kein
Personenbezug; der Teilnehmer bestätigt die Werte; Google ist
Auftragsverarbeiter und trainiert nicht mit den Daten; Verarbeitung außerhalb
der EU möglich.

**Zu klären:**
1. Ist die Kinderdistanz mit dieser Klausel vereinbar? Hochladen tut ein
   Elternteil (Erwachsener), das Foto zeigt aber die Laufdaten eines Kindes.
   **Gewählter Ausweg:** Fotos der Kinderdistanz **nicht** an Gemini senden,
   sondern von Hand prüfen. Anwalt bitte bestätigen, dass das genügt.
2. Reicht der Google-Auftragsverarbeitungszusatz plus Standardvertragsklauseln
   oder Data Privacy Framework für die Übermittlung in Drittländer?
3. Können Metadaten im Foto (EXIF, Ort, Gerät) vor der Übergabe entfernt werden?
   Technisch ja, das bauen wir ein.
4. Muss die Foto-Auslesung per KI in der Anmeldung ausdrücklicher genannt werden?

## 2. Strava-Anbindung (Konflikt 2)

**Entscheidung Projektinhaber (Okt 2026):** Ausdrückliche, nicht vorangekreuzte Einwilligung beim Verknüpfen für die Anzeige in der Rangliste. Der Anwalt bestätigt nur noch, ob sie reicht.

**Befund** (Strava API Agreement, <https://www.strava.com/legal/api>; Bericht zu
den Änderungen vom November 2024,
<https://cyberinsider.com/strava-tightens-api-policies-to-bolster-user-privacy-and-security/>):

- Apps dürfen Strava-Daten **nur dem jeweiligen Nutzer selbst** anzeigen. Daten
  eines Nutzers dürfen nicht ohne dessen **ausdrückliche Einwilligung** an
  andere Nutzer oder Dritte weitergegeben werden (Abschnitt 11.1). Segment- und
  Leaderboard-Daten von Strava sind ausgenommen.
- Bei Beendigung der Vereinbarung müssen alle Strava-Daten gelöscht und das
  schriftlich bestätigt werden (Abschnitt 4.4). Es gelten Mengenlimits; eine
  konkrete Athletenzahl nennt der Text nicht.
- Entwickler müssen mindestens 18 sein; Alterregeln für Endnutzer nennt der Text
  nicht.

**Folge für RunRebels:** Die öffentliche Rangliste zeigt Kilometer und Zeiten
anderer Teilnehmer. Das ist nur mit ausdrücklicher Einwilligung vertretbar.

**Entwurf sagt:** Beim Verknüpfen holen wir ausdrücklich die Einwilligung ein,
dass Ergebnisse unter dem Anzeigenamen in der Rangliste erscheinen.

**Zu klären:**
1. Genügt diese Einwilligung beim Verknüpfen für die Strava-Bedingungen und die
   DSGVO? Wir bauen sie als eigene, nicht vorangekreuzte Checkbox im
   Verknüpfungsschritt.
2. Alternative Gestaltung: Nur summierte Werte (Kilometer-Summe, Bestzeit) in
   der Rangliste, keine einzelnen Aktivitäten.
3. Datenübermittlung an Strava Inc. (USA): Rechtsgrundlage und Garantien.
4. Strava-App-Antrag: Wir brauchen die Freigabe für ausreichend viele Athleten
   (offen, siehe `docs/infrastruktur-setup.md`).

## 3. Kein Widerrufsrecht bei der Anmeldung

**Befund:** § 312g Abs. 2 Nr. 9 BGB schließt das Widerrufsrecht bei
Fernabsatzverträgen über Freizeitbetätigungen aus, wenn der Vertrag für einen
spezifischen Termin oder Zeitraum geschlossen wird
(<https://lexetius.com/BGB/312g,2>). Der BGH hat das für Online-Tickets zu
zeitgebundenen Freizeitveranstaltungen bestätigt, Az. VIII ZR 317/21, Urteil vom
13.07.2022 (Zusammenfassung:
<https://www.it-recht-kanzlei.de/bgh-widerrufsausschluss-veranstaltungstickets.html>).
Ein fehlender Hinweis auf den Ausschluss in der Belehrung begründet dort kein
Widerrufsrecht.

**Entwurf sagt:** Kein Widerrufsrecht nach § 312g Abs. 2 Nr. 9 BGB; die
Stornierung bis zum Anmeldeschluss ist freiwillig.

**Zu klären:**
1. Passt der Ausschluss auf eine **virtuelle** Challenge, bei der der Teilnehmer
   Zeit und Ort der Läufe selbst wählt? Das Datum steht fest (1.–31. Januar), die
   Dienstleistung ist aber nicht an einen Veranstaltungsort gebunden. Dazu
   brauchen wir eine anwaltliche Einschätzung.
2. Falls nein: Welche Widerrufsbelehrung und welches Muster-Formular brauchen wir,
   und wie ist der Beginn der Leistung vor Ablauf der Frist zu regeln?
3. Pflichtangaben nach Art. 246a EGBGB und Button-Beschriftung („zahlungspflichtig
   bestellen“) im Anmeldeformular prüfen.

## 4. Storno mit Abzug der Stripe-Gebühr

**Entwurf sagt:** Storno bis zum Anmeldeschluss, Erstattung abzüglich der
Stripe-Zahlungsgebühr, danach keine Erstattung; Absage nur bei höherer Gewalt mit
voller Erstattung.

**Zu klären:**
1. Ist der Abzug der tatsächlichen Stripe-Gebühr als Bearbeitungsgebühr zulässig,
   oder muss eine Pauschale mit Nachweismöglichkeit formuliert werden
   (AGB-Kontrolle, §§ 307 ff. BGB)?
2. Wie hoch ist die Gebühr bei der Startgebühr und der Schweiz-Aufschlag-Position,
   und soll sie im Text beziffert werden?
3. Was gilt bei Absage durch Krankheit des Teilnehmers (bisher: nichts)?

## 5. Haftung und Ausschluss

**Zu klären:**
1. Haftungsklausel in Abschnitt 9 der Teilnahmebedingungen (Vorsatz, grobe
   Fahrlässigkeit, Leben/Körper/Gesundheit, Kardinalpflichten).
2. Ausschluss bei Manipulation und Sperre: Ist die Regelung (Streichen von
   Einreichungen, Ausschluss ohne Erstattung) wirksam und verhältnismäßig?
3. Gesundheitshinweis: genügt der Text, oder soll ein ausdrückliches
   Bestätigungs-Häkchen („ich bin gesund genug“) ins Formular?

## 6. Datenschutz allgemein

**Zu klären:**
1. **Hostinger:** Vertragspartner der Auftragsverarbeitung ist laut DPA
   Hostinger International Ltd. (Zypern), aufsichtsbehördlich zuständig ist die
   zyprische Behörde. Das DPA nennt keinen Serverstandort; „Paris“ stammt aus der
   Bestellung des Servers (<https://hostinger.com/de/legal/dpa>). Außerdem listet
   das DPA Unterauftragsverarbeiter wie AWS, Google Cloud, Cloudflare und
   Anthropic Ireland. Bitte prüfen, ob das für die Datenschutzerklärung reicht.
2. **Speicherdauer der Ergebnisse:** Wir haben noch keine feste Frist. Vorschlag
   zur Entscheidung: nach Abschluss der Challenge öffentlich sichtbare
   Ergebnisse nach z. B. 12 Monaten löschen oder anonymisieren. Der Anwalt soll
   eine angemessene Frist bestätigen.
3. **Sportdaten als Gesundheitsdaten:** Sind Laufdaten (Distanz, Zeit, Pace,
   Streckenverlauf, bei Dateien eventuell Herzfrequenz) Gesundheitsdaten nach
   Art. 9 DSGVO und brauchen eine ausdrückliche Einwilligung? Wir lesen
   Herzfrequenz nicht aus, speichern aber die hochgeladene Datei.
4. **Kinder:** Ist die Anmeldung durch ein Elternteil mit den Angaben zum Kind
   (Name, Geburtsjahr, Foto der Uhr) sauber gelöst, und wie lange dürfen wir
   diese Daten aufbewahren?
5. **Cookies und Analytics:** Die Erklärung beschreibt Klaro-ähnliche
   Einwilligungsverwaltung, Google Analytics 4, Microsoft Clarity und Google Ads
   analog zur Datenschutzerklärung von ascensus.fit. Das Banner und die
   Tracking-Einbindung für runrebels.com sind noch **nicht umgesetzt**; die
   Seite darf erst live gehen, wenn Text und Technik übereinstimmen.
6. **Verzeichnis der Verarbeitungstätigkeiten** und Prüfung, ob eine
   Datenschutz-Folgenabschätzung nötig ist (Kinderdaten, KI-Auslesung).

## 7. Impressum

**Zu klären:**
1. Genügen E-Mail und Telefon als Kontaktangaben (§ 5 DDG)?
2. Steuernummer: Wir haben sie weggelassen, weil das Impressum sie nicht
   verlangt. Der Kleinunternehmer-Hinweis nach § 19 UStG steht drin.
3. Wird die Marke RunRebels unter dem Dach von ASCENSUS ausreichend klar
   benannt („ein Angebot von ASCENSUS“ in der Fußzeile), obwohl sie nach außen
   getrennt auftritt?

## Fehlende Verträge und Unterlagen

- Auftragsverarbeitungsvertrag mit Stripe, Hostinger und Google (bei Google
  über Workspace und die Gemini-Bedingungen).
- Strava-App-Registrierung und akzeptierte API-Bedingungen.
- Postfächer `patrick@runrebels.com`, `runner@runrebels.com` und
  `storno@runrebels.com`, die alle erreichbar sein müssen.

## Zahlungserinnerungen und Löschfrist (zur Anwaltsprüfung)

- Unbezahlte Anmeldungen werden am Ende des Anmeldeschluss-Tages `verfallen`; Teilnehmer-, Adress- und Bestelldaten werden 30 Tage später gelöscht (Datenschutzerklärung muss das nennen).
- Bis zu zwei Erinnerungsmails plus eine Verfall-Mail pro offener Anmeldung; Rechtsgrundlage Vertragsanbahnung, Mails ohne Werbeinhalt. Prüfen lassen.
- Zahlungslink enthält ein zufälliges Token (Bearer-Link); jeder mit der Mail kann zahlen, nicht mehr.
- Alle Mails von runner@runrebels.com tragen die Google-Workspace-Fußzeile mit dem ASCENSUS-Rechtshinweis.
