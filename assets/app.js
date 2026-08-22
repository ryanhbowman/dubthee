function normalize(s) {
  return s.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function flagEmoji(code) {
  return code
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt(0)));
}

function buildLookup() {
  const byNormalizedName = new Map();
  for (const [code, name] of COUNTRIES) {
    byNormalizedName.set(normalize(name), { code, name });
  }
  for (const [alias, canonical] of Object.entries(ALIASES)) {
    const entry = byNormalizedName.get(normalize(canonical));
    if (entry) byNormalizedName.set(normalize(alias), entry);
  }
  return byNormalizedName;
}

function getRequestedCountry() {
  const raw = decodeURIComponent(
    window.location.pathname.replace(/^\/+|\/+$/g, "")
  );
  return raw.split("/")[0] || "";
}

function render() {
  const stage = document.getElementById("stage");
  const requested = getRequestedCountry();

  if (!requested) {
    stage.innerHTML = `
      <p class="decree">I dub thee back from</p>
      <p class="blank">___________</p>
      <p class="hint">Add a country to the address, Your Majesty.<br>
        e.g. <code>dubtheebackfrom.com/india</code></p>
    `;
    return;
  }

  const lookup = buildLookup();
  const match = lookup.get(normalize(requested));

  if (!match) {
    stage.innerHTML = `
      <p class="decree">I dub thee back from</p>
      <p class="country unknown">A LAND UNKNOWN TO THE CROWN&hellip;</p>
      <p class="hint">No kingdom named &ldquo;${escapeHtml(requested)}&rdquo; was found in the royal atlas.</p>
    `;
    return;
  }

  stage.innerHTML = `
    <p class="decree">I dub thee back from</p>
    <p class="country">
      <span class="flag">${flagEmoji(match.code)}</span>
      <span class="name">${match.name.toUpperCase()}!!!</span>
    </p>
  `;
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

render();
