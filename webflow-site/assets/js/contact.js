(function () {
  "use strict";

  const form = document.getElementById("email-form");
  if (!form) return;

  const wrapper = form.closest(".w-form");
  const success = wrapper && wrapper.querySelector(".w-form-done");
  const failure = wrapper && wrapper.querySelector(".w-form-fail");
  const submit = form.querySelector('[type="submit"]');
  const defaultLabel = submit ? submit.value : "Submit";

  let siteKeyPromise;

  function loadRecaptcha() {
    if (siteKeyPromise) return siteKeyPromise;

    siteKeyPromise = fetch("/api/contact-config", {
      headers: { Accept: "application/json" },
    })
      .then(function (response) {
        if (!response.ok) throw new Error("Contact form is not configured.");
        return response.json();
      })
      .then(function (config) {
        if (!config.siteKey) throw new Error("reCAPTCHA is not configured.");

        return new Promise(function (resolve, reject) {
          window.aetherisRecaptchaReady = function () {
            window.grecaptcha.ready(function () {
              resolve(config.siteKey);
            });
          };

          const script = document.createElement("script");
          script.src =
            "https://www.google.com/recaptcha/api.js?render=" +
            encodeURIComponent(config.siteKey) +
            "&onload=aetherisRecaptchaReady";
          script.async = true;
          script.defer = true;
          script.onerror = function () {
            reject(new Error("Unable to load reCAPTCHA."));
          };
          document.head.appendChild(script);
        });
      });

    return siteKeyPromise;
  }

  function setPending(pending) {
    if (!submit) return;
    submit.disabled = pending;
    submit.value = pending
      ? submit.getAttribute("data-wait") || "Please wait..."
      : defaultLabel;
  }

  function showFailure(message) {
    if (failure) {
      const text = failure.querySelector("div");
      if (text && message) text.textContent = message;
      failure.style.display = "block";
    }
  }

  loadRecaptcha().catch(function () {
    // The same error is shown after submit, where it is actionable.
  });

  form.addEventListener(
    "submit",
    async function (event) {
      event.preventDefault();
      event.stopImmediatePropagation();
      if (!form.reportValidity()) return;

      setPending(true);
      if (failure) failure.style.display = "none";

      try {
        const siteKey = await loadRecaptcha();
        const token = await window.grecaptcha.execute(siteKey, {
          action: "contact",
        });
        const data = new FormData(form);

        const response = await fetch("/api/contact", {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: data.get("name"),
            email: data.get("email"),
            message: data.get("message"),
            website: data.get("website"),
            recaptchaToken: token,
          }),
        });
        const result = await response.json().catch(function () {
          return {};
        });

        if (!response.ok || !result.ok) {
          throw new Error(
            result.error || "Something went wrong while submitting the form.",
          );
        }

        if (window.aetherisTrack) {
          window.aetherisTrack("contact_form_submit", {
            form_id: "email-form",
            event_category: "lead",
          });
        }

        form.style.display = "none";
        if (success) success.style.display = "block";
        form.reset();
      } catch (error) {
        showFailure(
          error instanceof Error
            ? error.message
            : "Something went wrong while submitting the form.",
        );
      } finally {
        setPending(false);
      }
    },
    true,
  );
})();
