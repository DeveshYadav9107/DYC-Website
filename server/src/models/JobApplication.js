import mongoose from 'mongoose';

const InterviewRoundSchema = new mongoose.Schema({
  roundName: { type: String, required: true }, // e.g., "Round 1 - Technical Screening", "Client Interview", "HR Discussion"
  scheduledDate: { type: Date, required: true },
  time: { type: String, required: true }, // e.g., "11:30 AM IST"
  meetingType: { 
    type: String, 
    enum: ['Online (Google Meet / Zoom)', 'In-person Office', 'Telephonic'], 
    default: 'Online (Google Meet / Zoom)' 
  },
  meetingLink: { type: String, default: '' },
  location: { type: String, default: '' },
  interviewerName: { type: String, default: 'DY&C Recruitment Panel' },
  status: { 
    type: String, 
    enum: ['Scheduled', 'Completed', 'Rescheduled', 'Cancelled'], 
    default: 'Scheduled' 
  },
  feedback: { type: String, default: '' },
  rating: { type: Number, min: 1, max: 5 },
  createdAt: { type: Date, default: Date.now },
});

const RecruiterNoteSchema = new mongoose.Schema({
  note: { type: String, required: true },
  authorName: { type: String, default: 'Recruiter' },
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
});

const StageHistorySchema = new mongoose.Schema({
  status: { type: String, required: true },
  changedAt: { type: Date, default: Date.now },
  changedByName: { type: String, default: 'System' },
  note: { type: String, default: '' },
});

const JobApplicationSchema = new mongoose.Schema({
  job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  candidate: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  candidateName: { type: String, required: [true, 'Candidate name is required'], trim: true },
  candidateEmail: { type: String, required: [true, 'Email is required'], lowercase: true, trim: true },
  candidatePhone: { type: String, required: [true, 'Phone number is required'], trim: true },
  currentCompany: { type: String, default: '', trim: true },
  currentDesignation: { type: String, default: '', trim: true },
  totalExperience: { type: String, default: '0 years', trim: true },
  currentSalary: { type: String, default: '', trim: true },
  expectedSalary: { type: String, default: '', trim: true },
  noticePeriod: { type: String, default: '30 Days', trim: true },
  skills: [{ type: String, trim: true }],
  resumeUrl: { type: String, default: '' },
  resumeFileName: { type: String, default: '' },
  coverLetter: { type: String, default: '' },
  portfolioLink: { type: String, default: '' },
  status: { 
    type: String, 
    enum: ['Applied', 'Screening', 'Interview', 'Selected', 'Rejected', 'Placed'], 
    default: 'Applied' 
  },
  stageHistory: [StageHistorySchema],
  recruiterNotes: [RecruiterNoteSchema],
  interviews: [InterviewRoundSchema],
  statusNotification: {
    message: { type: String, default: 'Application received and logged with DY&C Talent Team.' },
    updatedAt: { type: Date, default: Date.now },
    unread: { type: Boolean, default: true },
  },
}, { timestamps: true });

JobApplicationSchema.index({ job: 1, candidateEmail: 1 });
JobApplicationSchema.index({ candidate: 1, status: 1 });
JobApplicationSchema.index({ status: 1 });
JobApplicationSchema.index({ skills: 1 });

export default mongoose.model('JobApplication', JobApplicationSchema);
