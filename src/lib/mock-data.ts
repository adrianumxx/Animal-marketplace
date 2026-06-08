/* ─── Shared mock data for all pages ──────────────────────────────────────── */

export type BadgeLevel = "basic" | "pro" | "premium";
export type VerificationStatus = "verified" | "pending" | "rejected";
export type Gender = "male" | "female";
export type Size = "small" | "medium" | "large" | "giant";
export type EnergyLevel = "low" | "medium" | "high";

export interface MockSeller {
  id: string;
  business_name: string;
  slug: string;
  rating: number;
  review_count: number;
  total_sales: number;
  years_experience: number;
  badge_level: BadgeLevel;
  verification_status: VerificationStatus;
  approval_number: string;
  avatar_url: null;
  location_city: string;
  location_country: string;
  response_rate: number;
  response_time_hours: number;
}

export interface MockListing {
  id: string;
  title: Record<string, string>;
  description: Record<string, string>;
  price: number;
  price_negotiable: boolean;
  gender: Gender;
  age_weeks: number;
  color: string;
  microchip_number: string | null;
  passport_number: string | null;
  vaccinated: boolean;
  dewormed: boolean;
  vet_checked: boolean;
  pedigree: boolean;
  pedigree_organization: string | null;
  ready_date: string;
  location_city: string;
  location_country: string;
  status: "active";
  is_featured: boolean;
  view_count: number;
  inquiry_count: number;
  images: { url: string; is_primary: boolean }[];
  documents: { name: string; url: string; type: string }[];
  seller: MockSeller;
  breed: {
    name: Record<string, string>;
    slug: string;
    size: Size;
    energy_level: EnergyLevel;
    good_with_kids: boolean;
    good_with_other_pets: boolean;
    hypoallergenic: boolean;
  };
  species: { slug: string };
}

/* ─── Sellers ──────────────────────────────────────────────────────────────── */

const SELLERS: Record<string, MockSeller> = {
  s1: {
    id: "s1", business_name: "Goldenfarm Kennel", slug: "goldenfarm-kennel",
    rating: 4.9, review_count: 47, total_sales: 128, years_experience: 12,
    badge_level: "premium", verification_status: "verified",
    approval_number: "BE-2024-001", avatar_url: null,
    location_city: "Brussels", location_country: "BE",
    response_rate: 98, response_time_hours: 6,
  },
  s2: {
    id: "s2", business_name: "BullFrench Excellence", slug: "bullfrench-excellence",
    rating: 4.7, review_count: 29, total_sales: 64, years_experience: 8,
    badge_level: "pro", verification_status: "verified",
    approval_number: "BE-2024-002", avatar_url: null,
    location_city: "Antwerp", location_country: "BE",
    response_rate: 95, response_time_hours: 12,
  },
  s3: {
    id: "s3", business_name: "Maine Dream Cattery", slug: "maine-dream-cattery",
    rating: 4.8, review_count: 33, total_sales: 89, years_experience: 15,
    badge_level: "premium", verification_status: "verified",
    approval_number: "NL-2024-003", avatar_url: null,
    location_city: "Amsterdam", location_country: "NL",
    response_rate: 96, response_time_hours: 8,
  },
  s4: {
    id: "s4", business_name: "Equiline Stables", slug: "equiline-stables",
    rating: 4.6, review_count: 18, total_sales: 42, years_experience: 20,
    badge_level: "premium", verification_status: "verified",
    approval_number: "BE-2024-004", avatar_url: null,
    location_city: "Ghent", location_country: "BE",
    response_rate: 90, response_time_hours: 24,
  },
  s5: {
    id: "s5", business_name: "Poodle Paradise", slug: "poodle-paradise",
    rating: 4.9, review_count: 56, total_sales: 210, years_experience: 18,
    badge_level: "premium", verification_status: "verified",
    approval_number: "NL-2024-005", avatar_url: null,
    location_city: "Rotterdam", location_country: "NL",
    response_rate: 99, response_time_hours: 4,
  },
  s6: {
    id: "s6", business_name: "Luxembourg Pets", slug: "luxembourg-pets",
    rating: 4.5, review_count: 12, total_sales: 35, years_experience: 5,
    badge_level: "basic", verification_status: "verified",
    approval_number: "LU-2024-006", avatar_url: null,
    location_city: "Luxembourg City", location_country: "LU",
    response_rate: 88, response_time_hours: 18,
  },
};

/* ─── Listings ─────────────────────────────────────────────────────────────── */

