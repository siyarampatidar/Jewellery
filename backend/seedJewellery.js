import 'dotenv/config';
import dns from 'dns';
dns.setDefaultResultOrder("ipv4first");
dns.setServers(["8.8.8.8", "1.1.1.1"]);
import mongoose from 'mongoose';
import Category from './models/Category.js';
import Product from './models/Product.js';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("❌ Error: DATABASE_URL is not defined in backend/.env file.");
  process.exit(1);
}

const CATEGORIES_DATA = [
  {
    categoryName: "Ring",
    categoryImage: {
      url: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=600&q=80",
      public_id: "cjp_seed_cat_ring"
    },
    subcategories: [
      { subcategoryName: "Diamond Ring" },
      { subcategoryName: "Gold Ring" },
      { subcategoryName: "Platinum Ring" },
      { subcategoryName: "Gemstone Ring" }
    ]
  },
  {
    categoryName: "Rakhi",
    categoryImage: {
      url: "https://images.unsplash.com/photo-1658238644917-25e79ee898ec?auto=format&fit=crop&w=600&q=80",
      public_id: "cjp_seed_cat_rakhi"
    },
    subcategories: [
      { subcategoryName: "Designer Rakhi" },
      { subcategoryName: "Silver Rakhi" },
      { subcategoryName: "Gold Rakhi" },
      { subcategoryName: "Rudraksha Rakhi" }
    ]
  },
  {
    categoryName: "Matha Patti",
    categoryImage: {
      url: "https://images.unsplash.com/photo-1607823489283-1dee240f92f6?auto=format&fit=crop&w=600&q=80",
      public_id: "cjp_seed_cat_mathapatti"
    },
    subcategories: [
      { subcategoryName: "Bridal Patti" },
      { subcategoryName: "Kundan Matha Patti" },
      { subcategoryName: "Traditional Patti" }
    ]
  },
  {
    categoryName: "Earring",
    categoryImage: {
      url: "https://images.unsplash.com/photo-1635767798638-3e25273a8236?auto=format&fit=crop&w=600&q=80",
      public_id: "cjp_seed_cat_earring"
    },
    subcategories: [
      { subcategoryName: "Jhumka" },
      { subcategoryName: "Studs" },
      { subcategoryName: "Chandbali" },
      { subcategoryName: "Drops" }
    ]
  },
  {
    categoryName: "Necklace",
    categoryImage: {
      url: "https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&w=600&q=80",
      public_id: "cjp_seed_cat_necklace"
    },
    subcategories: [
      { subcategoryName: "Bridal Choker" },
      { subcategoryName: "Gold Necklace" },
      { subcategoryName: "Diamond Necklace" },
      { subcategoryName: "Pearl Haar" }
    ]
  },
  {
    categoryName: "Chain",
    categoryImage: {
      url: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80",
      public_id: "cjp_seed_cat_chain"
    },
    subcategories: [
      { subcategoryName: "Gold Chain" },
      { subcategoryName: "Platinum Chain" },
      { subcategoryName: "Minimal Chain" }
    ]
  },
  {
    categoryName: "Pendant",
    categoryImage: {
      url: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=600&q=80",
      public_id: "cjp_seed_cat_pendant"
    },
    subcategories: [
      { subcategoryName: "Diamond Pendant" },
      { subcategoryName: "Gold Locket" },
      { subcategoryName: "Gemstone Pendant" }
    ]
  }
];

