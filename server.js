const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');  // for getting file paths
const bcrypt = require('bcrypt'); //for encryption

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.json()); 
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public'))); // for getting html,css,js files

// for loading first homepage when opening local host
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, 'public/home_page.html'));
});

mongoose.connect('mongodb+srv://alstingloria:0chacko0@cluster0.bbfhx.mongodb.net/test', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.log('MongoDB connection error:', err));

// mongoose schema for student details
const studentSchema = new mongoose.Schema({
    name: String,
    email: String,
    phoneNo: String,
    age: Number,
    dob: Date,
    aadharNo: String,
    username: String,
    password: String
});

const student = mongoose.model('Student', studentSchema);

// signup student post request
app.post('/signupStudent', async (req, res) => {
    const studentData = new student(req.body);
    studentData.password = await bcrypt.hash(studentData.password, 10);
    studentData.aadharNo = await bcrypt.hash(studentData.aadharNo, 10);
    try {
        await studentData.save();
        res.redirect('/home_page.html?message=success');
    } catch (err) {
        console.log(err);
        res.status(500).send('Error saving data');
    }
});

//job poster mongoose schema
const jobPosterSchema = new mongoose.Schema({
    name: String,
    email: String,
    phoneNo: String,
    address: String,
    username: String,
    password: String
});

const jobPoster = mongoose.model('JobPoster', jobPosterSchema);

// signup jon poster post request
app.post('/signupJobPoster', async (req, res) => {
    const jobPosterData = new jobPoster(req.body);
    jobPosterData.password = await bcrypt.hash(jobPosterData.password, 10);
    try {
        await jobPosterData.save();
        res.redirect('/home_page.html?message=success');
    } catch (err) {
        console.log(err);
        res.status(500).send('Error saving data');
    }
});

// login post request
app.post('/login', async (req, res) => {
    const { username, password, role } = req.body;
    let user;


    console.log(`Login attempt: Username: ${username}, Role: ${role}`);

    if (role === 'student') {
        user = await student.findOne({ username });
    } else if (role === 'job_poster') {
        user = await jobPoster.findOne({ username });
    }

    if (user) {
        const match = await bcrypt.compare(password, user.password);
        if (match) {
            if (role == 'student'){
              response = { message: 'Login successful', userid: user._id };
              res.redirect(`/student_dashboard.html?studentId=${user._id}`); // redirect and find the user using the url parms method
            }
            else if (role == 'job_poster'){
              response = { message: 'Login successful', userid: user._id };
              res.redirect(`/jobPoster_dashboard.html?jobPosterId=${user._id}`);
            }
        } else {
            console.log('Incorrect password'); 
            res.redirect('/login_page.html?error=Incorrect user credentials');
        }
    } else {
        console.log('User not found'); 
        res.redirect('/login_page.html?error=Incorrect user credentials'); 
    }
});

// loading the student profile
app.get(`/student-profile`, async (req, res) => {
    const studentID = req.query.studentId;  
    try {
        const data = await student.findOne({ _id: studentID });  
        if (!data) {
            return res.status(404).json({ message: 'Student not found' });  
        }
        console.log(data);
        res.json(data); 
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' }); 
    }
});

// this is for loading the profile of jobPoster when clicking jobPoster profile button
app.get('/job-poster-profile', async (req, res) => {
  const jobPosterId = req.query.jobPosterId;  
  try {
      const data = await jobPoster.findOne({ _id: jobPosterId });  
      if (!data) {
          return res.status(404).json({ message: 'Job Poster not found' });  
      }
      res.json(data); 
  } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' }); 
  }
});



//adithya code from here

// student details schema is made here but we need to first check how we are going to make the db tables not in current usage so leaving it as comments
/* const studentSchema2 = new mongoose.Schema({
  studentId: { type: Number},
  name: String,
  email: String,
  phoneNo: String,
  age: Number,
  dob: Date,
  aadharNo: String,
  username: String,
  password: String,
  earnings: Number,
  previousActivities: [String],
}, { collection: 'studentDetails' }); 
*/

