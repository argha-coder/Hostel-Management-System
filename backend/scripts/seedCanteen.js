import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../src/models/Product.js';
import connectDB from '../src/config/db.js';

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
        image: 'https://rukminim2.flixcart.com/image/850/1000/xif0q/chips/p/k/x/-original-imahyhghyhq7hhv2.jpeg?q=90',
        stock: 50,
        isAvailable: true
      },
      {
        name: 'Kurkure (Masala Munch)',
        description: 'Spicy crunchy snack',
        price: 20,
        category: 'Snacks',
        image: 'https://rukminim2.flixcart.com/image/850/1000/xif0q/snack-kurkure/7/u/s/-original-imagp6mgyyzxghgz.jpeg?q=90',
        stock: 40,
        isAvailable: true
      },
      {
        name: 'Hide & Seek Biscuits',
        description: 'Chocolate chip cookies',
        price: 30,
        category: 'Biscuits',
        image: 'https://rukminim2.flixcart.com/image/850/1000/xif0q/cookie-biscuit/k/x/p/-original-imagzt7yzzyhygzz.jpeg?q=90',
        stock: 30,
        isAvailable: true
      },
      {
        name: 'Parle-G',
        description: 'World\'s largest selling biscuit',
        price: 10,
        category: 'Biscuits',
        image: 'https://rukminim2.flixcart.com/image/850/1000/xif0q/cookie-biscuit/k/z/o/-original-imahyhghyhq7hhv2.jpeg?q=90',
        stock: 100,
        isAvailable: true
      },
      {
        name: 'Coca Cola (500ml)',
        description: 'Refreshing cold drink',
        price: 40,
        category: 'Drinks',
        image: 'https://rukminim2.flixcart.com/image/850/1000/xif0q/aerated-drink/u/v/x/-original-imahyhghyhq7hhv2.jpeg?q=90',
        stock: 25,
        isAvailable: true
      },
      {
        name: 'Maggi Noodles',
        description: '2-Minute Masala Noodles',
        price: 15,
        category: 'Snacks',
        image: 'https://rukminim2.flixcart.com/image/850/1000/xif0q/instant-noodles/p/u/v/-original-imahyhghyhq7hhv2.jpeg?q=90',
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
