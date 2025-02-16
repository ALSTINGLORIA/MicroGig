const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');  
const bcrypt = require('bcrypt');
const crypto = require('crypto'); 


const app = express();
app.use(express.json()); 
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public'))); 


app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, 'public/home_page.html'));
});

mongoose.connect('mongodb+srv://alstingloria:0chacko0@cluster0.bbfhx.mongodb.net/', {});


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


const jobPosterSchema = new mongoose.Schema({
    name: String,
    email: String,
    phoneNo: String,
    address: String,
    username: String,
    password: String
});

const jobPoster = mongoose.model('JobPoster', jobPosterSchema);


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
              res.redirect(`/student_dashboard.html?studentId=${user._id}`); 
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


app.get('/job-details', async (req, res) => {
  const jobId = req.query.jobId;  
  try {
      const data = await Job.findOne({ _id: jobId });  
      if (!data) {
          return res.status(404).json({ message: 'Job Poster not found' });  
      }
      res.json(data); 
  } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' }); 
  }
});

const acceptedJobSchema = new mongoose.Schema({
  jobPosterId: String,
  studentId: String,
  jobId: String, 
  studentName: String,
  email: String,
  phoneNo: String,
  title: String,
  description: String,
  location: String,
  payment: Number,
  status: String,
  time: String,
  day: String
});

const acceptedJob = mongoose.model('acceptedjobs', acceptedJobSchema);

app.get('/accepted-jobs', async (req, res) => {
 
  const jobPosterId = req.query.jobPosterId;  
  try {
      const jobs = await acceptedJob.find({ jobPosterId: jobPosterId });  
      if (!jobs.length) {
          return res.status(404).json({ message: 'No accepted jobs found for this job poster.' });  
      }
      res.json(jobs); 
  } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' }); 
  }
});

app.get('/student-accepted-jobs', async (req, res) => {
 
  const studentId = req.query.studentId;  
  try {
      const jobs = await Job.find({ studentId: studentId });  
      if (!jobs.length) {
          return res.status(404).json({ message: 'No accepted jobs found for this job poster.' });  
      }
      res.json(jobs); 
  } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' }); 
  }
});



const jobSchema = new mongoose.Schema({
  title: String,
  description: String,
  location: String,
  payment: Number,
  status: String,
  time: String,
  day: String,
  jobPosterId: String,
  studentId: String,
}, { collection: 'job' });



const Job = mongoose.model('Job', jobSchema);





