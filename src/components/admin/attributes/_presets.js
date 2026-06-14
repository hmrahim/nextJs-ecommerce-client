// 📁 PATH: src/components/admin/attributes/_presets.js
// Enterprise-grade preset library — inspired by Amazon / Alibaba / Noon catalogues.
// Used by the Form Modal (quick-add attribute) and Values Drawer (bulk values).

// ── Industry / product-type groups ──────────────────────────────────────────
export const ATTRIBUTE_GROUPS = [
  { value: 'fashion',     label: 'Fashion & Apparel',  icon: '👕', color: 'rose'    },
  { value: 'footwear',    label: 'Footwear',           icon: '👟', color: 'orange'  },
  { value: 'electronics', label: 'Electronics',        icon: '📱', color: 'sky'     },
  { value: 'computing',   label: 'Computers & Laptops',icon: '💻', color: 'indigo'  },
  { value: 'home',        label: 'Home & Kitchen',     icon: '🏠', color: 'emerald' },
  { value: 'beauty',      label: 'Beauty & Personal',  icon: '💄', color: 'pink'    },
  { value: 'jewelry',     label: 'Jewelry & Watches',  icon: '💍', color: 'amber'   },
  { value: 'automotive',  label: 'Automotive',         icon: '🚗', color: 'slate'   },
  { value: 'grocery',     label: 'Grocery & Food',     icon: '🥫', color: 'lime'    },
  { value: 'sports',      label: 'Sports & Outdoors',  icon: '⚽', color: 'cyan'    },
  { value: 'books',       label: 'Books & Media',      icon: '📚', color: 'violet'  },
  { value: 'general',     label: 'General / Custom',   icon: '⚙️', color: 'slate'   },
];

export const groupLabel = (v) => ATTRIBUTE_GROUPS.find(g => g.value === v)?.label || 'General';

// ── How the attribute renders on the storefront ─────────────────────────────
export const DISPLAY_TYPES = [
  { value: 'dropdown',    label: 'Dropdown',         hint: 'Standard <select> picker'        },
  { value: 'pills',       label: 'Pill / Button',    hint: 'Tappable chips (e.g. sizes)'     },
  { value: 'swatch',      label: 'Color Swatch',     hint: 'Round color circles'             },
  { value: 'image',       label: 'Image Swatch',     hint: 'Thumbnail per variant'           },
  { value: 'radio',       label: 'Radio List',       hint: 'Vertical radio buttons'          },
  { value: 'checkbox',    label: 'Checkbox Group',   hint: 'Multi-select checkboxes'         },
  { value: 'slider',      label: 'Range Slider',     hint: 'Numeric min/max slider'          },
  { value: 'text',        label: 'Text Field',       hint: 'Free input on product page'      },
];

// ── Validation rule templates (per type) ────────────────────────────────────
export const VALIDATION_DEFAULTS = {
  text:        { minLength: 0,  maxLength: 255, regex: '' },
  number:      { min: null,     max: null,      step: 1, unit: '' },
  select:      { minSelections: 1, maxSelections: 1 },
  multiselect: { minSelections: 0, maxSelections: 10 },
};

