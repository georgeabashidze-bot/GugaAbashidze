/**
 * Partner-brand catalogue config.
 *
 * Temporary structure used by /catalogue/food, /catalogue/hygiene and
 * /catalogue/vitamins while the SmartPaw product catalogue is being populated.
 *
 * When SmartPaw products are ready for a category, flip
 *   useBrandGrid: true → false
 * and the page will go back to its normal product grid.
 *
 * Brand entries can be added directly here, OR imported from the
 * `smartpaw_partner_brands.xlsx` template the admin fills in.
 */

export const PARTNER_BRANDS = {
  food: {
    useBrandGrid: true,
    label: { en: "Food", ka: "საკვები" },
    subtypes: [
      { id: "dry-food",  label: { en: "Dry Food",  ka: "მშრალი საკვები" } },
      { id: "wet-food",  label: { en: "Wet Food",  ka: "სველი საკვები" } },
      { id: "snacks",    label: { en: "Snacks",    ka: "წახემსები" } },
      { id: "other",     label: { en: "Other",     ka: "სხვა" } },
    ],
    brands: [
      {
        id: "royal-canin",
        name: { en: "Royal Canin",       ka: "Royal Canin" },
        logo: "",                              // empty = use text placeholder
        accent: "#C8102E",
        subtypes: ["dry-food", "wet-food", "other"],
        urls: {
          base: "https://www.royalcanin.com",
          "dry-food": "https://www.royalcanin.com/dog/products/retail/dry-food",
          "wet-food": "https://www.royalcanin.com/dog/products/retail/wet-food",
        },
      },
      {
        id: "hills",
        name: { en: "Hill's Science Diet", ka: "Hill's Science Diet" },
        logo: "",
        accent: "#003DA6",
        subtypes: ["dry-food", "wet-food"],
        urls: { base: "https://www.hillspet.com" },
      },
      {
        id: "monge",
        name: { en: "Monge",              ka: "Monge" },
        logo: "",
        accent: "#1D3557",
        subtypes: ["dry-food", "wet-food", "snacks"],
        urls: { base: "https://www.monge.it" },
      },
      {
        id: "bewital",
        name: { en: "Bewital",            ka: "Bewital" },
        logo: "",
        accent: "#0A4D8C",
        subtypes: ["dry-food"],
        urls: { base: "https://www.bewital-petfood.com" },
      },
      {
        id: "purina",
        name: { en: "Purina Pro Plan",    ka: "Purina Pro Plan" },
        logo: "",
        accent: "#E4002B",
        subtypes: ["dry-food", "wet-food", "snacks"],
        urls: { base: "https://www.purina.com" },
      },
      {
        id: "acana",
        name: { en: "Acana",              ka: "Acana" },
        logo: "",
        accent: "#2F6F4A",
        subtypes: ["dry-food"],
        urls: { base: "https://acana.com" },
      },
    ],
  },

  hygiene: {
    useBrandGrid: true,
    label: { en: "Hygiene", ka: "ჰიგიენა" },
    subtypes: [
      { id: "grooming",         label: { en: "Grooming",         ka: "მოვლა" } },
      { id: "veterinary-line",  label: { en: "Veterinary Line",  ka: "ვეტერინარული ხაზი" } },
      { id: "specific-care",    label: { en: "Specific Care",    ka: "სპეციფიკური მოვლა" } },
      { id: "other",            label: { en: "Other",            ka: "სხვა" } },
    ],
    brands: [
      {
        id: "beaphar",
        name: { en: "Beaphar",            ka: "Beaphar" },
        logo: "",
        accent: "#F25C05",
        subtypes: ["grooming", "specific-care"],
        urls: { base: "https://www.beaphar.com" },
      },
      {
        id: "virbac",
        name: { en: "Virbac",             ka: "Virbac" },
        logo: "",
        accent: "#0072CE",
        subtypes: ["veterinary-line", "specific-care"],
        urls: { base: "https://www.virbac.com" },
      },
      {
        id: "tropiclean",
        name: { en: "TropiClean",         ka: "TropiClean" },
        logo: "",
        accent: "#2BB673",
        subtypes: ["grooming"],
        urls: { base: "https://tropiclean.com" },
      },
      {
        id: "vets-best",
        name: { en: "Vet's Best",         ka: "Vet's Best" },
        logo: "",
        accent: "#1D5B79",
        subtypes: ["grooming", "veterinary-line"],
        urls: { base: "https://vetsbest.com" },
      },
      {
        id: "frontline",
        name: { en: "Frontline",          ka: "Frontline" },
        logo: "",
        accent: "#E4002B",
        subtypes: ["specific-care", "veterinary-line"],
        urls: { base: "https://www.frontline.com" },
      },
      {
        id: "espree",
        name: { en: "Espree",             ka: "Espree" },
        logo: "",
        accent: "#7D3C98",
        subtypes: ["grooming", "other"],
        urls: { base: "https://espree.com" },
      },
    ],
  },

  vitamins: {
    useBrandGrid: true,
    label: { en: "Vitamins", ka: "ვიტამინები" },
    subtypes: [],                              // intentionally empty
    brands: [
      {
        id: "vetriscience",
        name: { en: "VetriScience",       ka: "VetriScience" },
        logo: "",
        accent: "#2F6F4A",
        subtypes: [],
        urls: { base: "https://www.vetriscience.com" },
      },
      {
        id: "zesty-paws",
        name: { en: "Zesty Paws",         ka: "Zesty Paws" },
        logo: "",
        accent: "#F25C05",
        subtypes: [],
        urls: { base: "https://www.zestypaws.com" },
      },
      {
        id: "nutramax",
        name: { en: "Nutramax",           ka: "Nutramax" },
        logo: "",
        accent: "#1D3557",
        subtypes: [],
        urls: { base: "https://www.nutramaxlabs.com" },
      },
      {
        id: "pet-naturals",
        name: { en: "Pet Naturals",       ka: "Pet Naturals" },
        logo: "",
        accent: "#0A4D8C",
        subtypes: [],
        urls: { base: "https://www.petnaturals.com" },
      },
      {
        id: "vitalize",
        name: { en: "Vitalize",           ka: "Vitalize" },
        logo: "",
        accent: "#7D3C98",
        subtypes: [],
        urls: { base: "https://www.absorbinepet.com" },
      },
      {
        id: "naturvet",
        name: { en: "NaturVet",           ka: "NaturVet" },
        logo: "",
        accent: "#2BB673",
        subtypes: [],
        urls: { base: "https://naturvet.com" },
      },
    ],
  },
};

/**
 * Returns the partner URL to open for a given (brand, subtype).
 * Falls back to the base URL when no per-subtype URL is defined.
 */
export function brandUrlFor(brand, subtypeId) {
  if (!brand || !brand.urls) return "#";
  if (subtypeId && brand.urls[subtypeId]) return brand.urls[subtypeId];
  return brand.urls.base || "#";
}
