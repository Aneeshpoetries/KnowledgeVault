/**
 * MongoDB seed script — creates the 4 hardcoded demo accounts.
 * Run with:  node src/lib/mongo-seed.mjs
 *
 * These accounts are protected (isDemo: true) and cannot be deleted
 * through the app. They represent the 4 company roles for the hackathon demo.
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { config } from 'dotenv';

config(); // Load .env

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not set in .env');
  process.exit(1);
}

const UserSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true, lowercase: true },
    passwordHash: String,
    role: String,
    title: String,
    avatar: String,
    department: String,
    employeeId: String,
    isDemo: Boolean,
    companySlug: String,
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model('User', UserSchema);

const DEMO_ACCOUNTS = [
  {
    name: 'Marcus Vance',
    email: 'marcus@novatech.demo',
    password: 'demo123',
    role: 'ADMIN',
    title: 'Engineering Director',
    department: 'Engineering Leadership',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    employeeId: 'EMP-001',
    isDemo: true,
    companySlug: 'novatech',
  },
  {
    name: 'Sarah Lin',
    email: 'sarah@novatech.demo',
    password: 'demo123',
    role: 'MANAGER',
    title: 'Engineering Manager',
    department: 'Core Infrastructure & Payments',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
    employeeId: 'EMP-002',
    isDemo: true,
    companySlug: 'novatech',
  },
  {
    name: 'Rahul Sharma',
    email: 'rahul@novatech.demo',
    password: 'demo123',
    role: 'EMPLOYEE',
    title: 'Staff Infrastructure Engineer',
    department: 'Core Infrastructure & Payments',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    employeeId: 'EMP-003',
    isDemo: true,
    companySlug: 'novatech',
  },
  {
    name: 'Alex Chen',
    email: 'alex@novatech.demo',
    password: 'demo123',
    role: 'NEW_EMPLOYEE',
    title: 'Junior Developer',
    department: 'Core Infrastructure & Payments',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
    employeeId: 'EMP-004',
    isDemo: true,
    companySlug: 'novatech',
  },
];

async function seed() {
  await mongoose.connect(MONGODB_URI, { dbName: 'knowledgevault' });
  console.log('✅ Connected to MongoDB Atlas');

  let created = 0;
  let updated = 0;

  for (const account of DEMO_ACCOUNTS) {
    const passwordHash = await bcrypt.hash(account.password, 12);

    const existing = await User.findOne({ email: account.email });
    if (existing) {
      // Update the demo account (in case passwords/avatars changed)
      await User.updateOne(
        { email: account.email },
        {
          $set: {
            name: account.name,
            role: account.role,
            title: account.title,
            department: account.department,
            avatar: account.avatar,
            employeeId: account.employeeId,
            isDemo: true,
            companySlug: account.companySlug,
            passwordHash,
          },
        }
      );
      console.log(`🔄 Updated: ${account.name} (${account.role})`);
      updated++;
    } else {
      await User.create({
        name: account.name,
        email: account.email,
        passwordHash,
        role: account.role,
        title: account.title,
        department: account.department,
        avatar: account.avatar,
        employeeId: account.employeeId,
        isDemo: true,
        companySlug: account.companySlug,
      });
      console.log(`✨ Created: ${account.name} (${account.role})`);
      created++;
    }
  }

  console.log(`\n📦 Seed complete — Created: ${created}, Updated: ${updated}`);
  console.log('\nDemo accounts ready:');
  console.log('  marcus@novatech.demo  →  ADMIN       (password: demo123)');
  console.log('  sarah@novatech.demo   →  MANAGER     (password: demo123)');
  console.log('  rahul@novatech.demo   →  EMPLOYEE    (password: demo123)');
  console.log('  alex@novatech.demo    →  NEW_EMPLOYEE (password: demo123)');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
