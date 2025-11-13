
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const admin = require('firebase-admin');
require('dotenv').config();

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Root route
app.get('/', (req, res) => {
  res.send('Server is running fine....');
});

// MongoDB URI
const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_Password}@cluster0.wcellxl.mongodb.net/?retryWrites=true&w=majority`;

// MongoClient setup
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// Firebase setup
// const serviceAccount = require('./surviceKey.json');

// if (!admin.apps.length) {
//   admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount),
//   });
// }

async function run() {
  try {
    // await client.connect()
    // console.log('✅ MongoDB Connected Successfully!');

    const db = client.db('CommunityCln');
    const issuesCollection = db.collection('AllIssue');
    const contributionsCollection = db.collection('mycontribute');
    const myissues = db.collection('myissues');

    // Get Latest 6 Data
    app.get('/latest-data', async (req, res) => {
      try {
        const latestIssues = await issuesCollection
          .find({})
          .sort({ date: -1 })
          .limit(6)
          .toArray();
        res.status(200).json(latestIssues);
      } catch (error) {
        console.error('Error fetching latest data:', error);
        res.status(500).json({ message: 'Server error' });
      }
    });

    // PUT: Update my issue by ID
    app.put('/myissues/:id', async (req, res) => {
      const id = req.params.id;
      const updatedData = req.body;
      try {
        const result = await myissues.updateOne(
          { _id: new ObjectId(id) },
          { $set: updatedData }
        );
        if (result.modifiedCount === 0) {
          return res
            .status(404)
            .json({ message: 'Issue not found or data unchanged' });
        }
        res.json({ message: 'Issue updated successfully', result });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to update issue' });
      }
    });

    // DELETE: Delete my issue by ID
    app.delete('/myissues/:id', async (req, res) => {
      const id = req.params.id;
      try {
        const result = await myissues.deleteOne({ _id: new ObjectId(id) });
        if (result.deletedCount === 0) {
          return res.status(404).json({ message: 'Issue not found' });
        }
        res.json({ message: 'Issue deleted successfully' });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to delete issue' });
      }
    });

    // GET all my issues
    app.get('/allmyissues', async (req, res) => {
      const result = await myissues.find().toArray();
      res.send(result);
    });

    app.get('/allmyissues/:id', async (req, res) => {
      const id = req.params.id;
      const result = await myissues.findOne({ _id: new ObjectId(id) });
      res.send(result);
    });

    // POST: Add my issue
    app.post('/myissue', async (req, res) => {
      const issues = req.body;
      const result = await myissues.insertOne(issues);
      res.send(result);
    });

    // POST: Add issue to AllIssue
    app.post('/issue', async (req, res) => {
      const issues = req.body;
      const result = await issuesCollection.insertOne(issues);
      res.send(result);
    });

    // POST: Save contribution
    app.post('/contributions', async (req, res) => {
      try {
        const contribution = req.body;
        console.log('Received Contribution:', contribution);
        const result = await contributionsCollection.insertOne(contribution);
        res.status(201).send(result);
      } catch (error) {
        res.status(500).send({ message: 'Failed to save contribution' });
      }
    });

    // GET all contributions
    app.get('/contrbutessssssssssss', async (req, res) => {
      try {
        const result = await contributionsCollection.find().toArray();
        res.send(result);
      } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Failed to fetch contributions' });
      }
    });

    // GET all issues
    app.get('/issue', async (req, res) => {
      try {
        const result = await issuesCollection.find().toArray();
        res.json(result);
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
      }
    });

    // GET single issue by ID
    app.get('/issue/:id', async (req, res) => {
      try {
        const id = req.params.id;
        const issue = await issuesCollection.findOne({ _id: new ObjectId(id) });
        if (!issue) {
          return res.status(404).json({ message: 'Issue not found' });
        }
        res.json(issue);
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
      }
    });

    // DELETE: Delete issue by ID
    app.delete('/issue/:id', async (req, res) => {
      const id = req.params.id;
      try {
        const result = await issuesCollection.deleteOne({
          _id: new ObjectId(id),
        });
        if (result.deletedCount === 0) {
          return res.status(404).json({ message: 'Issue not found' });
        }
        res.json({ message: 'Issue deleted successfully' });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to delete issue' });
      }
    });

    // PUT: Update issue by ID
    app.put('/issue/:id', async (req, res) => {
      const id = req.params.id;
      const updatedData = req.body;
      try {
        const result = await issuesCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: updatedData }
        );
        if (result.modifiedCount === 0) {
          return res
            .status(404)
            .json({ message: 'Issue not found or data unchanged' });
        }
        res.json({ message: 'Issue updated successfully', result });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to update issue' });
      }
    });

    //  Check MongoDB connection
    // await db.command({ ping: 1 });
    console.log('Pinged MongoDB. Connection active!');
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err);
  }
}

run().catch(console.dir);

// Start Server
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
