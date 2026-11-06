// Carte des soins, lue dans assets/donnees/carte.json (généré depuis Kalendes par : npm run synchro-carte).
// Affiche la carte complète sur soins.html ([data-carte-soins]) et l'aperçu des catégories sur l'accueil ([data-apercu-soins]).
// Chaque fonction ci-dessous rend un bloc de HTML à partir des données, comme le ferait un composant React.
import { euros } from "./format.js?v=88cfdb2";
import { initRechercheSoins } from "./recherche-soins.js?v=88cfdb2";

const ADRESSE_CARTE = new URL("../../donnees/carte.json?v=88cfdb2", import.meta.url);
const formatDate = new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" });

const ECHAPPEMENTS = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
const echapper = (texte) => String(texte).replace(/[&<>"']/g, (c) => ECHAPPEMENTS[c]);

// Coupe un texte trop long au dernier espace avant la limite, suivi de « ... »
function tronquer(texte, longueur) {
  if (texte.length <= longueur) return texte;
  const coupure = texte.lastIndexOf(" ", longueur);
  return `${texte.slice(0, coupure === -1 ? longueur : coupure)}...`;
}

const resume = (categorie) => `${categorie.nombre} soin${categorie.nombre > 1 ? "s" : ""}${categorie.prixMin ? ` · dès ${euros(categorie.prixMin)}` : ""}`;

function ApercuSoin(categorie) {
  return `<a class="apercu-soin" href="soins.html#${echapper(categorie.ancre)}">
        <h3>${echapper(categorie.nom)}</h3>
        <p>${resume(categorie)}</p>
      </a>`;
}

function Soin(soin, groupe) {
  const recherche = [soin.nom, groupe.nom, soin.description.join(" ")].join(" ");
  const details = soin.description.length
    ? `
                <details class="soin-details">
                  <summary>${echapper(tronquer(soin.description[0], 110))}</summary>
                  ${soin.description.map((ligne) => `<p>${echapper(ligne)}</p>`).join("\n                  ")}
                </details>`
    : "";
  const action = soin.reservable
    ? `<a class="btn btn-ghost btn-sm" href="reservation.html?idArticle=${Number(soin.id)}" aria-label="Réserver : ${echapper(soin.nom)}">Réserver</a>`
    : `<span class="soin-sur-demande">Sur demande en institut</span>`;
  return `<li class="soin" data-soin="${echapper(recherche)}">
              <div class="soin-infos">
                <span class="soin-nom">${echapper(soin.nom)}</span>${details}
              </div>
              <div class="soin-meta">${soin.duree ? `<span class="soin-duree">${Number(soin.duree)} min</span>` : ""}
                <span class="soin-prix">${soin.afficherPrix ? euros(soin.prix) : "Prix en institut"}</span>
                ${action}
              </div>
            </li>`;
}

function GroupeSoins(groupe, categorie) {
  const titre = groupe.nom !== categorie.nom ? `<h4 class="carte-groupe-titre">${echapper(groupe.nom)}</h4>` : "";
  return `<div class="carte-groupe" data-groupe-soins>${titre}
          <ul class="carte-liste">
            ${groupe.prestations.map((soin) => Soin(soin, groupe)).join("\n            ")}
          </ul>
        </div>`;
}

function CategorieSoins(categorie) {
  return `<section class="carte-categorie" id="${echapper(categorie.ancre)}" aria-labelledby="categorie-${Number(categorie.id)}" data-categorie-soins>
        <header class="carte-categorie-tete">
          <h3 id="categorie-${Number(categorie.id)}">${echapper(categorie.nom)}</h3>
          <p>${resume(categorie)}</p>
        </header>

        <div class="carte-groupes">
        ${categorie.sousCategories.map((groupe) => GroupeSoins(groupe, categorie)).join("\n        ")}
        </div>
      </section>`;
}

const LienCategorie = (categorie) => `<a href="#${echapper(categorie.ancre)}">${echapper(categorie.nom)} <span>${categorie.nombre}</span></a>`;

function afficherCarte(racine, carte) {
  const total = carte.categories.reduce((somme, categorie) => somme + categorie.nombre, 0);
  document.querySelector("[data-carte-total]").textContent = `${total} soins, réservables en ligne. Tarifs TTC.`;
  document.querySelector("[data-carte-nav]").innerHTML = carte.categories.map(LienCategorie).join("\n      ");
  racine.insertAdjacentHTML("afterbegin", carte.categories.map(CategorieSoins).join("\n      "));
  document.querySelector("[data-carte-maj]").textContent = `Carte mise à jour le ${formatDate.format(new Date(`${carte.majLe}T12:00:00`))}.`;
  initRechercheSoins();
  // Lien direct vers une catégorie (soins.html#epilations) : la cible n'existait pas au chargement de la page
  if (location.hash) document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView();
}

export async function initCarteSoins() {
  const racine = document.querySelector("[data-carte-soins]");
  const apercu = document.querySelector("[data-apercu-soins]");
  if (!racine && !apercu) return;

  let carte;
  try {
    const reponse = await fetch(ADRESSE_CARTE);
    if (!reponse.ok) throw new Error(`carte.json : ${reponse.status}`);
    carte = await reponse.json();
  } catch {
    document.querySelectorAll("[data-carte-erreur]").forEach((message) => { message.hidden = false; });
    return;
  }

  if (racine) afficherCarte(racine, carte);
  if (apercu) apercu.innerHTML = carte.categories.map(ApercuSoin).join("\n      ");
}
