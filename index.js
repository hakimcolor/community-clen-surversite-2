const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose'); // mongoose added
const admin = require('firebase-admin');
require('dotenv').config();

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// root route
app.get('/', (req, res) => {
  res.send('Server is running fine....');
});

// mongodb uri
const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_Password}@cluster0.wcellxl.mongodb.net/?retryWrites=true&w=majority`;

// mongoose connection
mongoose
  .connect(uri, { dbName: 'CommunityCln' })
  .then(() => console.log('Mongoose Connected Successfully!'))
  .catch((err) => console.error('Mongoose connection failed:', err));

// firebase setup
// const serviceAccount = require('./surviceKey.json');
// if (!admin.apps.length) {
//   admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount),
//   });
// }

// mongoose schemas and models

// AllIssue collection
const issueSchema = new mongoose.Schema({}, { strict: false });
const Issue = mongoose.model('Issue', issueSchema, 'AllIssue');

// mycontribute collection
const contributionSchema = new mongoose.Schema({}, { strict: false });
const Contribution = mongoose.model(
  'Contribution',
  contributionSchema,
  'mycontribute'
);

// myissues collection
const myIssueSchema = new mongoose.Schema({}, { strict: false });
const MyIssue = mongoose.model('MyIssue', myIssueSchema, 'myissues');

// get latest 6 data
app.get('/latest-data', async (req, res) => {
  try {
    const latestIssues = await Issue.find({}).sort({ date: -1 }).limit(6);
    res.status(200).json(latestIssues);
  } catch (error) {
    console.error('Error fetching latest data:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// put: update my issue by id
app.put('/myissues/:id', async (req, res) => {
  const id = req.params.id;
  const updatedData = req.body;
  try {
    const result = await MyIssue.findByIdAndUpdate(
      id,
      { $set: updatedData },
      { new: true }
    );
    if (!result) {
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

// delete: delete my issue by id
app.delete('/myissues/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const result = await MyIssue.findByIdAndDelete(id);
    if (!result) {
      return res.status(404).json({ message: 'Issue not found' });
    }
    res.json({ message: 'Issue deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to delete issue' });
  }
});

// get all my issues
app.get('/allmyissues', async (req, res) => {
  const result = await MyIssue.find();
  res.send(result);
});

// get single my issue by id
app.get('/allmyissues/:id', async (req, res) => {
  const id = req.params.id;
  const result = await MyIssue.findById(id);
  res.send(result);
});

// post: add my issue
app.post('/myissue', async (req, res) => {
  const issues = req.body;
  const result = await MyIssue.create(issues);
  res.send(result);
});

// post: add issue to AllIssue
app.post('/issue', async (req, res) => {
  const issues = req.body;
  const result = await Issue.create(issues);
  res.send(result);
});

// post: save contribution
app.post('/contributions', async (req, res) => {
  try {
    const contribution = req.body;
    const result = await Contribution.create(contribution);
    res.status(201).send(result);
  } catch (error) {
    res.status(500).send({ message: 'Failed to save contribution' });
  }
});

// get all contributions
app.get('/contrbutessssssssssss', async (req, res) => {
  try {
    const result = await Contribution.find();
    res.send(result);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Failed to fetch contributions' });
  }
});

// get all issues
app.get('/issue', async (req, res) => {
  try {
    const result = await Issue.find();
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// get single issue by id
app.get('/issue/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const issue = await Issue.findById(id);
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }
    res.json(issue);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// delete: delete issue by id
app.delete('/issue/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const result = await Issue.findByIdAndDelete(id);
    if (!result) {
      return res.status(404).json({ message: 'Issue not found' });
    }
    res.json({ message: 'Issue deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to delete issue' });
  }
});

// put: update issue by id
app.put('/issue/:id', async (req, res) => {
  const id = req.params.id;
  const updatedData = req.body;
  try {
    const result = await Issue.findByIdAndUpdate(
      id,
      { $set: updatedData },
      { new: true }
    );
    if (!result) {
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

// start server
app.listen(port, () => {
  console.log(`server running on port ${port}`);
});
