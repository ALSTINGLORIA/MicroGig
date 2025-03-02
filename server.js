const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');  
const bcrypt = require('bcrypt');
const crypto = require('crypto'); 
const cron = require('node-cron');


const app = express();
app.use(express.json()); 
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public'))); 

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, 'public/home_page.html'));
});

mongoose.connect('mongodb+srv://alstingloria:0chacko0@cluster0.bbfhx.mongodb.net/', {});

const blacklistSchema = new mongoose.Schema({
    aadharNo: String
}, { collection: 'blacklist' });

const blacklist = mongoose.model('blacklist', blacklistSchema);

const studentSchema = new mongoose.Schema({
    name: String,
    email: String,
    phoneNo: String,
    age: Number,
    dob: Date,
    aadharNo: String,
    username: String,
    password: String,
    cancelled: Number
});

const student = mongoose.model('Student', studentSchema);

app.post('/signupStudent', async (req, res) => {
    const studentData = new student(req.body);
    const blacklistedPasswords = await blacklist.find();

    let isBlacklisted = false;

for (const blacklisted of blacklistedPasswords) {
  const match = await bcrypt.compare(studentData.aadharNo, blacklisted.aadharNo);
  if (match) {
    isBlacklisted = true;
    break;
  }
}

    if(isBlacklisted == false){
    studentData.password = await bcrypt.hash(studentData.password, 10);
    studentData.aadharNo = await bcrypt.hash(studentData.aadharNo, 10);
    studentData.cancelled = 0;
    try {
        await studentData.save();
        res.redirect('/home_page.html?message=success');
    } catch (err) {
        console.log(err);
        res.status(500).send('Error saving data');
    }
    }
    else{
        res.redirect('/home_page.html?message=blacklisted');
    }
});

const jobPosterSchema = new mongoose.Schema({
    name: String,
    email: String,
    phoneNo: String,
    address: String,
    username: String,
    password: String,
    aadharNo: String,
    report: Number
});

const jobPoster = mongoose.model('JobPoster', jobPosterSchema);

