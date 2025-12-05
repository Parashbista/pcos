const { MongoClient } = require('mongodb');

async function checkDatabase() {
  const uri = 'mongodb+srv://np03cs4a230009_db_user:Pcos2025@pcos.xfxctkf.mongodb.net/fyp_db?appName=pcos';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB Atlas');

    const db = client.db('fyp_db');
    
    // List all collections
    const collections = await db.listCollections().toArray();
    console.log('\n📁 Collections:');
    collections.forEach(col => console.log(`  - ${col.name}`));

    // Check users collection
    const usersCount = await db.collection('users').countDocuments();
    console.log(`\n👥 Users: ${usersCount}`);
    
    if (usersCount > 0) {
      const users = await db.collection('users').find({}, { projection: { password: 0 } }).toArray();
      console.log('Users data:', JSON.stringify(users, null, 2));
    }

    // Check mood entries
    const moodCount = await db.collection('mood_entries').countDocuments();
    console.log(`\n😊 Mood entries: ${moodCount}`);
    
    if (moodCount > 0) {
      const moods = await db.collection('mood_entries').find({}).limit(5).toArray();
      console.log('Recent mood entries:', JSON.stringify(moods, null, 2));
    }

    // Check period entries
    const periodCount = await db.collection('period_entries').countDocuments();
    console.log(`\n🩸 Period entries: ${periodCount}`);
    
    if (periodCount > 0) {
      const periods = await db.collection('period_entries').find({}).limit(5).toArray();
      console.log('Recent period entries:', JSON.stringify(periods, null, 2));
    }

    // Check sleep entries
    const sleepCount = await db.collection('sleep_entries').countDocuments();
    console.log(`\n😴 Sleep entries: ${sleepCount}`);
    
    if (sleepCount > 0) {
      const sleep = await db.collection('sleep_entries').find({}).limit(5).toArray();
      console.log('Recent sleep entries:', JSON.stringify(sleep, null, 2));
    }

  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error.message);
  } finally {
    await client.close();
  }
}

checkDatabase();
