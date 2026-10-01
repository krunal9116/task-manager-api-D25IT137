const mongoose = require('mongoose');
const Task = require('./models/Task');

async function seedDatabase() {
  try {
    await mongoose.connect('mongodb://localhost:27017/task_manager_db');
    console.log('Connected to MongoDB');

    await Task.deleteMany({});
    console.log('Cleared old tasks');

    const sampleTasks = [
      {
        title: 'Complete Practical 5',
        description: 'Integrate MongoDB with Express and Mongoose',
        priority: 'high',
        completed: true
      },
      {
        title: 'Submit AWDF Lab Report',
        description: 'Prepare PDF report with screenshots',
        priority: 'medium',
        completed: false
      },
      {
        title: 'Prepare for Viva',
        description: 'Review Mongoose schema validation concepts',
        priority: 'low',
        completed: false
      }
    ];

    const inserted = await Task.insertMany(sampleTasks);
    console.log('✅ Successfully seeded sample tasks into MongoDB:');
    console.log(inserted);

    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding error:', err);
    process.exit(1);
  }
}

seedDatabase();