// schema for the job table
const jobSchema = new mongoose.Schema({
  title: String,
  description: String,
  location: String,
  payment: Number,
  status: String
}, { collection: 'job' });

// the below line is the model for studentDetails table which is not currently in use will later decide what to do with it
// const Student1 = mongoose.model('Student1', studentSchema2);

const Job = mongoose.model('Job', jobSchema);

/* the below post request is handled above, so this is commented if required later will use if needed

app.get("/student-profile", async (req, res) => {
  const studentId = req.query._id;  
  console.log("Received ID:", studentId);

  try {

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ message: "Invalid student ID" });
    }

    const student = await Student1.findById(mongoose.Types.ObjectId(studentId));
    
    console.log("Found student:", student);  

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json(student);
  } catch (err) {
    console.error("Error fetching student:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});
*/

//post request for getting job listed
app.get("/job-listings", async (req, res) => {
  try {
    const jobs = await Job.find();
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// updating the job status to db using patch
app.patch('/update-job-status', async (req, res) => {
  try {
    const { jobId, status } = req.body;
    const job = await Job.findByIdAndUpdate(jobId, { status }, { new: true });
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.json(job);
  } catch (error) {
    res.status(500).json({ message: 'Error updating job status', error });
  }
});

// Route to accept a job
app.patch('/accept-job', async (req, res) => {
  const { jobId, studentId } = req.body;
  const job = await Job.findById(jobId);
  if (!job) {
      return res.status(404).send('Job not found');
  }
  job.status = 'accepted';
  job.studentId = studentId;
  await job.save();

  // Notify the job poster
  io.to(job.jobPosterId.toString()).emit('jobAccepted', { jobId: job._id, studentId });

  res.send('Job accepted');
});

// Route to get jobs posted by a specific job poster
app.get('/jobs', async (req, res) => {
    const jobPosterId = req.query.jobPosterId;
    if (!jobPosterId) {
        return res.status(400).json({ message: 'Job Poster ID is required' });
    }
    try {
        const jobs = await Job.find({ jobPosterId });
        res.json(jobs);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Socket.io connection
io.on('connection', (socket) => {
  console.log('New client connected');

  // Join room for job poster
  socket.on('joinRoom', (jobPosterId) => {
      socket.join(jobPosterId);
  });

  socket.on('disconnect', () => {
      console.log('Client disconnected');
  });
});

// advaitha code

// Route to insert job data
app.post('/addData', async (req, res) => {
  const { name, value } = req.body; // 'name' is the job title, 'value' contains description and payment
  if (!name || !value || !value.description || !value.payment) {
      return res.status(400).send({ error: 'Missing required fields' });
  }

  try {
      const result = await Job.create({    // i changed the collection in your code to Job since it is the variable name i have used above for this collection model
          title: name, // Job title
          description: value.description, // Job description
          payment: value.payment, // Payment amount
          status: "waiting"  // i added the staus will inserting as well to show it for the student
      });
      res.status(200).send({ message: 'Job uploaded successfully!', id: result.insertedId });
  } catch (err) {
      console.error('Insert Error:', err);
      res.status(500).send({ error: 'Failed to insert job' });
  }
});


/* the code below is not being used anywhere as of now i was not sure what is was for but i guess we can discuss later 
app.get('/getJobs', async (req, res) => {
  try {
      const jobs = await collection.find().toArray();
      res.status(200).json(jobs);
  } catch (err) {
      console.error('Fetch Error:', err);
      res.status(500).send({ error: 'Failed to fetch jobs' });
  }
});
*/
app.post('/remove-job-poster', async (req, res) => {
  const { jobPosterId } = req.body;
  try {
      const result = await jobPoster.findByIdAndDelete(jobPosterId);
      if (!result) {
          return res.status(404).json({ message: 'Job poster not found' });
      }
      res.json({ message: 'Job poster removed successfully' });
  } catch (error) {
      console.error('Error removing job poster:', error);
      res.status(500).json({ message: 'Error removing job poster' });
  }
});


// we are using port 5000 
const port = 5000;
server.listen(port, () => {
    console.log(`Backend server running on http://localhost:5000`);
});