// ── Ready-made attribute templates (drop into form modal) ───────────────────
// Each preset = a full attribute payload the admin can spawn in one click.
export const ATTRIBUTE_PRESETS = [
  // FASHION
  { key: 'fashion-size-apparel', group: 'fashion', name: 'Apparel Size', slug: 'size',
    type: 'select', displayType: 'pills', isVariant: true, isFilterable: true, isRequired: true,
    values: ['XXS','XS','S','M','L','XL','XXL','3XL','4XL'] },
  { key: 'fashion-color',        group: 'fashion', name: 'Color', slug: 'color',
    type: 'color', displayType: 'swatch', isVariant: true, isFilterable: true, isRequired: true,
    values: [
      ['Black','#000000'],['White','#FFFFFF'],['Red','#C41230'],['Navy','#1B3A6B'],
      ['Forest','#2D5A27'],['Charcoal','#333333'],['Beige','#C2B280'],['Mustard','#FFD740'],
    ] },
  { key: 'fashion-material', group: 'fashion', name: 'Material', slug: 'material',
    type: 'multiselect', displayType: 'pills', isFilterable: true,
    values: ['Cotton','Polyester','Linen','Wool','Silk','Denim','Leather','Synthetic','Nylon','Viscose'] },
  { key: 'fashion-fit', group: 'fashion', name: 'Fit', slug: 'fit',
    type: 'select', displayType: 'pills', isFilterable: true,
    values: ['Slim','Regular','Relaxed','Oversized','Skinny','Tailored'] },
  { key: 'fashion-sleeve', group: 'fashion', name: 'Sleeve Length', slug: 'sleeve',
    type: 'select', displayType: 'pills', isFilterable: true,
    values: ['Sleeveless','Short Sleeve','3/4 Sleeve','Long Sleeve'] },
  { key: 'fashion-neckline', group: 'fashion', name: 'Neckline', slug: 'neckline',
    type: 'select', isFilterable: true,
    values: ['Crew','V-Neck','Round','Polo','Henley','Mock Neck','Turtleneck','Boat'] },
  { key: 'fashion-gender', group: 'fashion', name: 'Gender', slug: 'gender',
    type: 'select', displayType: 'pills', isFilterable: true,
    values: ['Men','Women','Unisex','Kids'] },

  // FOOTWEAR
  { key: 'footwear-eu', group: 'footwear', name: 'EU Shoe Size', slug: 'shoe-size-eu',
    type: 'select', displayType: 'pills', isVariant: true, isFilterable: true, isRequired: true,
    values: ['36','37','38','39','40','41','42','43','44','45','46','47'] },
  { key: 'footwear-us', group: 'footwear', name: 'US Shoe Size', slug: 'shoe-size-us',
    type: 'select', displayType: 'pills', isVariant: true, isFilterable: true,
    values: ['5','5.5','6','6.5','7','7.5','8','8.5','9','9.5','10','11','12','13'] },
  { key: 'footwear-width', group: 'footwear', name: 'Shoe Width', slug: 'width',
    type: 'select', displayType: 'pills',
    values: ['Narrow','Standard','Wide','Extra Wide'] },

  // ELECTRONICS
  { key: 'elec-storage', group: 'electronics', name: 'Storage', slug: 'storage',
    type: 'select', displayType: 'pills', isVariant: true, isFilterable: true,
    values: ['32GB','64GB','128GB','256GB','512GB','1TB','2TB'] },
  { key: 'elec-ram', group: 'electronics', name: 'RAM', slug: 'ram',
    type: 'select', displayType: 'pills', isVariant: true, isFilterable: true,
    values: ['4GB','6GB','8GB','12GB','16GB','24GB','32GB','64GB'] },
  { key: 'elec-screen', group: 'electronics', name: 'Screen Size', slug: 'screen-size',
    type: 'number', isFilterable: true, validation: { min: 1, max: 100, step: 0.1, unit: 'inches' } },
  { key: 'elec-battery', group: 'electronics', name: 'Battery Capacity', slug: 'battery',
    type: 'number', isFilterable: true, validation: { min: 0, max: 20000, step: 50, unit: 'mAh' } },
  { key: 'elec-network', group: 'electronics', name: 'Network', slug: 'network',
    type: 'multiselect', displayType: 'pills', isFilterable: true,
    values: ['2G','3G','4G LTE','5G','Wi-Fi Only'] },

  // COMPUTING
  { key: 'comp-cpu', group: 'computing', name: 'Processor', slug: 'processor',
    type: 'select', isFilterable: true,
    values: ['Intel i3','Intel i5','Intel i7','Intel i9','AMD Ryzen 3','AMD Ryzen 5','AMD Ryzen 7','AMD Ryzen 9','Apple M1','Apple M2','Apple M3','Apple M4'] },
  { key: 'comp-gpu', group: 'computing', name: 'Graphics', slug: 'graphics',
    type: 'select', isFilterable: true,
    values: ['Integrated','NVIDIA GTX 1650','NVIDIA RTX 3050','NVIDIA RTX 4060','NVIDIA RTX 4070','NVIDIA RTX 4080','AMD Radeon'] },
  { key: 'comp-os', group: 'computing', name: 'Operating System', slug: 'os',
    type: 'select', displayType: 'pills', isFilterable: true,
    values: ['Windows 11','Windows 10','macOS','Linux','Chrome OS','No OS'] },

  // HOME
  { key: 'home-capacity', group: 'home', name: 'Capacity', slug: 'capacity',
    type: 'number', isFilterable: true, validation: { min: 0, max: 1000, step: 0.1, unit: 'L' } },
  { key: 'home-wattage', group: 'home', name: 'Power', slug: 'wattage',
    type: 'number', isFilterable: true, validation: { min: 0, max: 5000, step: 10, unit: 'W' } },
  { key: 'home-energy', group: 'home', name: 'Energy Rating', slug: 'energy',
    type: 'select', displayType: 'pills', isFilterable: true,
    values: ['A+++','A++','A+','A','B','C','D'] },

  // BEAUTY
  { key: 'beauty-skin', group: 'beauty', name: 'Skin Type', slug: 'skin-type',
    type: 'multiselect', displayType: 'pills', isFilterable: true,
    values: ['Oily','Dry','Combination','Sensitive','Normal','Acne-prone','Mature'] },
  { key: 'beauty-volume', group: 'beauty', name: 'Volume', slug: 'volume',
    type: 'select', displayType: 'pills', isVariant: true, isFilterable: true,
    values: ['30ml','50ml','75ml','100ml','150ml','200ml','250ml','500ml','1L'] },
  { key: 'beauty-shade', group: 'beauty', name: 'Shade', slug: 'shade',
    type: 'color', displayType: 'swatch', isVariant: true, isFilterable: true,
    values: [
      ['Fair Ivory','#F3D6B5'],['Light Beige','#E8C39E'],['Medium Tan','#C99A6B'],
      ['Caramel','#A47148'],['Deep Mocha','#5C3A21'],['Espresso','#2E1A0F'],
    ] },

  // JEWELRY
  { key: 'jewelry-metal', group: 'jewelry', name: 'Metal', slug: 'metal',
    type: 'select', displayType: 'pills', isVariant: true, isFilterable: true,
    values: ['18K Gold','14K Gold','Rose Gold','White Gold','Sterling Silver','Platinum','Titanium','Stainless Steel'] },
  { key: 'jewelry-gem', group: 'jewelry', name: 'Gemstone', slug: 'gemstone',
    type: 'select', isFilterable: true,
    values: ['Diamond','Ruby','Sapphire','Emerald','Pearl','Amethyst','Opal','None'] },
  { key: 'jewelry-ring', group: 'jewelry', name: 'Ring Size', slug: 'ring-size',
    type: 'select', displayType: 'pills', isVariant: true,
    values: ['5','6','7','8','9','10','11','12'] },

  // AUTOMOTIVE
  { key: 'auto-fuel', group: 'automotive', name: 'Fuel Type', slug: 'fuel',
    type: 'select', displayType: 'pills', isFilterable: true,
    values: ['Petrol','Diesel','CNG','Hybrid','Electric','Plug-in Hybrid'] },
  { key: 'auto-trans', group: 'automotive', name: 'Transmission', slug: 'transmission',
    type: 'select', displayType: 'pills', isFilterable: true,
    values: ['Manual','Automatic','CVT','DCT','Semi-Auto'] },

  // GROCERY
  { key: 'grocery-weight', group: 'grocery', name: 'Net Weight', slug: 'weight',
    type: 'select', displayType: 'pills', isVariant: true,
    values: ['100g','250g','500g','1kg','2kg','5kg','10kg'] },
  { key: 'grocery-diet', group: 'grocery', name: 'Dietary', slug: 'dietary',
    type: 'multiselect', displayType: 'pills', isFilterable: true,
    values: ['Vegan','Vegetarian','Halal','Kosher','Gluten-Free','Sugar-Free','Organic','Keto'] },

  // SPORTS
  { key: 'sports-activity', group: 'sports', name: 'Activity', slug: 'activity',
    type: 'multiselect', displayType: 'pills', isFilterable: true,
    values: ['Running','Gym','Yoga','Cycling','Football','Cricket','Hiking','Swimming'] },

  // BOOKS
  { key: 'books-format', group: 'books', name: 'Format', slug: 'format',
    type: 'select', displayType: 'pills', isFilterable: true,
    values: ['Paperback','Hardcover','eBook','Audiobook'] },
  { key: 'books-lang', group: 'books', name: 'Language', slug: 'language',
    type: 'select', isFilterable: true,
    values: ['English','Bengali','Hindi','Arabic','Urdu','Spanish','French','German'] },
];

