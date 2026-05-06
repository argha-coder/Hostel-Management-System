// utils/productImages.js

export const ALLOWED_PRODUCTS = [
  "Chai", "Tea", "Coffee", "Kurkure", "Lays", "Chips", "Parle G", "Biscuit", 
  "Oreo", "Maggi", "Coke", "Pepsi", "Water", "Limca", "Sprite", "Maaza",
  "Toothpaste", "Toothbrush", "Soap", "Detergent", "Shampoo", "Face Wash", 
  "Pens", "Notebook", "Scale", "Eraser", "Glue", "Towel", "Comb", "Mug"
];

export const DEFAULT_PRODUCT_IMAGES = {
  Snacks: "https://images.unsplash.com/photo-1599490659213-e2b9527bb087?auto=format&fit=crop&q=80&w=800",
  Biscuits: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&q=80&w=800",
  Drinks: "https://images.unsplash.com/photo-1544145945-f904253d0c71?auto=format&fit=crop&q=80&w=800",
  Meals: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800",
  Essentials: "https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&q=80&w=800",
  Stationery: "https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?auto=format&fit=crop&q=80&w=800",
  Other: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80",
  Fallback: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80"
};

export const PRODUCT_SPECIFIC_IMAGES = {
  // Drinks
  chai: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=800&q=80",
  tea: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=800&q=80",
  coffee: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80",
  coke: "https://images.unsplash.com/photo-1629203851122-3726ecdf080e?auto=format&fit=crop&w=800&q=80",
  pepsi: "https://images.unsplash.com/photo-1629203851122-3726ecdf080e?auto=format&fit=crop&w=800&q=80",
  water: "https://images.unsplash.com/photo-1564419320461-6870880221ad?auto=format&fit=crop&w=800&q=80",
  limca: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80",
  sprite: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80",
  maaza: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?auto=format&fit=crop&w=800&q=80",
  juice: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?auto=format&fit=crop&w=800&q=80",

  // Snacks & Biscuits
  kurkure: "https://images.unsplash.com/photo-1613919113640-25732ec5e61f?auto=format&fit=crop&w=800&q=80",
  lays: "https://images.unsplash.com/photo-1613919113640-25732ec5e61f?auto=format&fit=crop&w=800&q=80",
  chips: "https://images.unsplash.com/photo-1613919113640-25732ec5e61f?auto=format&fit=crop&w=800&q=80",
  "parle g": "https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&w=800&q=80",
  biscuit: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=800&q=80",
  oreo: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=800&q=80",
  maggi: "https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?auto=format&fit=crop&w=800&q=80",

  // Essentials
  toothpaste: "https://images.unsplash.com/photo-1559594482-7c23905967c2?auto=format&fit=crop&w=800&q=80",
  toothbrush: "https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?auto=format&fit=crop&w=800&q=80",
  soap: "https://images.unsplash.com/photo-1605264964528-06403738d6dc?auto=format&fit=crop&w=800&q=80",
  detergent: "https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=800&q=80",
  shampoo: "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=800&q=80",
  "face wash": "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80",
  towel: "https://images.unsplash.com/photo-1583911860071-70067340d85a?auto=format&fit=crop&w=800&q=80",
  comb: "https://images.unsplash.com/photo-1590540179852-211025458230?auto=format&fit=crop&w=800&q=80",
  mug: "https://images.unsplash.com/photo-1514228742587-6b1558fbed20?auto=format&fit=crop&w=800&q=80",

  // Stationery
  pens: "https://images.unsplash.com/photo-1585336139118-1356ee74c1b1?auto=format&fit=crop&w=800&q=80",
  pen: "https://images.unsplash.com/photo-1585336139118-1356ee74c1b1?auto=format&fit=crop&w=800&q=80",
  notebook: "https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&w=800&q=80",
  scale: "https://images.unsplash.com/photo-1516962080544-eac695c93791?auto=format&fit=crop&w=800&q=80",
  eraser: "https://images.unsplash.com/photo-1516962080544-eac695c93791?auto=format&fit=crop&w=800&q=80",
  glue: "https://images.unsplash.com/photo-1562141960-449339397737?auto=format&fit=crop&w=800&q=80"
};