app.get("/job-listings", async (req, res) => {
  try {
    const jobs = await Job.find();
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});


app.patch('/update-job-status', async (req, res) => {
  try {
    const { jobId,studentId, status } = req.body;
    const job = await Job.findByIdAndUpdate(jobId, { status,studentId }, { new: true });
    const jobData = await Job.findOne({ _id: jobId }); 
    const data = await student.findOne({ _id: studentId }); 
    const result = await acceptedJob.create({
      studentId: studentId,
      jobPosterId: jobData.jobPosterId,
      jobId: jobId,   
      title: jobData.title, 
      description: jobData.description,
      location: jobData.location,
      payment: jobData.payment,
      time: jobData.time,
      day: jobData.day, 
      studentName: data.name,
      email: data.email,
      phoneNo: data.phoneNo

  });
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.json(job);
  } catch (error) {
    res.status(500).json({ message: 'Error updating job status', error });
  }
});




app.post('/addData', async (req, res) => {
  const { name, value } = req.body; 
  if (!name || !value || !value.description || !value.payment || !value.time || !value.day || !value.location) {

      return res.status(400).send({ error: 'Missing required fields' });
  }

  try {
      const timeValue = `${value.time} ${value.jobAmPm}`;
      const result = await Job.create({    
          title: name,
          description: value.description,
          payment: value.payment, 
          status: "waiting", 
          time: timeValue, 
          day: value.day, 
          location: value.location, 
          jobPosterId: value.jobPosterId,
          studentId: "",
      });
      res.status(200).send({ message: 'Job uploaded successfully!', id: result.insertedId });
  } catch (err) {
      console.error('Insert Error:', err);
      res.status(500).send({ error: 'Failed to insert job' });
  }
});


app.post('/canceljob', async (req, res) => {
    const { jobId } = req.body;
    try {
 
        const job = await Job.findByIdAndUpdate(jobId, 
            { status: 'waiting', studentId: "" }, 
            { new: true }
        );
        
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        await acceptedJob.deleteOne({ jobId: jobId });
        
        res.json({ message: 'Job cancelled successfully', job });
    } catch (error) {
        console.error('Error cancelling job:', error);
        res.status(500).json({ message: 'Error cancelling job' });
    }
});


app.get('/check-job-today-poster', async (req, res) => {
    const { jobPosterId } = req.query;
    
    try {
        const today = new Date().toISOString().split('T')[0];
        console.log(today);
        const currentHour = new Date().getHours();
        console.log(currentHour);
        
        const jobs = await acceptedJob.find({ 
            jobPosterId: jobPosterId,
            day: today
        });
        console.log(jobs);

        const upcomingJobs = jobs.filter(job => {
          if((job.time.split(':')[1].slice(-2)) == "PM"){
            const jobHour = parseInt(job.time.split(':')[0]) + 14;
            console.log(job.time.split(':')[0]);
            return Math.abs(jobHour - currentHour) <= 1;
          }
          else if ((job.time.split(':')[1].slice(-2)) == "AM"){
            const jobHour = parseInt(job.time.split(':')[0]) - 1;
            return Math.abs(jobHour - currentHour) <= 1;
          }
        });
        console.log(upcomingJobs);
        res.json(upcomingJobs);
    } catch (error) {
        console.error('Error checking jobs:', error);
        res.status(500).json({ message: 'Error checking jobs' });
    }
});

app.get('/check-job-today-student', async (req, res) => {
  const { studentId } = req.query;
  
  try {
      const today = new Date().toISOString().split('T')[0];
      console.log(today);

      const currentHour = new Date().getHours();
      console.log(currentHour);

      const jobs = await acceptedJob.find({ 
          studentId: studentId,
          day: today
      });

      const upcomingJobs = jobs.filter(job => {
        if((job.time.split(':')[1].slice(-2)) == "PM"){
          const jobHour = parseInt(job.time.split(':')[0]) + 14;
          console.log(job.time.split(':')[0]);
          return Math.abs(jobHour - currentHour) <= 1;
        }
        else if ((job.time.split(':')[1].slice(-2)) == "AM"){
          const jobHour = parseInt(job.time.split(':')[0]) - 1;
          return Math.abs(jobHour - currentHour) <= 1;
        }
      });
      res.json(upcomingJobs);
  } catch (error) {
      console.error('Error checking jobs:', error);
      res.status(500).json({ message: 'Error checking jobs' });
  }
});

app.get('/jobPoster-completion', async (req, res) => {
  const jobId  = req.query.jobId;
  
  try {
      const JobInfo = await acceptedJob.findOne({ 
          _id: jobId
      });
      
      res.json(JobInfo);
  } catch (error) {
      console.error('Error checking jobs:', error);
      res.status(500).json({ message: 'Error checking jobs' });
  }
});

app.get('/student-completion', async (req, res) => {
  const jobId  = req.query.jobId;
  
  try {
      const JobInfo = await acceptedJob.findOne({ 
          _id: jobId
      });
      
      res.json(JobInfo);
  } catch (error) {
      console.error('Error checking jobs:', error);
      res.status(500).json({ message: 'Error checking jobs' });
  }
});

const otpSchema = new mongoose.Schema({
  otp: Number,
  jobId: String,
  completion: String
}, { collection: 'otp' });


const Otp = mongoose.model('Otp', otpSchema);


app.post('/jobPoster-otp', async (req, res) => {
  const jobId  = req.query.jobId;
    try {
        const otpNumber = crypto.randomInt(100000, 999999);
        const otpData =  new Otp({
          otp: otpNumber,
          jobId: jobId,
          completion: "pending"
        });
        await otpData.save();
        res.json({otpNumber});
    } catch (error) {
        console.error('Error generating OTP:', error);
        res.status(500).json({ message: 'Error generating OTP' });
    }
});


app.post('/verify-otp', async (req, res) => {
    const { otp, jobId } = req.body;
    
    try {
        const otpRecord = await Otp.findOne({ jobId });
        
        if (!otpRecord) {
            return res.status(404).json({ message: 'No OTP found for this job' });
        }

        if (otpRecord.otp === parseInt(otp)) {
          await Otp.findOneAndUpdate({ jobId }, 
            { completion: 'completed' }, 
            { new: true }
          );
            res.json({ message: 'OTP verification successful' });
        } else {
            res.status(400).json({ message: 'Invalid OTP' });
        }
    } catch (error) {
        console.error('Error verifying OTP:', error);
        res.status(500).json({ message: 'Error verifying OTP' });
    }
});


const port = 5000;

app.listen(port, () => {
    console.log(`Backend server running on http://localhost:5000`);
});