// ── Bulk value templates (used inside the Values Drawer) ────────────────────
export const VALUE_PRESETS = {
  select: [
    { key: 'apparel-sizes',  label: 'Apparel sizes (XS–4XL)',   values: ['XXS','XS','S','M','L','XL','XXL','3XL','4XL'] },
    { key: 'numeric-sizes',  label: 'Numeric sizes (28–46)',     values: Array.from({length:10},(_,i)=>String(28+i*2)) },
    { key: 'shoe-eu',        label: 'EU shoe sizes (36–47)',    values: Array.from({length:12},(_,i)=>String(36+i)) },
    { key: 'shoe-us-men',    label: 'US shoe sizes — Men',      values: ['7','7.5','8','8.5','9','9.5','10','10.5','11','11.5','12','13'] },
    { key: 'shoe-us-women',  label: 'US shoe sizes — Women',    values: ['5','5.5','6','6.5','7','7.5','8','8.5','9','9.5','10'] },
    { key: 'storage',        label: 'Storage capacities',        values: ['32GB','64GB','128GB','256GB','512GB','1TB','2TB'] },
    { key: 'ram',            label: 'RAM options',                values: ['4GB','6GB','8GB','12GB','16GB','24GB','32GB','64GB'] },
    { key: 'volume-ml',      label: 'Volumes (ml)',               values: ['30ml','50ml','75ml','100ml','150ml','200ml','250ml','500ml','1L'] },
    { key: 'weight-g',       label: 'Weights (g/kg)',             values: ['100g','250g','500g','1kg','2kg','5kg','10kg'] },
    { key: 'energy',         label: 'Energy ratings',             values: ['A+++','A++','A+','A','B','C','D'] },
    { key: 'condition',      label: 'Condition',                  values: ['Brand New','Open Box','Refurbished','Used - Like New','Used - Good'] },
  ],
  color: [
    { key: 'basic-9',   label: 'Basic colors (9)',
      values: [['Black','#000000'],['White','#FFFFFF'],['Gray','#808080'],['Red','#C41230'],['Blue','#1B3A6B'],['Green','#2D5A27'],['Yellow','#FFD740'],['Pink','#FF7AA2'],['Brown','#6B4226']] },
    { key: 'pastels',   label: 'Pastel palette',
      values: [['Blush','#FAD2E1'],['Sky','#BEE3F8'],['Mint','#C3F0CA'],['Butter','#FFF1B6'],['Lavender','#E0BBE4'],['Peach','#FFD8B1']] },
    { key: 'jewel',     label: 'Jewel tones',
      values: [['Emerald','#046307'],['Ruby','#9B111E'],['Sapphire','#0F52BA'],['Amethyst','#9966CC'],['Topaz','#FFC87C'],['Onyx','#0F0F0F']] },
    { key: 'skin',      label: 'Skin / foundation shades',
      values: [['Porcelain','#F5DDC1'],['Fair','#F3D6B5'],['Light','#E8C39E'],['Medium','#C99A6B'],['Tan','#A47148'],['Deep','#7A4A2B'],['Mocha','#5C3A21'],['Espresso','#2E1A0F']] },
  ],
};
