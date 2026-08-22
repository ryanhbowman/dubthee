// Fires a one-time confetti explosion in the given colors. Call
// window.launchConfetti(["#hex", ...]) once, typically right after the
// country name finishes revealing.
(function () {
  const layer = document.getElementById("confetti-layer");
  const FALLBACK_COLORS = ["#f0c14b", "#ffe8a3", "#ff5c8a", "#5ce1ff", "#7cfc9a", "#c77dff", "#ffffff", "#ff9f45"];
  const ORIGIN_TOP = "130px";

  function burstPiece(colors) {
    const piece = document.createElement("span");
    piece.className = "confetti-piece";

    const isCircle = Math.random() < 0.35;
    const width = 6 + Math.random() * 7;
    const height = isCircle ? width : width * (0.4 + Math.random() * 0.6);

    // Quick outward "pop", then a fluttering S-curve fall (like real paper
    // confetti catching air) down past the bottom of the screen. Rotation
    // is a single continuous spin rate rather than jumping between
    // independently-randomized angles, so it doesn't look jittery.
    const burstX = (Math.random() * 2 - 1) * (60 + Math.random() * 260);
    const burstY = -10 - Math.random() * 90;
    const endX = burstX + (Math.random() * 260 - 130);
    const endY = burstY + 650 + Math.random() * 500;
    const wobbleX = burstX + (endX - burstX) * 0.5 + (Math.random() * 70 - 35);
    const wobbleY = burstY + (endY - burstY) * 0.55;

    const duration = 2.8 + Math.random() * 1.8;
    const delay = Math.random() * 0.18;
    const spinEnd = Math.round((Math.random() * 2 - 1) * (360 + Math.random() * 540));
    const spinMid = Math.round(spinEnd * 0.15);
    const spinWobble = Math.round(spinEnd * 0.55);

    piece.style.left = "50%";
    piece.style.top = ORIGIN_TOP;
    piece.style.width = width + "px";
    piece.style.height = height + "px";
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.borderRadius = isCircle ? "50%" : "2px";
    piece.style.animationDuration = duration + "s";
    piece.style.animationDelay = delay + "s";
    piece.style.setProperty("--burst-x", burstX + "px");
    piece.style.setProperty("--burst-y", burstY + "px");
    piece.style.setProperty("--wobble-x", wobbleX + "px");
    piece.style.setProperty("--wobble-y", wobbleY + "px");
    piece.style.setProperty("--end-x", endX + "px");
    piece.style.setProperty("--end-y", endY + "px");
    piece.style.setProperty("--spin-mid", spinMid + "deg");
    piece.style.setProperty("--spin-wobble", spinWobble + "deg");
    piece.style.setProperty("--spin-end", spinEnd + "deg");

    return piece;
  }

  window.launchConfetti = function (colors) {
    if (!layer) return;
    const palette = colors && colors.length ? colors : FALLBACK_COLORS;
    const frag = document.createDocumentFragment();
    const count = 160;
    for (let i = 0; i < count; i++) {
      frag.appendChild(burstPiece(palette));
    }
    layer.appendChild(frag);

    setTimeout(() => {
      layer.innerHTML = "";
    }, 5200);
  };
})();
