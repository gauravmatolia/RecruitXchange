import mongoose from 'mongoose';

const jobRoleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a job title'],
    trim: true
  },
  company: {
    type: String,
    required: [true, 'Please add a company name'],
    trim: true
  },
  location: {
    type: String,
    required: [true, 'Please add a location']
  },
  salary: {
    type: String,
    required: [true, 'Please add salary information']
  },
  experience: {
    type: String,
    required: [true, 'Please add experience requirement']
  },
  skills: [String],
  description: {
    type: String,
    required: [true, 'Please add a job description']
  },
  applicants: {
    type: Number,
    default: 0
  },
  featured: {
    type: Boolean,
    default: false
  },
  matchScore: {
    type: Number,
    min: 0,
    max: 100
  },
  companyLogo: String,
  responsibilities: [String],
  qualifications: [String],
  companyCulture: String,
  isActive: {
    type: Boolean,
    default: true
  },
  deadline: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('JobRole', jobRoleSchema);