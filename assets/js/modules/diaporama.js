// Diaporama "À la une" : défilement automatique, mis en pause au survol, au clavier ou par le bouton.
const DUREE_DIAPO = 6500;

export function initDiaporama() {
  const racine = document.querySelector("[data-diaporama]");
  if (!racine) return;

  const piste = racine.querySelector("[data-piste]");
  const diapos = [...racine.querySelectorAll("[data-diapo]")];
  const points = [...racine.querySelectorAll("[data-aller]")];
  const boutonPause = racine.querySelector("[data-pause]");
  const retenu = { survol: false, focus: false };
  let actuelle = 0;
  let minuteur = null;
  let enPause = matchMedia("(prefers-reduced-motion: reduce)").matches;

  function afficher(index, manuel) {
    actuelle = (index + diapos.length) % diapos.length;
    piste.style.transform = `translateX(${-100 * actuelle}%)`;
    // Annonce la nouvelle diapo aux lecteurs d'écran seulement quand le visiteur a navigué lui-même
    piste.setAttribute("aria-live", manuel ? "polite" : "off");
    diapos.forEach((diapo, i) => {
      diapo.inert = i !== actuelle;
      diapo.setAttribute("aria-hidden", String(i !== actuelle));
    });
    points.forEach((point, i) => point.setAttribute("aria-current", String(i === actuelle)));
    programmer();
  }

  function programmer() {
    clearTimeout(minuteur);
    if (!enPause && !retenu.survol && !retenu.focus) {
      minuteur = setTimeout(() => afficher(actuelle + 1, false), DUREE_DIAPO);
    }
  }

  function mettreEnPause(pause) {
    enPause = pause;
    boutonPause.textContent = pause ? "Lecture" : "Pause";
    boutonPause.setAttribute("aria-label", pause ? "Reprendre le défilement des actualités" : "Mettre en pause le défilement des actualités");
    programmer();
  }

  racine.addEventListener("click", (evenement) => {
    const point = evenement.target.closest("[data-aller]");
    if (evenement.target.closest("[data-precedent]")) afficher(actuelle - 1, true);
    else if (evenement.target.closest("[data-suivant]")) afficher(actuelle + 1, true);
    else if (point) afficher(Number(point.dataset.aller), true);
    else if (evenement.target.closest("[data-pause]")) mettreEnPause(!enPause);
  });

  racine.addEventListener("keydown", (evenement) => {
    if (evenement.key !== "ArrowLeft" && evenement.key !== "ArrowRight") return;
    evenement.preventDefault();
    afficher(actuelle + (evenement.key === "ArrowRight" ? 1 : -1), true);
  });

  racine.addEventListener("mouseenter", () => { retenu.survol = true; programmer(); });
  racine.addEventListener("mouseleave", () => { retenu.survol = false; programmer(); });
  racine.addEventListener("focusin", () => { retenu.focus = true; programmer(); });
  racine.addEventListener("focusout", (evenement) => {
    if (racine.contains(evenement.relatedTarget)) return;
    retenu.focus = false;
    programmer();
  });

  // Glissement du doigt sur mobile
  let departX = null;
  piste.addEventListener("pointerdown", (evenement) => { departX = evenement.clientX; });
  piste.addEventListener("pointerup", (evenement) => {
    if (departX === null) return;
    const ecart = evenement.clientX - departX;
    departX = null;
    if (Math.abs(ecart) > 50) afficher(actuelle + (ecart < 0 ? 1 : -1), true);
  });

  afficher(0, false);
  mettreEnPause(enPause);
}
