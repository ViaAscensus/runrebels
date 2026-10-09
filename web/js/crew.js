(function () {
  "use strict";
  var cfg = window.RUNREBELS || {};

  // --- Social-Links: erscheinen nur, wenn in config.js eine Adresse steht ---
  var labels = { instagram: "Instagram", tiktok: "TikTok", strava: "Strava-Club", facebook: "Facebook" };
  [].forEach.call(document.querySelectorAll("[data-social]"), function (list) {
    var any = false;
    Object.keys(labels).forEach(function (key) {
      var url = cfg.SOCIAL && cfg.SOCIAL[key];
      if (!url || !/^https:\/\//.test(url)) return;
      var li = document.createElement("li"), a = document.createElement("a");
      a.href = url; a.rel = "noopener"; a.target = "_blank"; a.textContent = labels[key];
      li.appendChild(a); list.appendChild(li); any = true;
    });
    var empty = list.parentNode.querySelector("[data-social-empty]");
    if (any) { list.hidden = false; if (empty) empty.hidden = true; }
  });

  // --- Bestätigungs- und Abmeldeseite: Fehlerfall über ?fehler=1 ---
  var statePage = document.querySelector("[data-page]");
  if (statePage && /[?&]fehler=1/.test(location.search)) {
    var okBox = statePage.querySelector("[data-state=ok]"), errBox = statePage.querySelector("[data-state=fehler]");
    if (okBox && errBox) { okBox.hidden = true; errBox.hidden = false; }
  }

  // --- Crew-Eintragung ---
  [].forEach.call(document.querySelectorAll("form.crew-form"), function (form) {
    var status = form.querySelector(".crew-status");
    var btn = form.querySelector("button[type=submit]");
    var fields = {
      vorname: form.elements.vorname,
      email: form.elements.email,
      einwilligung: form.elements.einwilligung
    };

    function show(text, isError) {
      status.textContent = text;
      status.className = "crew-status" + (isError ? " crew-status--error" : "");
      status.hidden = false;
      status.focus();
    }
    function mark(el, bad) {
      el.setAttribute("aria-invalid", bad ? "true" : "false");
      var wrap = el.closest(".run-field");
      if (wrap) wrap.classList.toggle("run-field--error", !!bad);
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      status.hidden = true;
      var vorname = fields.vorname.value.trim();
      var email = fields.email.value.trim();
      var problems = [];
      mark(fields.vorname, vorname.length < 2);
      if (vorname.length < 2) problems.push("Bitte trag deinen Vornamen ein.");
      var mailOk = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
      mark(fields.email, !mailOk);
      if (!mailOk) problems.push(email.indexOf("@") < 0 ? "Bitte prüfen: Bei der E-Mail-Adresse fehlt das @." : "Bitte prüfen: Bei der E-Mail-Adresse stimmt etwas nicht.");
      if (!fields.einwilligung.checked) problems.push("Bitte bestätige, dass wir dir Neuigkeiten per E-Mail schicken dürfen.");
      if (problems.length) {
        show(problems.join("\n"), true);
        return;
      }
      btn.disabled = true;
      var label = btn.textContent;
      btn.textContent = "Wird eingetragen …";
      fetch(cfg.N8N_CREW_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vorname: vorname,
          email: email,
          stil: form.elements.stil.value.trim(),
          einwilligung: true,
          website: form.elements.website.value
        })
      }).then(function (r) {
        return r.json().catch(function () { return {}; }).then(function (body) { return { ok: r.ok, body: body }; });
      }).then(function (res) {
        if (!res.ok) throw new Error(res.body.fehler || "");
        form.reset();
        btn.hidden = true;
        show("Fast geschafft: Wir haben dir eine Mail geschickt. Bestätige darin deine Adresse, dann bist du in der Crew. Nichts angekommen? Schau im Spam-Ordner nach.", false);
        if (window.dataLayer) window.dataLayer.push({ event: "crew_eintragung" });
      }).catch(function (err) {
        btn.disabled = false;
        btn.textContent = label;
        show(err && err.message ? err.message : "Das hat nicht geklappt. Versuch es gleich noch einmal oder schreib an runner@runrebels.com.", true);
      });
    });
  });
})();
