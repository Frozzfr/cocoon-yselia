// Configuration du module Kalendes (https://help.kalendes.com/fr/article/marque-blanche-13h9u79/).
// Script classique, pas un module : il doit s'exécuter avant https://www.kalendes.com/site/scripts/widget.js.
//
// Liens possibles vers la page de réservation :
//   reservation.html                 → prise de rendez-vous
//   reservation.html?page=buy        → boutique (click & collect, livraison)
//   reservation.html?page=gift       → cartes cadeaux
//   reservation.html?idFamille=123   → une catégorie de soins précise
//   reservation.html?idArticle=456   → un soin précis
//   reservation.html?page=buy&idArticle=456 → un produit précis (boutons « Acheter » de la boutique)
// Les identifiants se trouvent dans Kalendes : Paramètres avancés > Promotions > Liens externes.
(function () {
  var conteneur = document.getElementById("kalendes-widget-container");
  if (!conteneur) return;

  var parametres = new URLSearchParams(window.location.search);
  var pagesConnues = ["reserve", "buy", "gift", "buy_reserve"];
  var page = parametres.get("page");

  window.kalendes = {
    host: conteneur.dataset.kalendesHost,
    buttons: { buy: 0, reserve: 0, gift: 0, buyReserve: 0 },
    // SIMPLE2 : soins présentés par catégorie
    displayMode: "SIMPLE2",
    pageAtStart: pagesConnues.indexOf(page) >= 0 ? page : "reserve",
    onBookingConfirmed: function () {
      // Point d'accroche pour un suivi statistique (Google Analytics…) une fois la réservation validée
    },
  };

  var cible = parametres.get("idArticle")
    ? ["article", parametres.get("idArticle")]
    : parametres.get("idFamille")
      ? ["famille", parametres.get("idFamille")]
      : null;
  if (!cible) return;

  // kalendes.goTo n'existe qu'une fois le module chargé : on réessaie toutes les 500 ms
  var essai = setInterval(function () {
    if (window.kalendes && typeof window.kalendes.goTo === "function") {
      clearInterval(essai);
      window.kalendes.goTo(cible[0], Number(cible[1]));
    }
  }, 500);
})();
