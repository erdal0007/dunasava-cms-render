import { getDb } from "../api/queries/connection";
import {
  sections,
  products,
  sectors,
  translations,
  statistics,
} from "./schema";

const db = getDb();

async function tableHasRows(table: any): Promise<boolean> {
  const rows = await db.select().from(table).limit(1);
  return rows.length > 0;
}

export async function runSeed() {
  console.log("Seeding database...");

  // Seed translations
  const translationData = [
    { key: "nav.home", sr: "Početna", tr: "Ana Sayfa", en: "Home", category: "nav" },
    { key: "nav.about", sr: "O Nama", tr: "Hakkımızda", en: "About", category: "nav" },
    { key: "nav.products", sr: "Proizvodi", tr: "Ürünler", en: "Products", category: "nav" },
    { key: "nav.sectors", sr: "Sektori", tr: "Sektörler", en: "Sectors", category: "nav" },
    { key: "nav.production", sr: "Proizvodnja", tr: "Üretim", en: "Production", category: "nav" },
    { key: "nav.contact", sr: "Kontakt", tr: "İletişim", en: "Contact", category: "nav" },
    { key: "hero.line1", sr: "Snaga za", tr: "Yapılar için", en: "Strength for", category: "hero" },
    { key: "hero.line2", sr: "Konstrukcije", tr: "Güç", en: "Constructions", category: "hero" },
    { key: "hero.subtitle", sr: "Pouzdanje za Budućnost", tr: "Geleceğe Güven", en: "Trust for the Future", category: "hero" },
    { key: "hero.scroll", sr: "Skrolujte", tr: "Aşağı Kaydır", en: "Scroll", category: "hero" },
    { key: "about.eyebrow", sr: "O NAMA", tr: "HAKKIMIZDA", en: "ABOUT US", category: "about" },
    { key: "about.title", sr: "Inženjerska Rešenja za Svaki Teren", tr: "Her Arazi için Mühendislik Çözümleri", en: "Engineering Solutions for Every Terrain", category: "about" },
    { key: "about.desc", sr: "DunaSava je jedan od vodećih proizvođača geomembrana i geosintetičkih proizvoda. Kompanija izvozi u više od 30 zemalja.", tr: "DunaSava, geomembran ve geosentetik ürünlerin önde gelen üreticilerinden biridir. Şirket 30'dan fazla ülkeye ihraç etmektedir.", en: "DunaSava is one of the leading manufacturers of geomembranes and geosynthetic products. The company exports to more than 30 countries.", category: "about" },
    { key: "about.cta", sr: "Saznajte Više", tr: "Daha Fazla", en: "Learn More", category: "about" },
    { key: "mission.eyebrow", sr: "NAŠA MISIJA", tr: "MİSYONUMUZ", en: "OUR MISSION", category: "mission" },
    { key: "mission.title", sr: "Kvalitet i Pouzdanost u Svakom Projektu", tr: "Her Projede Kalite ve Güvenilirlik", en: "Quality and Reliability in Every Project", category: "mission" },
    { key: "mission.desc", sr: "Naša misija je pružanje visokokvalitetnih geosintetičkih rešenja za svaki projekat.", tr: "Misyonumuz, her proje için yüksek kaliteli geosentetik çözümler sunmaktır.", en: "Our mission is to provide high-quality geosynthetic solutions for every project.", category: "mission" },
    { key: "products.eyebrow", sr: "NAŠI PROIZVODI", tr: "ÜRÜNLERİMİZ", en: "OUR PRODUCTS", category: "products" },
    { key: "products.title", sr: "Geosintetička Rešenja Svetske Klase", tr: "Dünya Standartlarında Geosentetik Çözümler", en: "World-Class Geosynthetic Solutions", category: "products" },
    { key: "sectors.eyebrow", sr: "NAŠI SEKTORI", tr: "SEKTÖRLERİMİZ", en: "OUR SECTORS", category: "sectors" },
    { key: "sectors.title", sr: "Rešenja za Svaku Industriju", tr: "Her Endüstri için Çözümler", en: "Solutions for Every Industry", category: "sectors" },
    { key: "production.eyebrow", sr: "PROIZVODNJA I TEHNOLOGIJA", tr: "ÜRETİM VE TEKNOLOJİ", en: "PRODUCTION & TECHNOLOGY", category: "production" },
    { key: "production.title", sr: "Moderna Postrojenja, Najnovija Tehnologija", tr: "Modern Tesisler, En Yeni Teknoloji", en: "Modern Facilities, Latest Technology", category: "production" },
    { key: "production.desc", sr: "DunaSava raspolaže modernim proizvodnim pogonima sa najnovijom tehnologijom.", tr: "DunaSava, en yeni teknolojiye sahip modern üretim tesislerine sahiptir.", en: "DunaSava has modern production facilities with the latest technology.", category: "production" },
    { key: "contact.eyebrow", sr: "KONTAKT", tr: "İLETİŞİM", en: "CONTACT", category: "contact" },
    { key: "contact.title", sr: "Stupite u Kontakt", tr: "Bize Ulaşın", en: "Get In Touch", category: "contact" },
    { key: "contact.desc", sr: "Tu smo da vam pomognemo sa svim vašim geosintetičkim potrebama.", tr: "Tüm geosentetik ihtiyaçlarınızda size yardımcı olmak için buradayız.", en: "We are here to help with all your geosynthetic needs.", category: "contact" },
    { key: "contact.send", sr: "POŠALJITE", tr: "GÖNDER", en: "SEND", category: "contact" },
    { key: "contact.name", sr: "Ime", tr: "Ad", en: "Name", category: "contact" },
    { key: "contact.email", sr: "Email", tr: "E-posta", en: "Email", category: "contact" },
    { key: "contact.message", sr: "Poruka", tr: "Mesaj", en: "Message", category: "contact" },
    { key: "footer.global", sr: "GLOBALNA PRISUTNOST", tr: "KÜRESEL VARLIK", en: "GLOBAL PRESENCE", category: "footer" },
    { key: "footer.tagline", sr: "Snaga za Konstrukcije", tr: "Yapılar için Güç", en: "Strength for Constructions", category: "footer" },
    { key: "stat.years", sr: "Godina Iskustva", tr: "Yıllık Deneyim", en: "Years Experience", category: "statistics" },
    { key: "stat.countries", sr: "Zemalja", tr: "Ülke", en: "Countries", category: "statistics" },
    { key: "stat.facility", sr: "Proizvodni Pogon", tr: "Üretim Tesisi", en: "Production Facility", category: "statistics" },
    { key: "stat.products", sr: "Proizvoda", tr: "Ürün", en: "Products", category: "statistics" },
  ];

  if (!(await tableHasRows(translations))) {
    for (const t of translationData) {
      await db.insert(translations).values(t);
    }
    console.log(`Inserted ${translationData.length} translations`);
  } else {
    console.log("Skipped translations (already seeded)");
  }

  // Seed statistics
  const statData = [
    { value: "50", suffix: "+", labelSr: "Godina Iskustva", labelTr: "Yıllık Deneyim", labelEn: "Years Experience", sortOrder: 1 },
    { value: "30", suffix: "+", labelSr: "Zemalja", labelTr: "Ülke", labelEn: "Countries", sortOrder: 2 },
    { value: "4000", suffix: "m²", labelSr: "Proizvodni Pogon", labelTr: "Üretim Tesisi", labelEn: "Production Facility", sortOrder: 3 },
    { value: "6", suffix: "", labelSr: "Proizvodnih Linija", labelTr: "Üretim Hattı", labelEn: "Production Lines", sortOrder: 4 },
  ];
  if (!(await tableHasRows(statistics))) {
    for (const s of statData) {
      await db.insert(statistics).values(s);
    }
    console.log(`Inserted ${statData.length} statistics`);
  } else {
    console.log("Skipped statistics (already seeded)");
  }

  // Seed sections
  const sectionData = [
    {
      slug: "hero", titleSr: "Snaga za Konstrukcije", titleTr: "Yapılar için Güç", titleEn: "Strength for Constructions",
      eyebrowSr: "", eyebrowTr: "", eyebrowEn: "",
      contentSr: "Pouzdanje za Budućnost", contentTr: "Geleceğe Güven", contentEn: "Trust for the Future",
      imageUrl: "/assets/images/hero-reservoir-drone.jpg", sortOrder: 1, isActive: true, sectionType: "hero" as const,
    },
    {
      slug: "about", titleSr: "Inženjerska Rešenja za Svaki Teren", titleTr: "Her Arazi için Mühendislik Çözümleri", titleEn: "Engineering Solutions for Every Terrain",
      eyebrowSr: "O NAMA", eyebrowTr: "HAKKIMIZDA", eyebrowEn: "ABOUT US",
      contentSr: "DunaSava je jedan od vodećih proizvođača geomembrana i geosintetičkih proizvoda.", contentTr: "DunaSava, geomembran ve geosentetik ürünlerin önde gelen üreticilerinden biridir.", contentEn: "DunaSava is one of the leading manufacturers of geomembranes and geosynthetic products.",
      imageUrl: "/assets/images/about-mining-installation.jpg", sortOrder: 2, isActive: true, sectionType: "about" as const,
    },
    {
      slug: "mission", titleSr: "Kvalitet i Pouzdanost u Svakom Projektu", titleTr: "Her Projede Kalite ve Güvenilirlik", titleEn: "Quality and Reliability in Every Project",
      eyebrowSr: "NAŠA MISIJA", eyebrowTr: "MİSYONUMUZ", eyebrowEn: "OUR MISSION",
      contentSr: "Naša misija je pružanje visokokvalitetnih geosintetičkih rešenja.", contentTr: "Misyonumuz, her proje için yüksek kaliteli geosentetik çözümler sunmaktır.", contentEn: "Our mission is to provide high-quality geosynthetic solutions for every project.",
      imageUrl: "", sortOrder: 3, isActive: true, sectionType: "mission" as const,
    },
  ];
  if (!(await tableHasRows(sections))) {
    for (const s of sectionData) {
      await db.insert(sections).values(s);
    }
    console.log(`Inserted ${sectionData.length} sections`);
  } else {
    console.log("Skipped sections (already seeded)");
  }

  // Seed products
  const productData = [
    { slug: "hdpe", titleSr: "HDPE Geomembrana", titleTr: "HDPE Geomembran", titleEn: "HDPE Geomembrane", descriptionSr: "Geomembrana visoke gustine za nepropusnu zaštitu.", descriptionTr: "Sızıntı koruması için yüksek yoğunluklu polietilen geomembran.", descriptionEn: "High-density polyethylene geomembrane for impermeable protection.", imageUrl: "/assets/images/product-hdpe-geomembrane.jpg", sortOrder: 1, isActive: true },
    { slug: "pvc", titleSr: "PVC Geomembrana", titleTr: "PVC Geomembran", titleEn: "PVC Geomembrane", descriptionSr: "Fleksibilna PVC membrana za hidroizolaciju.", descriptionTr: "Su yalıtımı için esnek PVC membran.", descriptionEn: "Flexible PVC membrane for waterproofing.", imageUrl: "/assets/images/product-pvc-geomembrane.jpg", sortOrder: 2, isActive: true },
    { slug: "waterstop", titleSr: "PVC Water Stop", titleTr: "PVC Su Tutucu Bant", titleEn: "PVC Water Stop", descriptionSr: "PVC trake za sprečavanje prodiranja vode.", descriptionTr: "Su sızıntısını önlemek için PVC bantlar.", descriptionEn: "PVC tapes to prevent water penetration.", imageUrl: "/assets/images/product-waterstop.jpg", sortOrder: 3, isActive: true },
    { slug: "pvc-tgrip", titleSr: "PVC T-Grip Geomembrana", titleTr: "PVC T-Grip Geomembran", titleEn: "PVC T-Grip Geomembrane", descriptionSr: "PVC membrana sa T-oblikovanim trnovima.", descriptionTr: "T şekilli çıkıntılara sahip PVC membran.", descriptionEn: "PVC membrane with T-shaped spikes.", imageUrl: "/assets/images/product-pvc-tgrip.jpg", sortOrder: 4, isActive: true },
    { slug: "hdpe-tgrip", titleSr: "HDPE T-Grip Geomembrana", titleTr: "HDPE T-Grip Geomembran", titleEn: "HDPE T-Grip Geomembrane", descriptionSr: "HDPE membrana sa T-oblikovanim sidrima.", descriptionTr: "T şekilli ankrajlara sahip HDPE membran.", descriptionEn: "HDPE membrane with T-shaped anchors.", imageUrl: "/assets/images/product-hdpe-tgrip.jpg", sortOrder: 5, isActive: true },
    { slug: "geotextile", titleSr: "GTX Geotekstil", titleTr: "GTX Geotekstil", titleEn: "GTX Geotextile", descriptionSr: "Propusni tekstilni proizvod za filtraciju.", descriptionTr: "Filtrasyon için geçirgen tekstil ürünü.", descriptionEn: "Permeable textile product for filtration.", imageUrl: "/assets/images/product-geotextile.jpg", sortOrder: 6, isActive: true },
  ];
  if (!(await tableHasRows(products))) {
    for (const p of productData) {
      await db.insert(products).values(p);
    }
    console.log(`Inserted ${productData.length} products`);
  } else {
    console.log("Skipped products (already seeded)");
  }

  // Seed sectors
  const sectorData = [
    { slug: "agriculture", number: "01", titleSr: "Poljoprivredna Navodnjavanja", titleTr: "Tarımsal Sulama", titleEn: "Agricultural Irrigation", descriptionSr: "Geomembrane za navodnjavanje i jezerca.", descriptionTr: "Sulama ve göletler için geomembran.", descriptionEn: "Geomembranes for irrigation ponds.", imageUrl: "/assets/images/sector-agriculture.jpg", imageUrl2: "", sortOrder: 1, isActive: true },
    { slug: "mining", number: "02", titleSr: "Rudnički Tereni", titleTr: "Madencilik", titleEn: "Mining Sites", descriptionSr: "Stabilizacija tla i kontrola erozije.", descriptionTr: "Zemin stabilizasyonu ve erozyon kontrolü.", descriptionEn: "Soil stabilization and erosion control.", imageUrl: "/assets/images/sector-mining.jpg", imageUrl2: "", sortOrder: 2, isActive: true },
    { slug: "waste", number: "03", titleSr: "Deponije Otpada", titleTr: "Atık Depolama", titleEn: "Waste Landfills", descriptionSr: "Sprečavanje curenja i zaštita voda.", descriptionTr: "Sızıntı önleme ve su koruması.", descriptionEn: "Leachate containment and groundwater protection.", imageUrl: "/assets/images/sector-waste.jpg", imageUrl2: "", sortOrder: 3, isActive: true },
    { slug: "environment", number: "04", titleSr: "Zaštita Životne Sredine", titleTr: "Çevre Koruma", titleEn: "Environmental Protection", descriptionSr: "Kontrola erozije i restauracija staništa.", descriptionTr: "Erozyon kontrolü ve habitat restorasyonu.", descriptionEn: "Erosion control and habitat restoration.", imageUrl: "/assets/images/sector-environment.jpg", imageUrl2: "", sortOrder: 4, isActive: true },
    { slug: "construction", number: "05", titleSr: "Građevinski Projekti", titleTr: "İnşaat Projeleri", titleEn: "Construction Projects", descriptionSr: "Hidroizolacija i zaštita temelja.", descriptionTr: "Su yalıtımı ve temel koruma.", descriptionEn: "Waterproofing and foundation protection.", imageUrl: "/assets/images/sector-construction.jpg", imageUrl2: "", sortOrder: 5, isActive: true },
  ];
  if (!(await tableHasRows(sectors))) {
    for (const s of sectorData) {
      await db.insert(sectors).values(s);
    }
    console.log(`Inserted ${sectorData.length} sectors`);
  } else {
    console.log("Skipped sectors (already seeded)");
  }

  console.log("Seed complete!");
}

const invokedDirectly =
  process.argv[1]?.includes("/db/seed.") ||
  process.argv[1]?.includes("\\db\\seed.");

if (invokedDirectly) {
  runSeed().catch((err) => {
    console.error(err);
    process.exitCode = 1;
  });
}
