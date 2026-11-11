// Produits de la boutique, lus dans assets/donnees/boutique.json (généré depuis Kalendes par : npm run synchro-boutique).
// Présentés comme la carte des soins : le catalogue par gamme sur boutique.html ([data-boutique]), les gammes sur l'accueil ([data-apercu-boutique]).
// Le bouton « Acheter » ouvre la fiche du produit dans le module Kalendes, qui gère le panier, le paiement et le stock.
import { euros } from "./format.js?v=f740c7d";
import { initRechercheSoins } from "./recherche-soins.js?v=f740c7d";

const ADRESSE_BOUTIQUE = new URL("../../donnees/boutique.json?v=f740c7d", import.meta.url);
const formatDate = new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" });

const ECHAPPEMENTS = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
const echapper = (texte) => String(texte).replace(/[&<>"']/g, (c) => ECHAPPEMENTS[c]);

// Coupe un texte trop long au dernier espace avant la limite, suivi de « ... »
function tronquer(texte, longueur) {
  if (texte.length <= longueur) return texte;
  const coupure = texte.lastIndexOf(" ", longueur);
  return `${texte.slice(0, coupure === -1 ? longueur : coupure)}...`;
}

const pluriel = (nombre, mot) => `${nombre} ${mot}${nombre > 1 ? "s" : ""}`;
const resume = (gamme) => `${pluriel(gamme.nombre, "produit")}${gamme.enLigne ? ` · ${gamme.enLigne === gamme.nombre ? "tous" : gamme.enLigne} en ligne` : ""}`;

function ApercuGamme(gamme) {
  return `<a class="apercu-soin" href="boutique.html#${echapper(gamme.ancre)}">
        <h3>${echapper(gamme.nom)}</h3>
        <p>${resume(gamme)}</p>
      </a>`;
}

function Produit(produit, gamme) {
  const recherche = [produit.nom, gamme.nom, produit.description.join(" ")].join(" ");
  const details = produit.description.length
    ? `
                <details class="soin-details">
                  <summary>${echapper(tronquer(produit.description[0], 110))}</summary>
                  ${produit.description.map((ligne) => `<p>${echapper(ligne)}</p>`).join("\n                  ")}
                </details>`
    : "";
  const action = produit.achetable
    ? `<a class="btn btn-ghost btn-sm" href="reservation.html?page=buy&idArticle=${Number(produit.id)}" aria-label="Acheter : ${echapper(produit.nom)}">Acheter</a>`
    : `<span class="soin-sur-demande">En vente à l'institut</span>`;
  return `<li class="soin" data-soin="${echapper(recherche)}">
              <div class="soin-infos">
                <span class="soin-nom">${echapper(produit.nom)}</span>${details}
              </div>
              <div class="soin-meta">
                <span class="soin-prix">${produit.afficherPrix ? euros(produit.prix) : "Prix en institut"}</span>
                ${action}
              </div>
            </li>`;
}

function GammeProduits(gamme, index) {
  return `<section class="carte-categorie" id="${echapper(gamme.ancre)}" aria-labelledby="gamme-${index}" data-categorie-soins>
        <header class="carte-categorie-tete">
          <h3 id="gamme-${index}">${echapper(gamme.nom)}</h3>
          <p>${resume(gamme)}</p>
        </header>

        <div class="carte-groupes">
          <div class="carte-groupe" data-groupe-soins>
            <ul class="carte-liste">
            ${gamme.produits.map((produit) => Produit(produit, gamme)).join("\n            ")}
            </ul>
          </div>
        </div>
      </section>`;
}

const LienGamme = (gamme) => `<a href="#${echapper(gamme.ancre)}">${echapper(gamme.nom)} <span>${gamme.nombre}</span></a>`;

function afficherBoutique(racine, boutique) {
  const total = boutique.gammes.reduce((somme, gamme) => somme + gamme.nombre, 0);
  const enLigne = boutique.gammes.reduce((somme, gamme) => somme + gamme.enLigne, 0);
  document.querySelector("[data-boutique-total]").textContent = `${pluriel(total, "produit")}, dont ${enLigne} à commander en ligne. Tarifs TTC.`;
  document.querySelector("[data-boutique-nav]").innerHTML = boutique.gammes.map(LienGamme).join("\n      ");
  racine.insertAdjacentHTML("afterbegin", boutique.gammes.map(GammeProduits).join("\n      "));
  document.querySelector("[data-boutique-maj]").textContent = `Catalogue mis à jour le ${formatDate.format(new Date(`${boutique.majLe}T12:00:00`))}. Le stock et le prix sont confirmés au moment de la commande.`;
  initRechercheSoins();
  // Lien direct vers une gamme (boutique.html#bijoux) : la cible n'existait pas au chargement de la page
  if (location.hash) document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView();
}

export async function initBoutique() {
  const racine = document.querySelector("[data-boutique]");
  const apercu = document.querySelector("[data-apercu-boutique]");
  if (!racine && !apercu) return;

  let boutique;
  try {
    const reponse = await fetch(ADRESSE_BOUTIQUE);
    if (!reponse.ok) throw new Error(`boutique.json : ${reponse.status}`);
    boutique = await reponse.json();
  } catch {
    document.querySelectorAll("[data-boutique-erreur]").forEach((message) => { message.hidden = false; });
    return;
  }

  if (racine) afficherBoutique(racine, boutique);
  if (apercu) apercu.innerHTML = boutique.gammes.map(ApercuGamme).join("\n      ");
}