app.post('/signupJobPoster', async (req, res) => {
    const jobPosterData = new jobPoster(req.body);
    const blacklistedPasswords = await blacklist.find();

    let isBlacklisted = false;

for (const blacklisted of blacklistedPasswords) {
  const match = await bcrypt.compare(jobPosterData.aadharNo, blacklisted.aadharNo);
  if (match) {
    isBlacklisted = true;
    break;
  }
}
if(isBlacklisted == false){
    jobPosterData.password = await bcrypt.hash(jobPosterData.password, 10);
    jobPosterData.aadharNo = await bcrypt.hash(jobPosterData.aadharNo, 10);
    jobPosterData.report = 0;
    try {
        await jobPosterData.save();
        res.redirect('/home_page.html?message=success');
    } catch (err) {
        console.log(err);
        res.status(500).send('Error saving data');
    }
}
else if(isBlacklisted == true){
    res.redirect('/home_page.html?message=blacklisted');
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
  day: String,
  duration: String
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

app.get('/accepted-jobs-cancel-rate', async (req, res) => {
  
    try {
        const rates = await student.find();  
        if (!rates.length) {
            return res.status(404).json({ message: 'No accepted jobs found for this job poster.' });  
        }
        res.json(rates); 
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' }); 
    }
  });

app.post('/student-report', async (req, res) => {
    const { jobId, reason } = req.body;
    try {
        const acceptedJobData = await acceptedJob.findOne({ _id:jobId });
        if (!acceptedJobData) {
            return res.status(404).json({ message: 'Accepted job not found' });
        }
        const jobPosterId = acceptedJobData.jobPosterId;
        if(reason == "payment_not_done" || reason == "jobPoster_harassing"){
        await jobPoster.findByIdAndUpdate(jobPosterId, { $inc: { report: 2 } });
        res.status(200).json({ message: 'Job poster reported successfully' });
        }
        else if(reason == "jobPoster_not_available" || reason == "jobPoster_cancelled_without_reason"){
            await jobPoster.findByIdAndUpdate(jobPosterId, { $inc: { report: 1 } });
            res.status(200).json({ message: 'Job poster reported successfully' });
        }
        else if(reason == "jobPoster_cancelled_due_to_circumstances"){
            res.status(200).json({ message: 'Job poster reported successfully' });
        }
    } catch (error) {
        console.error('Error reporting job poster:', error);
        res.status(500).json({ message: 'Error reporting job poster' });
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
  duration: String,
  jobPosterId: String,
  studentId: String
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
    const jobData = await Job.findOne({ _id: jobId }); 
    const data = await student.findOne({ _id: studentId }); 

    const matchingJobs = await acceptedJob.find({ 
      studentId: studentId,
    });

    const conflict = matchingJobs.some((jobers) => {
      return jobers.day === jobData.day && jobers.time === jobData.time;
    });
    if (conflict) {
      res.json({ message: 'Already accepted job at this time' });
    } else {
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
        phoneNo: data.phoneNo,
        duration: jobData.duration
      });
      const job = await Job.findByIdAndUpdate(jobId, { status, studentId }, { new: true });
      res.json(job); 
    }
  } catch (error) {
    res.status(500).json({ message: 'Error updating job status', error });
  }
});

app.post('/addData', async (req, res) => {
  const { name, value } = req.body; 
  if (!name || !value || !value.description || !value.payment || !value.time || !value.day || !value.location) {
      return res.status(400).send({ error: 'Missing required fields' });
  }
  function calculateTotalPayment(timeString, paymentPerHour) {
    const [hours, minutes] = timeString.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes;


    const totalHours = totalMinutes / 60;

    const totalPayment = totalHours * paymentPerHour;

    return Math.round(totalPayment); 
}


const timeWorked = value.jobDuration; 
const paymentPerHour = value.payment;
const totalPay = calculateTotalPayment(timeWorked, paymentPerHour); 

  try {
      const timeValue = `${value.time} ${value.jobAmPm}`;
      const result = await Job.create({    
          title: name,
          description: value.description,
          payment: totalPay, 
          status: "waiting", 
          time: timeValue, 
          day: value.day, 
          location: value.location, 
          jobPosterId: value.jobPosterId,
          duration: value.jobDuration,
          studentId: "",
      });
      res.status(200).send({ message: 'Job uploaded successfully!', id: result.insertedId });
  } catch (err) {
      console.error('Insert Error:', err);
      res.status(500).send({ error: 'Failed to insert job' });
  }
});

app.post('/canceljob', async (req, res) => {
    const { jobId, studentId } = req.body;
    try {
        await student.findByIdAndUpdate(studentId, 
            { $inc: { cancelled: 1 } }, 
            { new: true }
        );

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
            const currentMinute = new Date().getMinutes();
            console.log(currentHour, currentMinute);
    
            // Function to convert "HH:MM AM/PM" to minutes since midnight
            function convertToMinutes(timeStr) {
                const [time, modifier] = timeStr.split(' ');
                let [hours, minutes] = time.split(':').map(Number);
                
                if (modifier === 'PM' && hours !== 12) {
                    hours += 12;
                } else if (modifier === 'AM' && hours === 12) {
                    hours = 0;
                }
    
                return hours * 60 + minutes;
            }
    
            const jobs = await acceptedJob.find({ 
                jobPosterId: jobPosterId,
                day: today
            });
            
            const jobDetails = await Job.find({ 
                jobPosterId: jobPosterId,
                day: today,
                status: 'accepted'
            });
    
            const currentTotalMinutes = currentHour * 60 + currentMinute;
    
            const upcomingJobs = jobs.filter(job => {
                const matchingJobDetail = jobDetails.find(jobDetail => jobDetail._id == job.jobId);
                
                if (matchingJobDetail) {
                    const jobTime = matchingJobDetail.time; // Assuming this is in "HH:MM AM/PM" format
                    const jobTotalMinutes = convertToMinutes(jobTime);
    
                    // Check if job time is within ±5 minutes of the current time
                    if (Math.abs(jobTotalMinutes - currentTotalMinutes) <= 5) {
                        return true;
                    }
                }
                return false;
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
    const currentMinute = new Date().getMinutes();
    console.log(currentHour, currentMinute);

    // Function to convert "HH:MM AM/PM" to minutes since midnight
    function convertToMinutes(timeStr) {
        const [time, modifier] = timeStr.split(' ');
        let [hours, minutes] = time.split(':').map(Number);
        
        if (modifier === 'PM' && hours !== 12) {
            hours += 12;
        } else if (modifier === 'AM' && hours === 12) {
            hours = 0;
        }

        return hours * 60 + minutes;
    }

    const jobs = await acceptedJob.find({ 
        studentId: studentId,
        day: today
    });
    
    const jobDetails = await Job.find({ 
        studentId: studentId,
        day: today,
        status: 'accepted'
    });

    const currentTotalMinutes = currentHour * 60 + currentMinute;

    const upcomingJobs = jobs.filter(job => {
        const matchingJobDetail = jobDetails.find(jobDetail => jobDetail._id == job.jobId);
        
        if (matchingJobDetail) {
            const jobTime = matchingJobDetail.time; // Assuming this is in "HH:MM AM/PM" format
            const jobTotalMinutes = convertToMinutes(jobTime);

            // Check if job time is within ±5 minutes of the current time
            if (Math.abs(jobTotalMinutes - currentTotalMinutes) <= 5) {
                return true;
            }
        }
        return false;
    });

    console.log(upcomingJobs);
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

      const otpRecord = await Otp.findOne({ jobId });

      
      res.json({
        jobInfo: JobInfo,
        completion: otpRecord ? otpRecord.completion : null
      });
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
        const otpRecord = await Otp.findOne({ jobId });
        
        if (!otpRecord) {
          const otpNumber = crypto.randomInt(100000, 999999);
          const otpData =  new Otp({
            otp: otpNumber,
            jobId: jobId,
            completion: "pending"
          });
          await otpData.save();
          res.json({otpNumber});
        }
        else if(otpRecord){
          const otpNumber = crypto.randomInt(100000, 999999);
          await Otp.findOneAndUpdate({ jobId },
            { otp:otpNumber}, 
            { new: true }
          );
          res.json({otpNumber});
        } else {
            res.status(400).json({ message: 'Invalid OTP' });
        }

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

app.get('/jobPoster-payment-bill', async (req, res) => {
    const jobId = req.query.jobId;
    
    try {
        const job = await acceptedJob.findOne({ _id: jobId });
        
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        res.json({ payment: job.payment });
    } catch (error) {
        console.error('Error fetching payment:', error);
        res.status(500).json({ message: 'Error fetching payment' });
    }
});

app.get('/student-payment-bill', async (req, res) => {
  const jobId = req.query.jobId;
  
  try {
      const job = await acceptedJob.findOne({ _id: jobId });
      
      if (!job) {
          return res.status(404).json({ message: 'Job not found' });
      }

      res.json({ payment: job.payment });
  } catch (error) {
      console.error('Error fetching payment:', error);
      res.status(500).json({ message: 'Error fetching payment' });
  }
});

app.post('/job-completion-confirmation', async (req, res) => {
    const { jobId } = req.body;
    try {
        const job = await acceptedJob.findOne({ _id: jobId });
        
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        await Job.findByIdAndUpdate(job.jobId, { status: 'completed' });
        res.json({ message: 'Job completion confirmed' });
    } catch (error) {
        console.error('Error confirming job completion:', error);
        res.status(500).json({ message: 'Error confirming job completion' });
    }
});



cron.schedule('0 0 1 * *', async () => {
    try {
        const students = await student.find();
        for (const studentDoc of students) {
            if (studentDoc.cancelled >= 3) {
                const acceptedJobs = await acceptedJob.find({ studentId: studentDoc._id });
                const newblacklist = new blacklist({
                    aadharNo: studentDoc.aadharNo
                  });
                  newblacklist.save();
                if (acceptedJobs.length > 0) {
                    await acceptedJob.deleteMany({ studentId: studentDoc._id });
                    await Job.updateMany({ studentId: studentDoc._id }, { studentId: "", status: "waiting" });
                }
                await student.findByIdAndDelete(studentDoc._id);
            }
          else if(studentDoc.cancelled < 3){
            await student.findByIdAndUpdate(studentDoc._id, {cancelled: 0});
          }
        }
        console.log("Cron job executed successfully.");
    } catch (error) {
        console.error("Error executing cron job:", error);
    }
});


cron.schedule('0 1 * * *', async () => {
    try {
        const completedJobs = await Job.find({ status: 'completed' });
        const abc = await Job.find({ status: 'completed' });
        for (const job of completedJobs) {
            const otpId = await acceptedJob.findOne({ jobId: job._id });
            await Otp.deleteMany({ jobId: otpId._id });
            await acceptedJob.deleteMany({ jobId: job._id });
            await Job.findByIdAndDelete(job._id);
        }
        
        console.log("Completed jobs cleanup executed successfully.");
    } catch (error) {
        console.error("Error cleaning up completed jobs:", error);
    }
    try {
        const poster = await jobPoster.find();
        for (const posterDoc of poster) {
            if (posterDoc.report >= 4) {
                const acceptedJobs = await acceptedJob.find({ jobPosterId: posterDoc._id });
                const newblacklist = new blacklist({
                    aadharNo: posterDoc.aadharNo
                  });
                  newblacklist.save();
                if (acceptedJobs.length > 0) {
                    await acceptedJob.deleteMany({ jobPosterId: posterDoc._id });
                    
                    await Job.deleteMany({ jobPosterId: posterDoc._id });
                }
                await jobPoster.findByIdAndDelete(posterDoc._id);
            }
        }
        console.log("Cron job executed successfully.");
    } catch (error) {
        console.error("Error executing cron job:", error);
    }
});

const port = 5000;

app.listen(port, () => {
    console.log(`Backend server running on http://localhost:5000`);
});
