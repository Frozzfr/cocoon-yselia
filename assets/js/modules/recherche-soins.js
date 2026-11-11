// Recherche instantanée dans la carte des soins (soins.html) et le catalogue de la boutique (boutique.html), sans tenir compte des accents.
// Appelée par carte-soins.js ou boutique.js une fois la liste affichée.
const normaliser = (texte) => texte.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export function initRechercheSoins() {
  const champ = document.querySelector("[data-recherche-soins]");
  if (!champ) return;

  const soins = [...document.querySelectorAll("[data-soin]")].map((element) => ({ element, texte: normaliser(element.dataset.soin) }));
  const groupes = document.querySelectorAll("[data-groupe-soins]");
  const categories = [...document.querySelectorAll("[data-categorie-soins]")];
  const messageVide = document.querySelector("[data-carte-vide]");

  champ.addEventListener("input", () => {
    const mots = normaliser(champ.value).split(/\s+/).filter(Boolean);
    soins.forEach(({ element, texte }) => { element.hidden = !mots.every((mot) => texte.includes(mot)); });
    groupes.forEach((groupe) => { groupe.hidden = !groupe.querySelector("[data-soin]:not([hidden])"); });
    categories.forEach((categorie) => { categorie.hidden = !categorie.querySelector("[data-soin]:not([hidden])"); });
    messageVide.hidden = categories.some((categorie) => !categorie.hidden);
  });
}
