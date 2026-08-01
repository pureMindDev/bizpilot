import mongoose from 'mongoose';
import { env } from '../config/env.js';

import Business from '../models/Business.js';
import Staff from '../models/Staff.js';
import Product from '../models/Product.js';
import Customer from '../models/Customer.js';
import Sale from '../models/Sale.js';
import Expense from '../models/Expense.js';
import Notification from '../models/Notification.js';
import Admin from '../models/Admin.js';
import Plan from '../models/Plan.js';
import Payment from '../models/Payment.js';
import Ticket from '../models/Ticket.js';
import AuditLog from '../models/AuditLog.js';
import PlatformNotification from '../models/PlatformNotification.js';
import RolePermission from '../models/RolePermission.js';
import PlatformSettings from '../models/PlatformSettings.js';

import {
  productCatalog, suppliers, customerFirstNames, customerLastNames, cities, staffRoster, expenseCatalog,
  businessNames, businessOwners, supportSubjects, platformNotifications, auditActionCatalog,
} from './data.js';

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (arr, i) => arr[i % arr.length];

const ALL_MODELS = [Business, Staff, Product, Customer, Sale, Expense, Notification, Admin, Plan, Payment, Ticket, AuditLog, PlatformNotification, RolePermission, PlatformSettings];

const destroy = async () => {
  console.log('[seed] Destroying all collections...');
  await Promise.all(ALL_MODELS.map((m) => m.deleteMany({})));
  console.log('[seed] Done. All collections are now empty.');
};

const seedPlans = async () => {
  const plans = [
    { name: 'Starter', price: 5000, userLimit: 2, productLimit: 200, storageLimit: '1 GB', color: '#64748B', features: ['Single branch', 'Basic reports', 'Email support', 'POS & inventory'] },
    { name: 'Growth', price: 15000, userLimit: 8, productLimit: 2000, storageLimit: '10 GB', color: '#2563EB', features: ['Up to 3 branches', 'Advanced reports', 'Priority support', 'Staff roles & permissions', 'Customer CRM'] },
    { name: 'Enterprise', price: 45000, userLimit: 50, productLimit: 50000, storageLimit: '100 GB', color: '#7C3AED', features: ['Unlimited branches', 'Custom reports', 'Dedicated support', 'API access', 'White-label option'] },
  ];
  await Plan.insertMany(plans);
  console.log(`[seed] Created ${plans.length} subscription plans`);
  return plans;
};

const seedAdmins = async () => {
  const roster = [
    ['Tolu Fashina', 'tolu@bizpilot.ng', 'Super Admin'],
    ['Kemi Adisa', 'kemi@bizpilot.ng', 'Support'],
    ['David Okoro', 'david@bizpilot.ng', 'Support'],
    ['Ronke Bakare', 'ronke@bizpilot.ng', 'Finance'],
    ['Chukwuma Igwe', 'chukwuma@bizpilot.ng', 'Developer'],
    ['Halima Sule', 'halima@bizpilot.ng', 'Operations'],
  ];
  const passwordHash = await Admin.hashPassword('bizpilot123');
  const admins = await Admin.insertMany(roster.map(([name, email, role]) => ({ name, email, role, passwordHash })));
  console.log(`[seed] Created ${admins.length} platform admin accounts (password: bizpilot123)`);
  return admins;
};

const seedRolePermissions = async () => {
  const modules = ['Dashboard', 'Businesses', 'Subscriptions', 'Payments', 'Users', 'Support', 'Notifications', 'Audit Logs', 'Settings', 'Roles & Permissions'];
  const full = () => Object.fromEntries(modules.map((m) => [m, { view: true, edit: true, delete: true }]));
  const readOnly = (editable = []) => Object.fromEntries(modules.map((m) => [m, { view: true, edit: editable.includes(m), delete: false }]));

  const docs = [
    { role: 'Super Admin', permissions: full() },
    { role: 'Support', permissions: readOnly(['Support', 'Notifications']) },
    { role: 'Finance', permissions: readOnly(['Subscriptions', 'Payments']) },
    { role: 'Developer', permissions: readOnly(['Settings']) },
    { role: 'Operations', permissions: readOnly(['Businesses', 'Subscriptions', 'Users', 'Support', 'Notifications']) },
  ];
  await RolePermission.insertMany(docs);
  console.log(`[seed] Created role permission matrix for ${docs.length} roles`);
};

const seedPlatformSettings = async () => {
  await PlatformSettings.create({});
  console.log('[seed] Created default platform settings');
};

