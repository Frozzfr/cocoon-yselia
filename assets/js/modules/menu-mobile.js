// Ouverture et fermeture du menu sur tablette et mobile.
export function initMenuMobile() {
  const bouton = document.getElementById("burger");
  const menu = document.getElementById("mnav");
  if (!bouton || !menu) return;

  bouton.addEventListener("click", () => {
    const ouvert = menu.classList.toggle("open");
    bouton.setAttribute("aria-expanded", String(ouvert));
    bouton.setAttribute("aria-label", ouvert ? "Fermer le menu" : "Ouvrir le menu");
  });
}