export const getProductImage = (product) => {
  if (product && typeof product.image === "string" && product.image.trim().length > 5) {
    return product.image.trim();
  }
  if (!product || !product.name) return DEFAULT_PRODUCT_IMAGES.Fallback;
  const name = product.name.toLowerCase();
  for (const keyword in PRODUCT_SPECIFIC_IMAGES) {
    if (name.includes(keyword)) return PRODUCT_SPECIFIC_IMAGES[keyword];
  }
  return DEFAULT_PRODUCT_IMAGES[product.category] || DEFAULT_PRODUCT_IMAGES.Fallback;
};

export const getProductCategory = (name) => {
  if (!name) return "Other";
  const lowerName = name.toLowerCase();
  
  if (lowerName.includes('chai') || lowerName.includes('tea') || lowerName.includes('coffee') || 
      lowerName.includes('coke') || lowerName.includes('pepsi') || lowerName.includes('water') ||
      lowerName.includes('limca') || lowerName.includes('sprite') || lowerName.includes('maaza') || lowerName.includes('juice')) 
    return "Drinks";
    
  if (lowerName.includes('chips') || lowerName.includes('kurkure') || lowerName.includes('lays') || lowerName.includes('snacks'))
    return "Snacks";
    
  if (lowerName.includes('biscuit') || lowerName.includes('cookie') || lowerName.includes('oreo') || lowerName.includes('parle g'))
    return "Biscuits";
    
  if (lowerName.includes('maggi') || lowerName.includes('noodle'))
    return "Meals";
    
  if (lowerName.includes('pen') || lowerName.includes('notebook') || lowerName.includes('scale') || 
      lowerName.includes('eraser') || lowerName.includes('glue'))
    return "Stationery";
    
  if (lowerName.includes('toothpaste') || lowerName.includes('toothbrush') || lowerName.includes('soap') || 
      lowerName.includes('detergent') || lowerName.includes('shampoo') || lowerName.includes('face wash') ||
      lowerName.includes('towel') || lowerName.includes('comb') || lowerName.includes('mug'))
    return "Essentials";
    
  return "Other";
};

export const getProductDescription = (name) => {
  if (!name) return "Quality canteen item.";
  const lowerName = name.toLowerCase();
  const descriptions = {
    chai: "Hot and refreshing Indian Masala Chai.",
    tea: "Freshly brewed hot tea.",
    coffee: "Energetic hot coffee to kickstart your day.",
    kurkure: "Crunchy and spicy Indian snacks.",
    lays: "Classic potato chips for a quick snack.",
    chips: "Crispy and salted potato chips.",
    "parle g": "The classic glucose biscuit for everyone.",
    biscuit: "Sweet and crunchy biscuits.",
    oreo: "Cream-filled chocolate sandwich cookies.",
    maggi: "Hot and spicy 2-minute instant noodles.",
    coke: "Chilled Coca-Cola for instant refreshment.",
    pepsi: "Ice-cold Pepsi soft drink.",
    limca: "Lemon-lime refreshment for a hot day.",
    maaza: "Sweet and pulpy mango drink.",
    water: "Clean and pure packaged drinking water.",
    toothpaste: "Fluoride protection for strong teeth and fresh breath.",
    toothbrush: "Soft-bristled toothbrush for effective cleaning.",
    soap: "Refreshing bath soap for daily hygiene.",
    detergent: "Powerful detergent for clean and fresh clothes.",
    shampoo: "Nourishing shampoo for healthy and shiny hair.",
    "face wash": "Gentle face wash for clear and glowing skin.",
    towel: "Soft and absorbent cotton towel.",
    comb: "Daily use comb for hair grooming.",
    mug: "Durable bathroom mug for daily needs.",
    pens: "Smooth writing pens for your academic needs.",
    notebook: "High-quality ruled notebook for your notes.",
    scale: "Perfect 30cm scale for engineering drawings.",
    eraser: "Dust-free eraser for clean corrections.",
    glue: "Strong adhesive for craft and projects."
  };
  for (const key in descriptions) {
    if (lowerName.includes(key)) return descriptions[key];
  }
  return "Essential hostel supplies available at your canteen.";
};