const PRODUCTS_DATA = [
  {
    productName: "Aura Diamond Solitaire Ring",
    subcategory: "Diamond Ring",
    brand: "CJP Solitaire",
    shortDescription: "Elegant 1-carat brilliant round diamond in 18K White Gold.",
    fullDescription: "Celebrate forever with this Aura Solitaire. Featuring a conflict-free 1-carat round brilliant-cut diamond of VVS1 clarity and E color, mounted gracefully in an 18K white gold four-prong setting. Individually hallmarked and diamond-certified.",
    price: 125000,
    discountPrice: 115000,
    stockQuantity: 5,
    sku: "CJP-RNG-DIA01",
    isFeatured: true,
    isTrending: true,
    sizes: ["12", "14", "16"],
    attributes: [
      { key: "Material", value: "White Gold (18K)" },
      { key: "Gemstone", value: "Diamond (1-carat)" },
      { key: "Weight", value: "3.2 grams" }
    ],
    images: [
      { url: "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=600&q=80", public_id: "cjp_seed_p_ring1_1" },
      { url: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=600&q=80", public_id: "cjp_seed_p_ring1_2" }
    ]
  },
  {
    productName: "Classic Champagne Gold Band",
    subcategory: "Gold Ring",
    brand: "CJP Classic",
    shortDescription: "Classic 4mm dome wedding band in pure 22K yellow gold.",
    fullDescription: "A timeless expression of devotion. Hand-finished 4mm wide wedding band crafted in solid 22-karat yellow gold. Its soft comfort-fit inner edges make it ideal for everyday wear.",
    price: 32000,
    discountPrice: 29500,
    stockQuantity: 15,
    sku: "CJP-RNG-GLD02",
    isFeatured: true,
    isTrending: false,
    sizes: ["12", "14", "16", "18", "20"],
    attributes: [
      { key: "Material", value: "Yellow Gold (22K)" },
      { key: "Weight", value: "4.5 grams" }
    ],
    images: [
      { url: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=600&q=80", public_id: "cjp_seed_p_ring2_1" }
    ]
  },
  {
    productName: "Elegant Pearl Designer Rakhi",
    subcategory: "Designer Rakhi",
    brand: "CJP Festive",
    shortDescription: "Handcrafted designer rakhi with real freshwater pearls on red silk thread.",
    fullDescription: "Express your brotherly love with this luxury designer rakhi. Crafted with selected round freshwater pearls, gold-plated filigree accents, and braided crimson silk threads. Perfect for the modern luxury celebration.",
    price: 1250,
    discountPrice: 999,
    stockQuantity: 50,
    sku: "CJP-RKH-PRL01",
    isFeatured: false,
    isTrending: true,
    sizes: ["Standard", "Adjustable"],
    attributes: [
      { key: "Material", value: "Silk Thread, Gold Plated" },
      { key: "Stone", value: "Freshwater Pearls" }
    ],
    images: [
      { url: "https://images.unsplash.com/photo-1658238644917-25e79ee898ec?auto=format&fit=crop&w=600&q=80", public_id: "cjp_seed_p_rakhi1_1" }
    ]
  },
  {
    productName: "Imperial Kundan Matha Patti",
    subcategory: "Kundan Matha Patti",
    brand: "CJP Heritage",
    shortDescription: "Majestic bridal matha patti in Kundan work and hanging pearls.",
    fullDescription: "Grace your bridal look with this royal Matha Patti. Styled with precise Kundan gemstone settings, hand-painted meenakari backing, and hanging ivory-colored seed pearls, radiating traditional majesty.",
    price: 28500,
    discountPrice: 25900,
    stockQuantity: 3,
    sku: "CJP-MTH-KND01",
    isFeatured: true,
    isTrending: true,
    sizes: ["Standard", "Adjustable"],
    attributes: [
      { key: "Material", value: "22K Gold Plated Brass" },
      { key: "Stone", value: "Kundan, Seed Pearls" }
    ],
    images: [
      { url: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80", public_id: "cjp_seed_p_mth1_1" }
    ]
  },
  {
    productName: "Royal Kundan Jhumka Earrings",
    subcategory: "Jhumka",
    brand: "CJP Heritage",
    shortDescription: "Dome-style jhumka earrings in 22K gold plating with rubies.",
    fullDescription: "Exquisite traditional jhumkas featuring micro Kundan settings, delicate filigree, and dangling crimson ruby droplets. Handcrafted to add a touch of royal heritage to festive attire.",
    price: 18500,
    discountPrice: 16500,
    stockQuantity: 8,
    sku: "CJP-EAR-JHM01",
    isFeatured: false,
    isTrending: true,
    sizes: ["Standard"],
    attributes: [
      { key: "Material", value: "Gold Plated Brass" },
      { key: "Stone", value: "Kundan, Ruby" },
      { key: "Weight", value: "18.5 grams" }
    ],
    images: [
      { url: "https://images.unsplash.com/photo-1635767798638-3e25273a8236?auto=format&fit=crop&w=600&q=80", public_id: "cjp_seed_p_ear1_1" }
    ]
  },
  {
    productName: "Starlight Diamond Studs",
    subcategory: "Studs",
    brand: "CJP Solitaire",
    shortDescription: "Daily wear flower-shaped studs in 18K white gold and diamonds.",
    fullDescription: "Beautiful floral-patterned ear studs with clusters of brilliant diamonds. Perfect for both office meetings and evening get-togethers, providing an understated sparkling glow.",
    price: 65000,
    discountPrice: 59000,
    stockQuantity: 12,
    sku: "CJP-EAR-STD02",
    isFeatured: true,
    isTrending: true,
    sizes: ["Standard"],
    attributes: [
      { key: "Material", value: "White Gold (18K)" },
      { key: "Gemstone", value: "Diamond" },
      { key: "Weight", value: "2.1 grams" }
    ],
    images: [
      { url: "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=600&q=80", public_id: "cjp_seed_p_ear2_1" }
    ]
  },
  {
    productName: "Bespoke Royal Polki Choker Set",
    subcategory: "Bridal Choker",
    brand: "CJP Heritage",
    shortDescription: "Intricate 22K gold Polki choker necklace with emerald hangings.",
    fullDescription: "Indulge in royal splendour. An heirloom-quality bridal choker set intricately crafted in pure 22K yellow gold. Embedded with natural uncut Polki diamonds and decorated with teardrop emerald beads.",
    price: 275000,
    discountPrice: 260000,
    stockQuantity: 2,
    sku: "CJP-NEC-POL01",
    isFeatured: true,
    isTrending: true,
    sizes: ["Standard", "Adjustable"],
    attributes: [
      { key: "Material", value: "Yellow Gold (22K)" },
      { key: "Gemstone", value: "Polki (Uncut Diamond), Emerald" },
      { key: "Weight", value: "48.2 grams" }
    ],
    images: [
      { url: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80", public_id: "cjp_seed_p_nec1_1" },
      { url: "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=600&q=80", public_id: "cjp_seed_p_nec1_2" }
    ]
  },
  {
    productName: "Solid Gold Rope Chain",
    subcategory: "Gold Chain",
    brand: "CJP Classic",
    shortDescription: "Premium 20-inch braided rope link chain in 22K gold.",
    fullDescription: "A luxurious heavy-duty rope chain, expertly hand-woven from solid 22-karat yellow gold. Equipped with a sturdy barrel lock clasp for peace of mind and style.",
    price: 52000,
    discountPrice: 49000,
    stockQuantity: 10,
    sku: "CJP-CHN-ROP01",
    isFeatured: false,
    isTrending: false,
    sizes: ["18 inches", "20 inches", "22 inches"],
    attributes: [
      { key: "Material", value: "Yellow Gold (22K)" },
      { key: "Length", value: "20 inches" },
      { key: "Weight", value: "8.5 grams" }
    ],
    images: [
      { url: "https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&w=600&q=80", public_id: "cjp_seed_p_chn1_1" }
    ]
  },
  {
    productName: "Eternal Love Heart Pendant",
    subcategory: "Diamond Pendant",
    brand: "CJP Solitaire",
    shortDescription: "Dainty heart pendant in 18K Rose Gold with pave diamonds.",
    fullDescription: "An elegant, romantic everyday accessory. This pave-diamond heart-shaped pendant is cast in 18K rose gold and comes with a complimentary 16-inch rose gold link chain.",
    price: 45000,
    discountPrice: 39999,
    stockQuantity: 15,
    sku: "CJP-PDT-HRT01",
    isFeatured: true,
    isTrending: true,
    sizes: ["Standard"],
    attributes: [
      { key: "Material", value: "Rose Gold (18K)" },
      { key: "Gemstone", value: "Diamond" },
      { key: "Weight", value: "1.8 grams" }
    ],
    images: [
      { url: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=600&q=80", public_id: "cjp_seed_p_pdt1_1" }
    ]
  }
];

const seedDatabase = async () => {
  try {
    console.log("Connecting to Database...");
    await mongoose.connect(DATABASE_URL);
    console.log("Connected. Clearing old categories and products...");

    await Category.deleteMany({});
    await Product.deleteMany({});
    console.log("Old collections wiped. Inserting Categories one by one...");

    const createdCategories = [];
    for (const cat of CATEGORIES_DATA) {
      const created = await Category.create(cat);
      createdCategories.push(created);
    }
    console.log(`Successfully seeded ${createdCategories.length} categories.`);

    // Map categories to products
    const finalProducts = PRODUCTS_DATA.map(prod => {
      // Find matching categoryName based on subcategory
      let matchedCategory = null;
      for (const cat of createdCategories) {
        const found = cat.subcategories.some(sub => sub.subcategoryName === prod.subcategory);
        if (found) {
          matchedCategory = cat;
          break;
        }
      }

      if (!matchedCategory) {
        // Fallback or default
        matchedCategory = createdCategories[0];
        console.warn(`⚠️ Warning: Subcategory '${prod.subcategory}' not found in any seeded categories. Falling back to Ring.`);
      }

      return {
        ...prod,
        category: matchedCategory._id
      };
    });

    console.log("Inserting Products one by one...");
    const createdProducts = [];
    for (const prod of finalProducts) {
      const created = await Product.create(prod);
      createdProducts.push(created);
    }
    console.log(`Successfully seeded ${createdProducts.length} jewellery products.`);

    console.log("✅ Database seeding complete!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding Error:", error);
    process.exit(1);
  }
};

seedDatabase();
