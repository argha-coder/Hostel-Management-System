import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.js';
import connectDB from './config/db.js';

dotenv.config();
connectDB();

const seedProducts = async () => {
  try {
    await Product.deleteMany();

    const products = [
      {
        name: 'Lays Chips (Classic)',
        description: 'Crispy salted potato chips',
        price: 20,
        category: 'Snacks',
        image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&q=80&w=200',
        stock: 50,
        isAvailable: true
      },
      {
        name: 'Kurkure (Masala Munch)',
        description: 'Spicy crunchy snack',
        price: 20,
        category: 'Snacks',
        image: 'https://images.unsplash.com/photo-1600493036152-329479326079?auto=format&fit=crop&q=80&w=200',
        stock: 40,
        isAvailable: true
      },
      {
        name: 'Hide & Seek Biscuits',
        description: 'Chocolate chip cookies',
        price: 30,
        category: 'Biscuits',
        image: 'https://images.unsplash.com/photo-1499636136210-65422ff0d330?auto=format&fit=crop&q=80&w=200',
        stock: 30,
        isAvailable: true
      },
      {
        name: 'Parle-G',
        description: 'World\'s largest selling biscuit',
        price: 10,
        category: 'Biscuits',
        image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&q=80&w=200',
        stock: 100,
        isAvailable: true
      },
      {
        name: 'Coca Cola (500ml)',
        description: 'Refreshing cold drink',
        price: 40,
        category: 'Drinks',
        image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&q=80&w=200',
        stock: 25,
        isAvailable: true
      },
      {
        name: 'Maggi Noodles',
        description: '2-Minute Masala Noodles',
        price: 15,
        category: 'Snacks',
        image: 'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?auto=format&fit=crop&q=80&w=200',
        stock: 60,
        isAvailable: true
      }
    ];

    await Product.insertMany(products);
    console.log('Canteen products seeded successfully!');
    process.exit();
  } catch (error) {
    console.error('Error seeding products:', error.message);
    process.exit(1);
  }
};

seedProducts();
