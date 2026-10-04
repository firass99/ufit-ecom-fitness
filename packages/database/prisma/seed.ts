import { PrismaClient, Size, Gender } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding categories...');

  // === 1. Categories ===
  const categories = await prisma.category.createMany({
    data: [
      { name: 'Clothing', description: 'Workout wear' },
      { name: 'Supplements', description: 'Recovery & performance' },
      { name: 'Accessories', description: 'Training accessories' },
      { name: 'Footwear', description: 'Shoes for training' },
      { name: 'Equipment', description: 'Home and gym equipment' },
    ],
  });

  const categoryRecords = await prisma.category.findMany();

  // === 2. Products (3 per category = 15 total) ===
  const productNames = [
    // Clothing
    'Gym T-Shirt',
    'Training Hoodie',
    'Running Shorts',

    // Supplements
    'Whey Protein',
    'Creatine Powder',
    'BCAA Formula',

    // Accessories
    'Workout Gloves',
    'Resistance Bands',
    'Wrist Wraps',

    // Footwear
    'CrossFit Shoes',
    'Running Sneakers',
    'Lifting Shoes',

    // Equipment
    'Yoga Mat',
    'Kettlebell',
    'Jump Rope',
  ];

  const products = [];

  for (let i = 0; i < productNames.length; i++) {
    const category = categoryRecords[Math.floor(i / 3)]; // group by 3
    const product = await prisma.product.create({
      data: {
        name: productNames[i],
        description: `${productNames[i]} for your training`,
        images: ['https://via.placeholder.com/300'],
        categoryId: category.id,
      },
    });
    products.push(product);
  }

  // === 3. Variants (3 per product) ===
  console.log('🧬 Creating variants...');

  const sizes: Size[] = ['S', 'M', 'L'];
  const colors = ['Black', 'White', 'Blue'];
  const genderOptions: Gender[] = ['MEN', 'WOMEN', 'UNISEX'];

  let variantCount = 0;

  for (const product of products) {
    for (let i = 0; i < 3; i++) {
      const size = sizes[i];
      const color = colors[i];
      const gender = genderOptions[i];
      const price = 19.99 + product.id.charCodeAt(0) + i * 5;

      await prisma.variant.create({
        data: {
          productId: product.id,
          size,
          color,
          gender,
          price,
          stock: 50 + i * 10,
        },
      });

      variantCount++;
    }
  }

  console.log(
    `✅ Seeded ${products.length} products, ${variantCount} variants, ${categoryRecords.length} categories.`,
  );
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
