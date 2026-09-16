const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const Company = require('./models/Company');
const Lead = require('./models/Lead');

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Company.deleteMany({});
    await Lead.deleteMany({});

    // Create a demo company
    const passwordHash = await bcrypt.hash('admin123', 10);
    const company = await Company.create({
      name: 'Demo Solar Solutions',
      subdomain: 'demo-solar',
      ownerEmail: 'admin@demo.com',
      passwordHash,
      websiteUrl: 'https://demosolar.com'
    });
    console.log('Created company:', company.name);

    // Create sample leads
    const leads = [
      { name: 'Rajesh Kumar', phone: '9876543210', email: 'rajesh@example.com', source: 'Form', message: 'Interested in solar panel installation for our factory in Pune. We need a complete energy audit and cost analysis for our manufacturing unit.', score: 'hot', status: 'new' },
      { name: 'Priya Sharma', phone: '9876543211', email: 'priya@example.com', source: 'Google', message: 'Looking for industrial automation solutions for our plant.', score: 'warm', status: 'contacted' },
      { name: 'Amit Patel', phone: '9876543212', email: 'amit@example.com', source: 'ROIcalc', message: 'ROI Calculator results look promising. Want to discuss further.', score: 'warm', status: 'proposal' },
      { name: 'Sneha Desai', phone: '9876543213', email: 'sneha@example.com', source: 'WhatsApp', message: 'Hi, I saw your advertisement about solar energy solutions. Can you share more details about pricing and installation timeline for a 500 sq ft area?', score: 'hot', status: 'new' },
      { name: 'Vikram Singh', phone: '9876543214', email: 'vikram@example.com', source: 'Form', message: 'Quick inquiry about services.', score: 'cold', status: 'new' },
      { name: 'Meera Joshi', phone: '9876543215', email: 'meera@example.com', source: 'Google', message: 'Need energy audit for our 3-floor office building. Current monthly power bill is around 2 lakhs.', score: 'hot', status: 'contacted' },
      { name: 'Anil Verma', phone: '9876543216', email: 'anil@example.com', source: 'Form', message: 'Please send brochure.', score: 'cold', status: 'closed' },
      { name: 'Kavita Nair', phone: '9876543217', email: 'kavita@example.com', source: 'ROIcalc', message: 'The savings projection looks good. Our factory area is 2000 sq ft and monthly power bill is 1.5 lakhs.', score: 'hot', status: 'new' },
      { name: 'Suresh Reddy', phone: '9876543218', email: 'suresh@example.com', source: 'WhatsApp', message: 'Interested', score: 'cold', status: 'contacted' },
      { name: 'Pooja Gupta', phone: '9876543219', email: 'pooja@example.com', source: 'Google', message: 'We are a mid-size manufacturing company looking to reduce our energy costs. Please share your complete solution portfolio.', score: 'hot', status: 'proposal' },
      { name: 'Ravi Teja', phone: '9876543220', email: 'ravi@example.com', source: 'Form', message: 'Call me back.', score: 'cold', status: 'new' },
      { name: 'Deepa Iyer', phone: '9876543221', email: 'deepa@example.com', source: 'ROIcalc', message: 'Calculated savings of 40% on power bill. Want to proceed with detailed assessment.', score: 'hot', status: 'new' }
    ];

    for (const leadData of leads) {
      const logRetentionUntil = new Date();
      logRetentionUntil.setDate(logRetentionUntil.getDate() + 365);

      await Lead.create({
        companyId: company._id,
        ...leadData,
        logRetentionUntil,
        ip: '127.0.0.1',
        userAgent: 'Seed Data'
      });
    }
    console.log(`Created ${leads.length} sample leads`);

    console.log('\nSeed completed!');
    console.log('Login credentials:');
    console.log('  Subdomain: demo-solar');
    console.log('  Email: admin@demo.com');
    console.log('  Password: admin123');

    await mongoose.disconnect();
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed();