export const MOCK_LISTINGS: MockListing[] = [
  {
    id: "1",
    title: { en: "Golden Retriever Puppy — KC Registered, Health Tested Parents", fr: "Chiot Golden Retriever — Parents testés santé", nl: "Golden Retriever Pup — Gezondheids­geteste ouders" },
    description: {
      en: "Beautiful Golden Retriever puppies from health-tested parents with FCI pedigree. Both parents have been hip and elbow scored, heart tested, and eye tested. All puppies are raised in a family home environment with children and other dogs.\n\nPuppies will leave at 8 weeks with:\n• First vaccination\n• Microchip\n• EU passport\n• FCI pedigree certificate\n• Health guarantee",
      fr: "Magnifiques chiots Golden Retriever issus de parents testés avec pedigree FCI. Tous les chiots quittent à 8 semaines avec vaccination, micropuce, passeport UE et certificat de santé.",
      nl: "Mooie Golden Retriever pups van gezondheids-geteste ouders met FCI stamboom. Alle pups vertrekken op 8 weken met vaccinatie, chip, EU-paspoort en gezondheidsgarantie.",
    },
    price: 145000, price_negotiable: false, gender: "male", age_weeks: 10,
    color: "Golden", microchip_number: "528140001234567", passport_number: "BE-2024-001234",
    vaccinated: true, dewormed: true, vet_checked: true, pedigree: true, pedigree_organization: "FCI / GRCC",
    ready_date: "2024-04-01", location_city: "Brussels", location_country: "BE",
    status: "active", is_featured: true, view_count: 234, inquiry_count: 12,
    images: [
      { url: "https://images.unsplash.com/photo-1601979031925-424e53b6caaa?w=900&h=700&fit=crop", is_primary: true },
      { url: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=500&h=400&fit=crop", is_primary: false },
      { url: "https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?w=500&h=400&fit=crop", is_primary: false },
      { url: "https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=500&h=400&fit=crop", is_primary: false },
      { url: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=500&h=400&fit=crop", is_primary: false },
    ],
    documents: [
      { name: "Health Certificate", url: "#", type: "pdf" },
      { name: "Vaccination Record", url: "#", type: "pdf" },
      { name: "FCI Pedigree", url: "#", type: "pdf" },
    ],
    seller: SELLERS.s1,
    breed: { name: { en: "Golden Retriever", fr: "Golden Retriever", nl: "Golden Retriever" }, slug: "golden-retriever", size: "large", energy_level: "high", good_with_kids: true, good_with_other_pets: true, hypoallergenic: false },
    species: { slug: "dogs" },
  },
  {
    id: "2",
    title: { en: "French Bulldog — Blue, Top Bloodline", fr: "Bouledogue Français Bleu — Top Lignée", nl: "Franse Bulldog Blauw — Top Bloedlijn" },
    description: {
      en: "Exceptional French Bulldog puppy with rare blue coat. Both parents are DNA health tested for BOAS, hereditary cataracts and patellar luxation. Raised with children in a family environment.\n\nIncludes:\n• Veterinary health check\n• Microchip + EU passport\n• First vaccination\n• DNA health test results\n• 2-year health guarantee",
      fr: "Exceptionnel chiot Bouledogue Français à robe bleue rare. Parents testés ADN. Élevé en famille avec enfants.\n\nInclus : contrôle vétérinaire, micropuce, passeport UE, vaccination, résultats tests ADN.",
      nl: "Uitzonderlijke Franse Bulldog pup met zeldzame blauwe vacht. DNA gezondheidsgetest. Opgegroeid met kinderen.\n\nInbegrepen: dierengeneeskundig onderzoek, chip, EU-paspoort, vaccinatie, DNA-testresultaten.",
    },
    price: 285000, price_negotiable: true, gender: "female", age_weeks: 12,
    color: "Blue", microchip_number: "528140002345678", passport_number: "BE-2024-002345",
    vaccinated: true, dewormed: true, vet_checked: true, pedigree: true, pedigree_organization: "FCI / SRSH",
    ready_date: "2024-04-15", location_city: "Antwerp", location_country: "BE",
    status: "active", is_featured: false, view_count: 189, inquiry_count: 23,
    images: [
      { url: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=900&h=700&fit=crop", is_primary: true },
      { url: "https://images.unsplash.com/photo-1601979031925-424e53b6caaa?w=500&h=400&fit=crop", is_primary: false },
      { url: "https://images.unsplash.com/photo-1591946614720-90a587da4a36?w=500&h=400&fit=crop", is_primary: false },
      { url: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=500&h=400&fit=crop", is_primary: false },
      { url: "https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=500&h=400&fit=crop", is_primary: false },
    ],
    documents: [
      { name: "Health Certificate", url: "#", type: "pdf" },
      { name: "DNA Test Results", url: "#", type: "pdf" },
      { name: "Vaccination Record", url: "#", type: "pdf" },
    ],
    seller: SELLERS.s2,
    breed: { name: { en: "French Bulldog", fr: "Bouledogue Français", nl: "Franse Bulldog" }, slug: "french-bulldog", size: "small", energy_level: "medium", good_with_kids: true, good_with_other_pets: true, hypoallergenic: false },
    species: { slug: "dogs" },
  },
  {
    id: "3",
    title: { en: "Maine Coon Kitten — Silver Tabby, FIFe Registered", fr: "Chaton Maine Coon Silver Tabby — Enregistré FIFe", nl: "Maine Coon Kitten Zilver Tabby — FIFe Geregistreerd" },
    description: {
      en: "Stunning Maine Coon silver tabby kitten from champion bloodlines. Our cattery is FIFe registered and both parents are health tested for HCM (hypertrophic cardiomyopathy) and SMA.\n\nKitten leaves with:\n• FIFe pedigree certificate\n• Microchip + EU pet passport\n• Vaccination booklet\n• HCM test certificate\n• Kitten starter package",
      fr: "Magnifique chaton Maine Coon silver tabby issu de lignées championnes. Notre chatterie est enregistrée FIFe.\n\nLe chaton part avec : pedigree FIFe, micropuce, passeport UE, carnet de vaccinations.",
      nl: "Prachtige Maine Coon zilver tabby kitten van kampioenslijnen. Onze cattery is FIFe geregistreerd.\n\nKitten vertrekt met: FIFe stamboom, chip, EU-paspoort, vaccinatieboekje.",
    },
    price: 95000, price_negotiable: false, gender: "male", age_weeks: 14,
    color: "Silver Tabby", microchip_number: "528140003456789", passport_number: "NL-2024-003456",
    vaccinated: true, dewormed: true, vet_checked: true, pedigree: true, pedigree_organization: "FIFe",
    ready_date: "2024-05-01", location_city: "Amsterdam", location_country: "NL",
    status: "active", is_featured: true, view_count: 312, inquiry_count: 18,
    images: [
      { url: "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=900&h=700&fit=crop", is_primary: true },
      { url: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=500&h=400&fit=crop", is_primary: false },
      { url: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=500&h=400&fit=crop", is_primary: false },
      { url: "https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=500&h=400&fit=crop", is_primary: false },
      { url: "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=500&h=350&fit=crop&crop=bottom", is_primary: false },
    ],
    documents: [
      { name: "HCM Certificate", url: "#", type: "pdf" },
      { name: "FIFe Pedigree", url: "#", type: "pdf" },
      { name: "Vaccination Booklet", url: "#", type: "pdf" },
    ],
    seller: SELLERS.s3,
    breed: { name: { en: "Maine Coon", fr: "Maine Coon", nl: "Maine Coon" }, slug: "maine-coon", size: "large", energy_level: "medium", good_with_kids: true, good_with_other_pets: true, hypoallergenic: false },
    species: { slug: "cats" },
  },
  {
    id: "4",
    title: { en: "Labrador Retriever — Yellow, KC Champions", fr: "Labrador Retriever Jaune — Champions KC", nl: "Labrador Retriever Geel — KC Kampioenen" },
    description: {
      en: "Beautiful yellow Labrador from multi-champion parents. Hip score: Excellent/Good. Elbow score: 0/0. All health tests completed. Perfect family dog temperament.\n\nPuppy includes:\n• KC registration\n• Hip & elbow score certificates\n• Microchip + EU passport\n• Vaccinations\n• Health guarantee to 2 years",
      fr: "Magnifique Labrador jaune de parents multi-champions. Score hanches: Excellent/Bon. Score coudes: 0/0.\n\nInclus: enregistrement KC, certificats, micropuce, passeport EU, vaccinations.",
      nl: "Mooie gele Labrador van multi-kampioenen ouders. Heup score: Excellent/Goed. Elleboog score: 0/0.\n\nInbegrepen: KC registratie, certificaten, chip, EU-paspoort, vaccinaties.",
    },
    price: 125000, price_negotiable: false, gender: "female", age_weeks: 9,
    color: "Yellow", microchip_number: "528140004567890", passport_number: "BE-2024-004567",
    vaccinated: true, dewormed: true, vet_checked: true, pedigree: true, pedigree_organization: "KC",
    ready_date: "2024-04-20", location_city: "Liège", location_country: "BE",
    status: "active", is_featured: false, view_count: 156, inquiry_count: 9,
    images: [
      { url: "https://images.unsplash.com/photo-1591946614720-90a587da4a36?w=900&h=700&fit=crop", is_primary: true },
      { url: "https://images.unsplash.com/photo-1601979031925-424e53b6caaa?w=500&h=400&fit=crop", is_primary: false },
      { url: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=500&h=400&fit=crop", is_primary: false },
      { url: "https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?w=500&h=400&fit=crop", is_primary: false },
      { url: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=500&h=400&fit=crop", is_primary: false },
    ],
    documents: [
      { name: "Hip & Elbow Scores", url: "#", type: "pdf" },
      { name: "KC Registration", url: "#", type: "pdf" },
      { name: "Vaccination Record", url: "#", type: "pdf" },
    ],
    seller: SELLERS.s1,
    breed: { name: { en: "Labrador Retriever", fr: "Labrador Retriever", nl: "Labrador Retriever" }, slug: "labrador-retriever", size: "large", energy_level: "high", good_with_kids: true, good_with_other_pets: true, hypoallergenic: false },
    species: { slug: "dogs" },
  },
  {
    id: "5",
    title: { en: "Siberian Husky Puppy — Blue Eyes, Show Quality", fr: "Chiot Husky Sibérien — Yeux Bleus, Qualité Show", nl: "Siberische Husky Pup — Blauwe Ogen, Show Kwaliteit" },
    description: {
      en: "Striking Siberian Husky puppy with piercing blue eyes. Show quality conformation, bred for both looks and temperament. Parents are multi-champion show dogs.\n\nIncludes:\n• SHCA registration\n• Full health screening results\n• Microchip + EU passport\n• First vaccination\n• Contract & health guarantee",
      fr: "Impressionnant chiot Husky sibérien aux yeux bleus perçants. Qualité show. Parents multi-champions.\n\nInclus : enregistrement SHCA, bilan santé complet, micropuce, passeport EU.",
      nl: "Opvallende Siberische Husky pup met doordringende blauwe ogen. Show kwaliteit. Ouders zijn multi-kampioenen.\n\nInbegrepen: SHCA registratie, volledig gezondheidsonderzoek, chip, EU-paspoort.",
    },
    price: 165000, price_negotiable: false, gender: "male", age_weeks: 11,
    color: "Black & White", microchip_number: "528140005678901", passport_number: "BE-2024-005678",
    vaccinated: true, dewormed: true, vet_checked: true, pedigree: true, pedigree_organization: "FCI / SHCA",
    ready_date: "2024-05-10", location_city: "Ghent", location_country: "BE",
    status: "active", is_featured: true, view_count: 428, inquiry_count: 31,
    images: [
      { url: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=900&h=700&fit=crop", is_primary: true },
      { url: "https://images.unsplash.com/photo-1601979031925-424e53b6caaa?w=500&h=400&fit=crop", is_primary: false },
      { url: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=500&h=400&fit=crop", is_primary: false },
      { url: "https://images.unsplash.com/photo-1591946614720-90a587da4a36?w=500&h=400&fit=crop", is_primary: false },
      { url: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=500&h=400&fit=crop", is_primary: false },
    ],
    documents: [
      { name: "Health Screening", url: "#", type: "pdf" },
      { name: "SHCA Pedigree", url: "#", type: "pdf" },
      { name: "Eye Certification", url: "#", type: "pdf" },
    ],
    seller: SELLERS.s5,
    breed: { name: { en: "Siberian Husky", fr: "Husky Sibérien", nl: "Siberische Husky" }, slug: "siberian-husky", size: "medium", energy_level: "high", good_with_kids: true, good_with_other_pets: true, hypoallergenic: false },
    species: { slug: "dogs" },
  },
  {
    id: "6",
    title: { en: "KWPN Foal — Elite Sport Bloodline, 3-Star Dam", fr: "Poulain KWPN — Lignée Sport Élite, Jument 3 Étoiles", nl: "KWPN Veulen — Elite Sport Bloedlijn, 3-Sterren Merrie" },
    description: {
      en: "Exceptional KWPN foal from elite sport bloodlines. Dam is a 3-star KWPN approved mare with international competition record. Sire is KWPN approved with Z-level progeny.\n\nIncludes:\n• KWPN birth registration\n• Vet-inspected at birth\n• DNA profile\n• Microchip\n• Performance guarantee lineage documentation",
      fr: "Exceptionnel poulain KWPN de lignées sport d'élite. Mère jument KWPN approuvée 3 étoiles avec palmarès international.\n\nInclus: enregistrement KWPN, inspection vétérinaire, profil ADN, micropuce.",
      nl: "Uitzonderlijk KWPN veulen van elite sport bloedlijnen. Moeder is een 3-sterren KWPN goedgekeurde merrie.\n\nInbegrepen: KWPN geboorteregistratie, dierenarts inspectie, DNA profiel, chip.",
    },
    price: 850000, price_negotiable: true, gender: "male", age_weeks: 26,
    color: "Bay", microchip_number: "528140006789012", passport_number: "BE-2024-006789",
    vaccinated: false, dewormed: true, vet_checked: true, pedigree: true, pedigree_organization: "KWPN",
    ready_date: "2024-09-01", location_city: "Ghent", location_country: "BE",
    status: "active", is_featured: false, view_count: 89, inquiry_count: 7,
    images: [
      { url: "https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=900&h=700&fit=crop", is_primary: true },
      { url: "https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=500&h=400&fit=crop&crop=top", is_primary: false },
      { url: "https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=500&h=400&fit=crop&crop=bottom", is_primary: false },
      { url: "https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=500&h=400&fit=crop&crop=left", is_primary: false },
      { url: "https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=500&h=400&fit=crop&crop=right", is_primary: false },
    ],
    documents: [
      { name: "KWPN Registration", url: "#", type: "pdf" },
      { name: "DNA Profile", url: "#", type: "pdf" },
      { name: "Veterinary Report", url: "#", type: "pdf" },
    ],
    seller: SELLERS.s4,
    breed: { name: { en: "KWPN", fr: "KWPN", nl: "KWPN" }, slug: "kwpn", size: "giant", energy_level: "high", good_with_kids: false, good_with_other_pets: true, hypoallergenic: false },
    species: { slug: "horses" },
  },
  {
    id: "7",
    title: { en: "Pembroke Welsh Corgi — Tri-Color, Health Tested", fr: "Corgi Gallois de Pembroke — Tricolore, Testé Santé", nl: "Pembroke Welsh Corgi — Driekleur, Gezondheids­getest" },
    description: {
      en: "Adorable Pembroke Welsh Corgi from health-tested parents. Hip scores within breed average. Eyes and DM tested clear. Super sociable temperament raised with children.\n\nPuppy pack includes:\n• SPKC pedigree\n• Hip score certificates\n• DM / PRA eye test clear\n• Microchip + EU passport\n• Vaccinations + deworming",
      fr: "Adorable Corgi Gallois de Pembroke tricolore de parents testés santé. Scores hanches dans la moyenne de la race.\n\nInclus: pedigree SPKC, certificats, micropuce, passeport EU, vaccinations.",
      nl: "Schattige Pembroke Welsh Corgi van gezondheids-geteste ouders. Heupscores binnen rasgemiddelde.\n\nInbegrepen: SPKC stamboom, certificaten, chip, EU-paspoort, vaccinaties.",
    },
    price: 195000, price_negotiable: false, gender: "female", age_weeks: 10,
    color: "Tri-Color", microchip_number: "528140007890123", passport_number: "BE-2024-007890",
    vaccinated: true, dewormed: true, vet_checked: true, pedigree: true, pedigree_organization: "FCI / SPKC",
    ready_date: "2024-04-28", location_city: "Bruges", location_country: "BE",
    status: "active", is_featured: false, view_count: 203, inquiry_count: 15,
    images: [
      { url: "https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=900&h=700&fit=crop", is_primary: true },
      { url: "https://images.unsplash.com/photo-1601979031925-424e53b6caaa?w=500&h=400&fit=crop", is_primary: false },
      { url: "https://images.unsplash.com/photo-1591946614720-90a587da4a36?w=500&h=400&fit=crop", is_primary: false },
      { url: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=500&h=400&fit=crop", is_primary: false },
      { url: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=500&h=400&fit=crop", is_primary: false },
    ],
    documents: [
      { name: "Hip Score Certificate", url: "#", type: "pdf" },
      { name: "DM / PRA Eye Test", url: "#", type: "pdf" },
      { name: "SPKC Pedigree", url: "#", type: "pdf" },
    ],
    seller: SELLERS.s1,
    breed: { name: { en: "Pembroke Welsh Corgi", fr: "Corgi Gallois", nl: "Welsh Corgi" }, slug: "pembroke-welsh-corgi", size: "small", energy_level: "medium", good_with_kids: true, good_with_other_pets: true, hypoallergenic: false },
    species: { slug: "dogs" },
  },
  {
    id: "8",
    title: { en: "Bengal Kitten — Brown Spotted Tabby, TICA", fr: "Chaton Bengale Brun Tacheté, TICA", nl: "Bengal Kitten Bruin Gevlekt, TICA" },
    description: {
      en: "Stunning Bengal kitten with vivid rosette markings. TICA registered cattery with champion bloodlines. Raised underfoot with daily handling for exceptional socialization.\n\nIncludes:\n• TICA pedigree certificate\n• HCM & PK-Def DNA clear\n• Microchip + EU passport\n• Two vaccinations\n• Kitten starter kit",
      fr: "Magnifique chaton Bengale avec marquages rosette vifs. Chatterie TICA avec lignées championnes.\n\nInclus: pedigree TICA, tests ADN, micropuce, passeport EU, deux vaccinations.",
      nl: "Verbluffende Bengal kitten met levendige rosette markering. TICA geregistreerd fokkerij met kampioenslijnen.\n\nInbegrepen: TICA stamboom, DNA testen, chip, EU-paspoort, twee vaccinaties.",
    },
    price: 180000, price_negotiable: false, gender: "male", age_weeks: 13,
    color: "Brown Spotted Tabby", microchip_number: "528140008901234", passport_number: "NL-2024-008901",
    vaccinated: true, dewormed: true, vet_checked: true, pedigree: true, pedigree_organization: "TICA",
    ready_date: "2024-05-15", location_city: "Rotterdam", location_country: "NL",
    status: "active", is_featured: false, view_count: 267, inquiry_count: 19,
    images: [
      { url: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=900&h=700&fit=crop", is_primary: true },
      { url: "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=500&h=400&fit=crop", is_primary: false },
      { url: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=500&h=400&fit=crop", is_primary: false },
      { url: "https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=500&h=400&fit=crop", is_primary: false },
      { url: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=500&h=350&fit=crop&crop=entropy", is_primary: false },
    ],
    documents: [
      { name: "TICA Pedigree", url: "#", type: "pdf" },
      { name: "HCM & PK-Def DNA", url: "#", type: "pdf" },
      { name: "Vaccination Record", url: "#", type: "pdf" },
    ],
    seller: SELLERS.s3,
    breed: { name: { en: "Bengal", fr: "Bengale", nl: "Bengaal" }, slug: "bengal", size: "medium", energy_level: "high", good_with_kids: true, good_with_other_pets: true, hypoallergenic: false },
    species: { slug: "cats" },
  },
  {
    id: "9",
    title: { en: "KWPN Foal — Elite Bloodline, Olympic Sire", fr: "Poulain KWPN — Lignée Élite, Père Olympique", nl: "KWPN Veulen — Elite Bloedlijn, Olympische Vader" },
    description: {
      en: "Premium KWPN foal by Olympic-level approved sire. Dam competed at Z-level dressage. Excellent conformation and movement. Ideal for future sport career.\n\nDocumentation:\n• KWPN studbook registration\n• Vet inspection at foaling\n• DNA parentage verification\n• Microchip implanted",
      fr: "Poulain KWPN premium par père approuvé de niveau olympique. Mère a concouru au niveau Z dressage.\n\nDocumentation: registre KWPN, inspection vet, vérification ADN, micropuce.",
      nl: "Premium KWPN veulen van olympisch goedgekeurde hengst. Merrie concurreerde op Z-niveau dressuur.\n\nDocumentatie: KWPN stamboek, dierarts inspectie, DNA verificatie, chip.",
    },
    price: 850000, price_negotiable: true, gender: "male", age_weeks: 26,
    color: "Dark Bay", microchip_number: "528140009012345", passport_number: "BE-2024-009012",
    vaccinated: false, dewormed: true, vet_checked: true, pedigree: true, pedigree_organization: "KWPN",
    ready_date: "2024-09-15", location_city: "Ghent", location_country: "BE",
    status: "active", is_featured: false, view_count: 72, inquiry_count: 5,
    images: [
      { url: "https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=900&h=700&fit=crop", is_primary: true },
      { url: "https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=500&h=400&fit=crop&crop=faces", is_primary: false },
      { url: "https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=500&h=400&fit=crop&crop=focalpoint", is_primary: false },
      { url: "https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=500&h=400&fit=crop&crop=edges", is_primary: false },
      { url: "https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=500&h=350&fit=crop", is_primary: false },
    ],
    documents: [
      { name: "KWPN Registration", url: "#", type: "pdf" },
      { name: "DNA Parentage", url: "#", type: "pdf" },
    ],
    seller: SELLERS.s4,
    breed: { name: { en: "KWPN", fr: "KWPN", nl: "KWPN" }, slug: "kwpn", size: "giant", energy_level: "high", good_with_kids: false, good_with_other_pets: true, hypoallergenic: false },
    species: { slug: "horses" },
  },
  {
    id: "10",
    title: { en: "Bengal Kitten — Silver Spotted, TICA Champion Lines", fr: "Chaton Bengale Argenté, TICA Lignes Champion", nl: "Bengal Kitten Zilver Gevlekt, TICA Kampioenslijnen" },
    description: {
      en: "Rare silver spotted Bengal kitten with stunning contrast. Parents are TICA grand champions. The silver gene produces an ethereal, glacier-like coat with dark rosettes.\n\nIncludes:\n• TICA grand champion pedigree\n• HCM DNA clear documentation\n• Microchip + EU passport\n• Two FVRCP vaccinations\n• Starter nutrition guide",
      fr: "Rare chaton Bengale argenté tacheté avec un contraste saisissant. Parents grands champions TICA.\n\nInclus: pedigree grand champion TICA, ADN HCM, micropuce, passeport EU, deux vaccinations.",
      nl: "Zeldzame zilver gevlekte Bengal kitten met verbluffend contrast. Ouders zijn TICA grand kampioenen.\n\nInbegrepen: TICA grand kampioen stamboom, HCM DNA, chip, EU-paspoort, twee vaccinaties.",
    },
    price: 180000, price_negotiable: false, gender: "male", age_weeks: 13,
    color: "Silver Spotted", microchip_number: "528140010123456", passport_number: "NL-2024-010123",
    vaccinated: true, dewormed: true, vet_checked: true, pedigree: true, pedigree_organization: "TICA",
    ready_date: "2024-05-20", location_city: "Rotterdam", location_country: "NL",
    status: "active", is_featured: false, view_count: 198, inquiry_count: 14,
    images: [
      { url: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=900&h=700&fit=crop", is_primary: true },
      { url: "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=500&h=400&fit=crop", is_primary: false },
      { url: "https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=500&h=400&fit=crop", is_primary: false },
      { url: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=500&h=400&fit=crop", is_primary: false },
      { url: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=500&h=350&fit=crop&crop=entropy", is_primary: false },
    ],
    documents: [
      { name: "TICA Pedigree", url: "#", type: "pdf" },
      { name: "HCM DNA Certificate", url: "#", type: "pdf" },
    ],
    seller: SELLERS.s3,
    breed: { name: { en: "Bengal", fr: "Bengale", nl: "Bengaal" }, slug: "bengal", size: "medium", energy_level: "high", good_with_kids: true, good_with_other_pets: true, hypoallergenic: false },
    species: { slug: "cats" },
  },
  {
    id: "11",
    title: { en: "Miniature Poodle — Apricot, Hypoallergenic, FCI", fr: "Caniche Nain Abricot, Hypoallergénique, FCI", nl: "Dwergpoedel Abrikoos, Hypoallergeen, FCI" },
    description: {
      en: "Gorgeous apricot miniature poodle from our award-winning kennel. We have been breeding poodles for 18 years and are the top-rated poodle breeder in the Netherlands.\n\nIncludes:\n• FCI pedigree certificate\n• PRA-prcd DNA clear\n• Microchip + EU passport\n• Vaccinations + deworming\n• Puppy contract and health guarantee",
      fr: "Magnifique caniche nain abricot de notre chenil primé. Nous élevons des caniches depuis 18 ans, meilleur éleveur des Pays-Bas.\n\nInclus: pedigree FCI, ADN PRA-prcd, micropuce, passeport EU, vaccinations.",
      nl: "Prachtige abrikoos dwergpoedel van ons bekroonde kennel. 18 jaar poedelfokkeri, de beste fokker van Nederland.\n\nInbegrepen: FCI stamboom, PRA-prcd DNA, chip, EU-paspoort, vaccinaties.",
    },
    price: 148000, price_negotiable: false, gender: "female", age_weeks: 9,
    color: "Apricot", microchip_number: "528140011234567", passport_number: "NL-2024-011234",
    vaccinated: true, dewormed: true, vet_checked: true, pedigree: true, pedigree_organization: "FCI / Raad van Beheer",
    ready_date: "2024-04-25", location_city: "Amsterdam", location_country: "NL",
    status: "active", is_featured: false, view_count: 341, inquiry_count: 27,
    images: [
      { url: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=900&h=700&fit=crop", is_primary: true },
      { url: "https://images.unsplash.com/photo-1601979031925-424e53b6caaa?w=500&h=400&fit=crop", is_primary: false },
      { url: "https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=500&h=400&fit=crop", is_primary: false },
      { url: "https://images.unsplash.com/photo-1591946614720-90a587da4a36?w=500&h=400&fit=crop", is_primary: false },
      { url: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=500&h=350&fit=crop&crop=entropy", is_primary: false },
    ],
    documents: [
      { name: "FCI Pedigree", url: "#", type: "pdf" },
      { name: "PRA-prcd DNA Test", url: "#", type: "pdf" },
      { name: "Vaccination Record", url: "#", type: "pdf" },
    ],
    seller: SELLERS.s5,
    breed: { name: { en: "Miniature Poodle", fr: "Caniche Nain", nl: "Dwergpoedel" }, slug: "miniature-poodle", size: "small", energy_level: "medium", good_with_kids: true, good_with_other_pets: true, hypoallergenic: true },
    species: { slug: "dogs" },
  },
  {
    id: "12",
    title: { en: "British Shorthair — Blue, GCCF Registered", fr: "British Shorthair Bleu, Enregistré GCCF", nl: "British Shorthair Blauw, GCCF Geregistreerd" },
    description: {
      en: "Classic blue British Shorthair kitten from GCCF registered cattery. The plush blue coat and copper eyes are textbook quality. Both parents health tested for PKD (polycystic kidney disease).\n\nKitten includes:\n• GCCF pedigree certificate\n• PKD DNA clear\n• Microchip + EU passport\n• Two FVRCP vaccinations\n• Neutering agreement",
      fr: "Chaton British Shorthair bleu classique de chatterie enregistrée GCCF. Pelage bleu peluche et yeux cuivrés de qualité.\n\nInclus: pedigree GCCF, PKD ADN, micropuce, passeport EU, deux vaccinations.",
      nl: "Klassieke blauwe British Shorthair kitten van GCCF geregistreerd cattery. Pluche blauwe vacht en koperkleurige ogen.\n\nInbegrepen: GCCF stamboom, PKD DNA, chip, EU-paspoort, twee vaccinaties.",
    },
    price: 110000, price_negotiable: false, gender: "female", age_weeks: 12,
    color: "Blue", microchip_number: "528140012345678", passport_number: "BE-2024-012345",
    vaccinated: true, dewormed: true, vet_checked: true, pedigree: true, pedigree_organization: "GCCF",
    ready_date: "2024-05-05", location_city: "Brussels", location_country: "BE",
    status: "active", is_featured: false, view_count: 145, inquiry_count: 11,
    images: [
      { url: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=900&h=700&fit=crop", is_primary: true },
      { url: "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=500&h=400&fit=crop", is_primary: false },
      { url: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=500&h=400&fit=crop", is_primary: false },
      { url: "https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=500&h=400&fit=crop", is_primary: false },
      { url: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=500&h=350&fit=crop&crop=entropy", is_primary: false },
    ],
    documents: [
      { name: "GCCF Pedigree", url: "#", type: "pdf" },
      { name: "PKD DNA Certificate", url: "#", type: "pdf" },
      { name: "Vaccination Record", url: "#", type: "pdf" },
    ],
    seller: SELLERS.s2,
    breed: { name: { en: "British Shorthair", fr: "British Shorthair", nl: "British Shorthair" }, slug: "british-shorthair", size: "medium", energy_level: "low", good_with_kids: true, good_with_other_pets: true, hypoallergenic: false },
    species: { slug: "cats" },
  },
];

export function getListingById(id: string): MockListing {
  return MOCK_LISTINGS.find((l) => l.id === id) ?? MOCK_LISTINGS[0];
}
