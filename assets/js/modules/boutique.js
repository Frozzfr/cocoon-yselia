// Produits de la boutique, lus dans assets/donnees/boutique.json (généré depuis Kalendes par : npm run synchro-boutique).
// Affiche tout le catalogue et ses filtres sur boutique.html ([data-produits]) et quelques produits sur l'accueil ([data-produits-apercu]).
// Le bouton « Acheter » ouvre la fiche du produit dans le module Kalendes, qui gère le panier, le paiement et le stock.
import { euros } from "./format.js?v=88cfdb2";

const ADRESSE_BOUTIQUE = new URL("../../donnees/boutique.json?v=88cfdb2", import.meta.url);
const DOSSIER_PHOTOS = new URL("../../img/produits/", import.meta.url);
const NOMBRE_TEINTES = 8;
const NOMBRE_APERCU = 4;
const FILTRE_TOUT = "tout";
const FILTRE_ACHETABLE = "achetable";
const formatDate = new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" });

const ECHAPPEMENTS = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
const echapper = (texte) => String(texte).replace(/[&<>"']/g, (c) => ECHAPPEMENTS[c]);

// Photo du produit, ou flacon dessiné aux couleurs de la version en attendant une photo dans Kalendes
function VisuelProduit(produit, index) {
  if (produit.photo) {
    return `<div class="ph ph-produit ph-photo"><img src="${new URL(encodeURIComponent(produit.photo), DOSSIER_PHOTOS).href}?v=88cfdb2" alt="" width="600" height="600" loading="lazy"></div>`;
  }
  return `<div class="ph ph-produit" style="--teinte: var(--teinte-${(index % NOMBRE_TEINTES) + 1})"><span class="bottle bottle--flacon"></span></div>`;
}

function CarteProduit(produit, index) {
  const action = produit.achetable
    ? `<a class="add" href="reservation.html?page=buy&idArticle=${Number(produit.id)}" aria-label="Acheter : ${echapper(produit.nom)}">Acheter</a>`
    : `<span class="p-institut">En vente à l'institut</span>`;
  return `<article class="product" data-categorie="${echapper(produit.categorie)}"${produit.achetable ? " data-achetable" : ""}>
              ${VisuelProduit(produit, index)}
              <div class="p-body">
                <h3 class="p-name">${echapper(produit.nom)}</h3>
                <span class="p-meta">${echapper(produit.categorie)}</span>
                <div class="p-foot">
                  <span class="price">${produit.afficherPrix ? euros(produit.prix) : "Prix en institut"}</span>
                  ${action}
                </div>
              </div>
            </article>`;
}

const BoutonFiltre = (valeur, libelle, choisi = false) => `<button type="button" class="filter" data-filtre="${echapper(valeur)}" aria-pressed="${choisi}">${echapper(libelle)}</button>`;

function afficherFiltres(racine, grille, produits) {
  const categories = [...new Set(produits.map((p) => p.categorie))];
  racine.innerHTML = [
    BoutonFiltre(FILTRE_TOUT, "Tout", true),
    BoutonFiltre(FILTRE_ACHETABLE, "À acheter en ligne"),
    ...categories.map((categorie) => BoutonFiltre(categorie, categorie)),
  ].join("\n            ");

  racine.addEventListener("click", (evenement) => {
    const bouton = evenement.target.closest("[data-filtre]");
    if (!bouton) return;
    const choix = bouton.dataset.filtre;
    racine.querySelectorAll("[data-filtre]").forEach((b) => b.setAttribute("aria-pressed", String(b === bouton)));
    grille.querySelectorAll(".product").forEach((carte) => {
      carte.hidden = !(choix === FILTRE_TOUT || (choix === FILTRE_ACHETABLE ? "achetable" in carte.dataset : carte.dataset.categorie === choix));
    });
  });
}

// Pour l'accueil : des produits achetables avec photo, une seule par gamme tant que c'est possible
function choisirApercu(produits) {
  const candidats = produits.filter((p) => p.achetable && p.photo);
  const gammes = new Set();
  const varies = candidats.filter((p) => !gammes.has(p.categorie) && gammes.add(p.categorie));
  return [...varies, ...candidats.filter((p) => !varies.includes(p))].slice(0, NOMBRE_APERCU);
}

export async function initBoutique() {
  const grille = document.querySelector("[data-produits]");
  const apercu = document.querySelector("[data-produits-apercu]");
  if (!grille && !apercu) return;

  let boutique;
  try {
    const reponse = await fetch(ADRESSE_BOUTIQUE);
    if (!reponse.ok) throw new Error(`boutique.json : ${reponse.status}`);
    boutique = await reponse.json();
  } catch {
    document.querySelectorAll("[data-boutique-erreur]").forEach((message) => { message.hidden = false; });
    return;
  }

  if (grille) {
    grille.innerHTML = boutique.produits.map(CarteProduit).join("\n            ");
    afficherFiltres(document.querySelector("[data-filtres]"), grille, boutique.produits);
    document.querySelector("[data-boutique-maj]").textContent = `Catalogue mis à jour le ${formatDate.format(new Date(`${boutique.majLe}T12:00:00`))}. Le stock et le prix sont confirmés au moment de la commande.`;
  }
  if (apercu) apercu.innerHTML = choisirApercu(boutique.produits).map(CarteProduit).join("\n            ");
}
