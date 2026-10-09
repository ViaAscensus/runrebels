// Konfiguration — keine Geheimnisse hier, die Datei ist öffentlich.
window.RUNREBELS = {
  PB_URL: "https://pb.runrebels.com",
  // n8n-Webhook, der Anmeldung prüft, Datensätze anlegt und die Stripe-Session erzeugt
  N8N_ANMELDUNG_URL: "https://n8n.runrebels.com/webhook/anmeldung",
  EVENT_SLUG: "laufrausch-2027",
  // n8n-Webhook der Crew-Eintragung (Double-Opt-in)
  N8N_CREW_URL: "https://n8n.runrebels.com/webhook/crew",
  // Social-Profile: Adresse eintragen, dann erscheint der Link automatisch. Leer = kein Link.
  SOCIAL: { instagram: "https://www.instagram.com/runrebels.crew/", tiktok: "https://www.tiktok.com/@runrebels.crew", strava: "https://www.strava.com/clubs/RunRebels-Crew", facebook: "https://www.facebook.com/profile.php?id=61595044839568" },
  // Tracking, nur mit Einwilligung (siehe js/consent.js). Leer lassen = Dienst aus.
  GA_ID: "G-20KGF6LVZB",
  CLARITY_ID: "yu5fnsr3n0"
};
