// Point d'entrée : chaque module ne s'active que si la page contient les éléments dont il a besoin.
import { initMenuMobile } from "./modules/menu-mobile.js?v=88cfdb2";
import { initBoutique } from "./modules/boutique.js?v=88cfdb2";
import { initDiaporama } from "./modules/diaporama.js?v=88cfdb2";
import { initCopie } from "./modules/copie.js?v=88cfdb2";
import { initCarteSoins } from "./modules/carte-soins.js?v=88cfdb2";

initMenuMobile();
initBoutique();
initDiaporama();
initCopie();
initCarteSoins();