const seedBusinessDeep = async (name, owner, index, plans) => {
  const plan = pick(['Starter', 'Growth', 'Enterprise'], index);
  const status = pick(['Active', 'Trial', 'Expired', 'Suspended'], index);
  const city = pick(cities, index);

  const business = await Business.create({
    name,
    owner,
    email: `${owner.split(' ')[0].toLowerCase()}@${name.split(' ')[0].toLowerCase()}.ng`,
    phone: `080${rand(10000000, 99999999)}`,
    city,
    plan,
    status,
    renewalDate: new Date(Date.now() + rand(-10, 45) * 86400000),
  });

  // Owner staff account (password: bizpilot123 for every seeded account).
  // emailVerified: true since these are demo accounts with no real inbox to check.
  const passwordHash = await Staff.hashPassword('bizpilot123');
  const ownerStaff = await Staff.create({
    business: business._id,
    name: owner,
    email: business.email,
    passwordHash,
    role: 'Owner',
    emailVerified: true,
    activity: [{ action: 'Account created' }],
  });

  // A handful of additional staff for the flagship demo business only, to keep the seed fast
  const staffCount = index === 0 ? staffRoster.length : rand(0, 2);
  for (let i = 0; i < staffCount; i += 1) {
    const [staffName, role] = staffRoster[i];
    await Staff.create({
      business: business._id,
      name: staffName,
      email: `${staffName.split(' ')[0].toLowerCase()}@${name.split(' ')[0].toLowerCase()}.ng`,
      passwordHash: await Staff.hashPassword('bizpilot123'),
      role,
      emailVerified: true,
      status: i === staffRoster.length - 1 && index === 0 ? 'suspended' : 'active',
    });
  }

  // Products
  const productCount = index === 0 ? productCatalog.length : rand(6, 12);
  const products = [];
  for (let i = 0; i < productCount; i += 1) {
    const [pname, category, cost, sell] = productCatalog[i % productCatalog.length];
    const stock = i % 7 === 0 ? rand(0, 8) : rand(10, 130);
    const product = await Product.create({
      business: business._id,
      name: pname,
      sku: `SKU-${index}-${(i + 1).toString().padStart(4, '0')}`,
      category,
      costPrice: cost,
      sellingPrice: sell,
      stock,
      reorderLevel: 15,
      supplier: pick(suppliers, i),
      barcode: `615${(1000000 + i * 37 + index).toString().slice(0, 9)}`,
    });
    products.push(product);
  }

  // Customers
  const customerCount = index === 0 ? 18 : rand(3, 8);
  const customers = [];
  for (let i = 0; i < customerCount; i += 1) {
    const first = pick(customerFirstNames, i);
    const last = pick(customerLastNames, i * 3);
    const customer = await Customer.create({
      business: business._id,
      name: `${first} ${last}`,
      email: `${first.toLowerCase()}.${last.toLowerCase()}@gmail.com`,
      phone: `080${rand(10000000, 99999999)}`,
      city: pick(cities, i),
      outstandingDebt: i % 4 === 0 ? rand(2000, 35000) : 0,
      notes: i % 5 === 0 ? 'Prefers transfer payments. Bulk buyer for events.' : '',
    });
    customers.push(customer);
  }

  // Sales — drives totalPurchases/orders/stock through the same logic the checkout endpoint uses
  const saleCount = index === 0 ? 40 : rand(5, 15);
  for (let i = 0; i < saleCount; i += 1) {
    const itemCount = rand(1, 3);
    const items = [];
    let subtotal = 0;
    for (let j = 0; j < itemCount; j += 1) {
      const product = products[rand(0, products.length - 1)];
      if (!product) continue;
      const qty = rand(1, 4);
      items.push({ product: product._id, name: product.name, price: product.sellingPrice, qty });
      subtotal += product.sellingPrice * qty;
    }
    if (items.length === 0) continue;
    const tax = Math.round(subtotal * 0.075);
    const discount = i % 6 === 0 ? Math.round(subtotal * 0.05) : 0;
    const total = subtotal + tax - discount;
    const customer = customers[rand(0, customers.length - 1)];
    const attributedCustomer = i % 3 === 0 && customer ? customer.name : 'Walk-in Customer';

    await Sale.create({
      business: business._id,
      items,
      subtotal,
      tax,
      discount,
      total,
      paymentMethod: pick(['Cash', 'Transfer', 'POS'], i),
      customer: attributedCustomer,
      cashier: index === 0 ? pick(['Precious Etim', 'Kunle Fashola', 'Rasheed Bello'], i) : owner,
      createdAt: new Date(Date.now() - i * 3600000 * 3.7),
    });

    if (attributedCustomer !== 'Walk-in Customer' && customer) {
      customer.totalPurchases += total;
      customer.orders += 1;
      await customer.save();
    }
  }

  // Expenses
  const expenseCount = index === 0 ? expenseCatalog.length : rand(2, 5);
  for (let i = 0; i < expenseCount; i += 1) {
    const [category, description, amount] = expenseCatalog[i % expenseCatalog.length];
    await Expense.create({
      business: business._id,
      category,
      description,
      amount,
      date: new Date(Date.now() - i * 86400000 * 5),
      recordedBy: owner,
    });
  }

  // A few notifications
  await Notification.create([
    { business: business._id, type: 'sale', title: 'New sale recorded', message: `A sale was completed at ${name}.`, read: index !== 0 },
    { business: business._id, type: 'stock', title: 'Low stock alert', message: 'One or more products are below their reorder level.', read: true },
  ]);

  // Payments (subscription invoices) for this business
  const planDoc = plans.find((p) => p.name === plan);
  for (let i = 0; i < rand(1, 4); i += 1) {
    await Payment.create({
      business: business._id,
      invoiceNo: `INV-2026${(1000 + index * 10 + i).toString().slice(1)}`,
      plan,
      amount: planDoc?.price || 5000,
      method: pick(['Paystack', 'Flutterwave', 'Stripe', 'Bank Transfer'], index + i),
      status: pick(['Paid', 'Paid', 'Paid', 'Pending', 'Failed'], index + i),
      date: new Date(Date.now() - (index + i) * 86400000 * 6),
    });
  }

  // A support ticket for roughly every other business
  if (index % 2 === 0) {
    await Ticket.create({
      business: business._id,
      subject: pick(supportSubjects, index),
      requester: owner,
      priority: pick(['Low', 'Medium', 'High', 'Urgent'], index),
      status: pick(['Open', 'In Progress', 'Resolved', 'Closed'], index),
      assignedTo: pick(['Kemi Adisa (Support)', 'David Okoro (Support)', 'Unassigned'], index),
      comments: [{ author: owner, text: 'This started happening recently. Please help.', internal: false }],
    });
  }

  return business;
};

