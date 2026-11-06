const formatEuros = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" });

export function euros(montant) {
  return formatEuros.format(montant);
}
