// Boutons "Copier" : <button data-copier="texte" data-cible="id-de-l-element-a-selectionner">
export function initCopie() {
  document.querySelectorAll("[data-copier]").forEach((bouton) => {
    const libelle = bouton.textContent;
    bouton.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(bouton.dataset.copier);
        bouton.textContent = "Copié";
        setTimeout(() => { bouton.textContent = libelle; }, 1500);
      } catch {
        // Presse-papiers refusé : on sélectionne le texte pour que le visiteur le copie lui-même
        const cible = document.getElementById(bouton.dataset.cible);
        if (!cible) return;
        const selection = document.createRange();
        selection.selectNodeContents(cible);
        getSelection().removeAllRanges();
        getSelection().addRange(selection);
      }
    });
  });
}
