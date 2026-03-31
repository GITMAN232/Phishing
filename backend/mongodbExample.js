// mongodbExample.js
// 
// This file demonstrates a simple, beginner-friendly connection to MongoDB Atlas using the native Node.js driver.
// It implements an "Activity Feed" collection, inserting 10 documents, querying them by date, and by ID.
//
// Prerequisites:
// 1. Ensure you have Node.js installed.
// 2. Install the official MongoDB driver and dotenv for environment variables:
//    npm install mongodb dotenv
//
// Running the script:
//    node mongodbExample.js
//

require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

// Fallback to a hardcoded string ONLY if the environment variable isn't set, though .env is preferred!
const uri = process.env.MONGO_URI || "mongodb+srv://<username>:<password>@cluster0.mongodb.net/?retryWrites=true&w=majority";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    console.log("⏳ Connecting to MongoDB Atlas...");
    await client.connect();
    console.log("✅ Successfully connected to MongoDB Atlas!");

    // Ensure we are using the correct database and collection
    const database = client.db("activity_db");
    const feedCollection = database.collection("activity_feed");

    // Clear existing data just to keep the run clean for this example
    await feedCollection.deleteMany({});
    console.log("🧹 Cleared existing temporary data in 'activity_feed'.");

    console.log("\n⏳ Inserting 10 realistic activity documents...");
    // Generate 10 sample activity feed entries with differing dates
    const activities = Array.from({ length: 10 }).map((_, i) => ({
        user: `User_${i + 1}`,
        action: i % 2 === 0 ? "POSTED" : "LIKED",
        target: i % 2 === 0 ? "New Photo" : "Comment",
        metadata: { ip: `192.168.1.${i}` },
        // Subtract seconds so each document has a distinct chronological timestamp
        timestamp: new Date(Date.now() - i * 10000) 
    }));

    const insertResult = await feedCollection.insertMany(activities);
    console.log(`✅ Inserted ${insertResult.insertedCount} documents successfully!`);

    console.log("\n⏳ Querying the 5 most recent activities...");
    // Sort by timestamp descending (-1) to get the newest first, and limit to 5
    const recentActivities = await feedCollection
        .find({})
        .sort({ timestamp: -1 })
        .limit(5)
        .toArray();

    recentActivities.forEach((activity, index) => {
        console.log(`  [${index + 1}] ${activity.user} ${activity.action} a ${activity.target} at ${activity.timestamp.toISOString()}`);
    });

    // Grab the ID of the very first inserted document to test querying by ID
    const sampleIdToFind = Object.values(insertResult.insertedIds)[0];
    
    console.log(`\n⏳ Querying a single document by its ObjectId (${sampleIdToFind})...`);
    // Find a single document using its _id (which must be wrapped in ObjectId)
    const singleDoc = await feedCollection.findOne({ _id: sampleIdToFind });
    console.log("✅ Found Document:", singleDoc);

  } catch (error) {
    // Basic error handling for connection or syntax crashes
    console.error("❌ A MongoDB error occurred:", error.message);
  } finally {
    // Always logically close the connection at the end
    console.log("\n🔌 Closing connection to Database.");
    await client.close();
  }
}

// Execute the async flow
run().catch(console.dir);