const seedAuditLogs = async (businesses) => {
  const devices = ['Chrome on Windows', 'Safari on macOS', 'Chrome on Android', 'Firefox on Ubuntu', 'Safari on iOS'];
  const logs = Array.from({ length: 30 }).map((_, i) => {
    const a = auditActionCatalog[i % auditActionCatalog.length];
    return {
      action: a.action,
      category: a.category,
      user: pick(businessOwners, i),
      business: i % 3 === 0 ? pick(businesses, i)._id : undefined,
      ip: `197.210.${rand(0, 255)}.${rand(0, 255)}`,
      device: pick(devices, i),
      time: new Date(Date.now() - i * 3600000 * 3.2),
    };
  });
  await AuditLog.insertMany(logs);
  console.log(`[seed] Created ${logs.length} audit log entries`);
};

const seedPlatformNotifications = async () => {
  await PlatformNotification.insertMany(platformNotifications.map((n, i) => ({ ...n, read: i > 2 })));
  console.log(`[seed] Created ${platformNotifications.length} platform notifications`);
};

const run = async () => {
  await mongoose.connect(env.mongoUri, { serverSelectionTimeoutMS: 8000 });
  console.log(`[seed] Connected to ${env.mongoUri}`);

  if (process.argv.includes('--destroy')) {
    await destroy();
    await mongoose.disconnect();
    process.exit(0);
  }

  await destroy();

  const plans = await seedPlans();
  await seedAdmins();
  await seedRolePermissions();
  await seedPlatformSettings();

  const businesses = [];
  for (let i = 0; i < businessNames.length; i += 1) {
    console.log(`[seed] Seeding business ${i + 1}/${businessNames.length}: ${businessNames[i]}`);
    const business = await seedBusinessDeep(businessNames[i], businessOwners[i], i, plans);
    businesses.push(business);
  }

  await seedAuditLogs(businesses);
  await seedPlatformNotifications();

  console.log('\n[seed] Done! Demo logins:');
  console.log(`  Business owner — email: ${businesses[0].email}  password: bizpilot123`);
  console.log('  Super Admin    — email: tolu@bizpilot.ng        password: bizpilot123');

  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error('[seed] Failed:', err);
  process.exit(1);
});
