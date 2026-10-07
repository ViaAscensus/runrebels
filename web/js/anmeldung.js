(function () {
  "use strict";
  var cfg = window.RUNREBELS;
  var form = document.getElementById("anmeldung");
  var statusEl = document.getElementById("status");
  var submitBtn = document.getElementById("submit");
  var event = null;

  function $(id) { return document.getElementById(id); }

  function showStatus(text, isError) {
    statusEl.textContent = text;
    statusEl.className = "status" + (isError ? " error" : "");
    statusEl.hidden = false;
  }

  function fmtDate(iso) {
    var d = new Date(iso);
    return isNaN(d) ? "" : d.toLocaleDateString("de-DE", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Berlin" });
  }

  // --- Event laden -----------------------------------------------------
  function loadEvent() {
    var url = cfg.PB_URL + "/api/collections/events/records?perPage=1&filter=" +
      encodeURIComponent("slug='" + cfg.EVENT_SLUG + "'");
    return fetch(url).then(function (r) {
      if (!r.ok) throw new Error("event " + r.status);
      return r.json();
    }).then(function (data) {
      event = data.items && data.items[0];
      if (!event) throw new Error("kein Event");
      applyEvent();
    }).catch(function () {
      lockForm("Die Anmeldung lässt sich gerade nicht laden. Versuch es in ein paar Minuten noch einmal.");
    });
  }

  function applyEvent() {
    var facts = $("facts");
    if (event.start_date && event.end_date) {
      facts.firstElementChild.textContent = "";
      var s = document.createElement("strong");
      s.textContent = fmtDate(event.start_date) + " bis " + fmtDate(event.end_date);
      facts.firstElementChild.appendChild(s);
    }
    if (event.status !== "anmeldung_offen") {
      lockForm(event.status === "entwurf"
        ? "Die Anmeldung ist noch nicht geöffnet. Schau bald wieder vorbei."
        : "Die Anmeldung ist geschlossen.");
      return;
    }
    if (event.anmeldeschluss && new Date(event.anmeldeschluss) < new Date(new Date().toDateString())) {
      lockForm("Der Anmeldeschluss war am " + fmtDate(event.anmeldeschluss) + ".");
      return;
    }
    if (!event.preis_cent) {
      lockForm("Die Anmeldung ist noch nicht geöffnet. Schau bald wieder vorbei.");
      return;
    }
    var eur = (event.preis_cent / 100).toLocaleString("de-DE", { style: "currency", currency: event.waehrung || "EUR" });
    submitBtn.textContent = "Weiter zur Zahlung (" + eur + ")";
  }

  function lockForm(msg) {
    showStatus(msg, false);
    Array.prototype.forEach.call(form.elements, function (el) { el.disabled = true; });
  }

  // --- Kategorie umschalten -------------------------------------------
  function isKind() { return form.elements.kategorie.value === "kind"; }

  function syncKategorie() {
    var kind = isKind();
    $("eltern-field").hidden = !kind;
    $("anzeigename-field").hidden = kind;
    $("geschlecht-field").hidden = kind;
    $("name-label").textContent = kind ? "Vor- und Nachname des Kindes" : "Vor- und Nachname";
    $("email-label").textContent = kind ? "E-Mail eines Elternteils" : "E-Mail";
    syncDivers();
  }

  function syncDivers() {
    $("divers-box").hidden = isKind() || form.elements.geschlecht.value !== "divers";
  }

  function syncLand() { $("ch-hint").hidden = form.elements.land.value !== "CH"; }

  Array.prototype.forEach.call(form.elements.kategorie, function (r) { r.addEventListener("change", syncKategorie); });
  form.elements.geschlecht.addEventListener("change", syncDivers);
  form.elements.land.addEventListener("change", syncLand);

  // --- Validierung -----------------------------------------------------
  function clearErrors() {
    Array.prototype.forEach.call(form.querySelectorAll(".field-error"), function (n) { n.remove(); });
    Array.prototype.forEach.call(form.elements, function (el) { el.removeAttribute("aria-invalid"); });
  }

  function fail(el, msg) {
    el.setAttribute("aria-invalid", "true");
    var p = document.createElement("div");
    p.className = "field-error";
    p.textContent = msg;
    (el.closest(".field") || el.parentNode).appendChild(p);
    return el;
  }

  function validate() {
    clearErrors();
    var f = form.elements, kind = isKind(), first = null;
    function need(el, msg) { if (!el.value.trim()) { first = first || fail(el, msg); return false; } return true; }

    need(f.name, "Bitte trag einen Namen ein.");
    if (kind) need(f.eltern_name, "Bitte trag den Namen des Elternteils ein.");
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email.value.trim())) first = first || fail(f.email, "Bitte trag eine gültige E-Mail-Adresse ein.");

    var jahr = parseInt(f.geburtsjahr.value, 10), now = new Date().getFullYear();
    if (!jahr || jahr < 1920 || jahr > now) {
      first = first || fail(f.geburtsjahr, "Bitte trag ein gültiges Geburtsjahr ein.");
    } else if (kind && event && event.kinderdistanz_max_alter && now - jahr > event.kinderdistanz_max_alter) {
      first = first || fail(f.geburtsjahr, "Die Kinderdistanz gilt bis " + event.kinderdistanz_max_alter + " Jahre.");
    } else if (!kind && now - jahr < 13) {
      first = first || fail(f.geburtsjahr, "Für Kinder wähle oben „Mein Kind“.");
    }

    if (!kind) {
      if (!f.geschlecht.value) first = first || fail(f.geschlecht, "Bitte wähle eine Wertung.");
      if (f.geschlecht.value === "divers" && !f.podium_wahl.value) first = first || fail(f.podium_wahl, "Bitte wähle, bei wem du in der Bestzeit-Wertung mitläufst.");
    }
    need(f.strasse, "Bitte trag deine Straße ein.");
    if (!/^[0-9A-Za-z -]{4,10}$/.test(f.plz.value.trim())) first = first || fail(f.plz, "Bitte trag eine gültige PLZ ein.");
    need(f.ort, "Bitte trag deinen Ort ein.");
    if (!f.agb.checked) first = first || fail(f.agb, "Bitte akzeptiere die Teilnahmebedingungen.");
    if (!f.datenschutz.checked) first = first || fail(f.datenschutz, "Bitte bestätige die Datenschutzerklärung.");

    if (first) { first.focus(); return false; }
    return true;
  }

  // --- Absenden --------------------------------------------------------
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    statusEl.hidden = true;
    if (!event || !validate()) return;

    var f = form.elements, kind = isKind();
    var payload = {
      event_id: event.id,
      kategorie: kind ? "kind" : "erwachsen",
      name: f.name.value.trim(),
      anzeigename: kind ? "" : f.anzeigename.value.trim(),
      email: f.email.value.trim(),
      geburtsjahr: parseInt(f.geburtsjahr.value, 10),
      geschlecht: kind ? "" : f.geschlecht.value,
      podium_wahl: !kind && f.geschlecht.value === "divers" ? f.podium_wahl.value : "",
      divers_oeffentlich_optin: !kind && f.geschlecht.value === "divers" && f.divers_optin.checked,
      eltern_name: kind ? f.eltern_name.value.trim() : "",
      eltern_email: kind ? f.email.value.trim() : "",
      adresse: f.strasse.value.trim() + ", " + f.plz.value.trim() + " " + f.ort.value.trim(),
      land: f.land.value,
      agb_akzeptiert: true,
      website: f.website.value
    };

    submitBtn.disabled = true;
    var label = submitBtn.textContent;
    submitBtn.textContent = "Einen Moment …";

    fetch(cfg.N8N_ANMELDUNG_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (body) {
        if (!r.ok || !body.checkout_url) throw new Error(body.fehler || "Fehler " + r.status);
        return body;
      });
    }).then(function (body) {
      window.location.assign(body.checkout_url);
    }).catch(function (err) {
      submitBtn.disabled = false;
      submitBtn.textContent = label;
      showStatus("Die Anmeldung hat nicht geklappt: " + err.message + ". Prüfe deine Angaben und versuch es noch einmal. Wenn es wieder scheitert, schreib an runner@runrebels.com.", true);
      statusEl.scrollIntoView({ block: "nearest", behavior: "smooth" });
    });
  });

  syncKategorie();
  syncLand();
  loadEvent();
})();
