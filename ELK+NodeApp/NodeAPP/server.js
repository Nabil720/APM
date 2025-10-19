// Add at the very top of server.js
const apm = require('elastic-apm-node').start({
  // Use environment variables (recommended) or hardcode for testing
  serviceName: process.env.ELASTIC_APM_SERVICE_NAME || 'portfolio-app',
  serverUrl: process.env.ELASTIC_APM_SERVER_URL || 'http://172.31.23.91:8200',
  environment: process.env.NODE_ENV || 'production',
  // secretToken: process.env.ELASTIC_APM_SECRET_TOKEN, // only if you configured APM token
  captureHeaders: true,
  captureBody: 'off', // 'off' for privacy, change as needed
});



const express = require('express');
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com", "https://fonts.googleapis.com"],
      scriptSrc: ["'self'", "https://cdnjs.cloudflare.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"]
    }
  }
}));

app.use(cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static files
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Portfolio data
const portfolioData = {
  name: "Istiaque Faroque Nabil",
  title: "DevSecOps Engineer",
  email: "nabilfaruk6@gmail.com",
  phone: "+880 1521733936",
  location: "Kazipara ,Dhaka, Bangladesh",
  github: "https://github.com/nabilfaruk",
  linkedin: "https://linkedin.com/in/nabilfaruk",
  
  about: "Passionate DevSecOps Engineer with expertise in cybersecurity, machine learning. Experienced in zero-click spyware detection, malware analysis, and secure system design. Active CTF participant with strong problem-solving skills and a commitment to building secure, scalable applications.",
  
  skills: {
    devsecops: ["Docker", "Kubernetes", "GitLab CI/CD", "GitHub Actions", "Linux Administration", "Infrastructure as Code"],
    security: ["Penetration Testing", "Malware Analysis", "Zero-Click Spyware Detection", "CTF Competitions", "Network Security", "Vulnerability Assessment"],
    development: ["Node.js", "Python", "JavaScript", "Flutter", "Machine Learning", "Deep Learning"],
    databases: ["MySQL", "Firebase", "MongoDB"],
    tools: ["Git", "Docker", "Kubernetes", "Figma", "Jupyter Notebook", "TryHackMe"]
  },
  
  experience: [
    {
      title: "Secretary",
      company: "MIST Cyber Security Club",
      period: "May 2024 - Present",
      location: "Dhaka, Bangladesh",
      description: "Leading cybersecurity initiatives, organizing CTF competitions, and managing club operations."
    },
    {
      title: "Industrial Training",
      company: "Teletalk Bangladesh Ltd",
      period: "Feb 2024 - Mar 2024",
      location: "Dhaka, Bangladesh",
      description: "Gained hands-on experience in telecommunications infrastructure and network security."
    },
    {
      title: "Associate Member - CTF Management",
      company: "MIST Cyber Security Club",
      period: "May 2023 - May 2024",
      location: "Dhaka, Bangladesh",
      description: "Organized and managed Capture The Flag competitions, developed security challenges."
    }
  ],
  
  projects: [
    {
      title: "Zero-Click Spyware Detection using ML/DL",
      tech: ["Machine Learning", "Deep Learning", "Python", "LSTM", "CNN"],
      period: "Apr 2024 - May 2025",
      description: "Developed ML and DL models to detect zero-click spyware like Pegasus using MTA-KDD'19 dataset. LSTM showed superior performance in capturing temporal network patterns.",
      type: "security"
    },
    {
      title: "Campus Placement Recruitment System",
      tech: ["Flutter", "Firebase", "Figma"],
      period: "Apr 2024 - Nov 2024",
      description: "Full-stack mobile application connecting students with employers, featuring skill-based matching and streamlined hiring process.",
      type: "development"
    },
    {
      title: "BongoJourney.AI",
      tech: ["JavaScript", "Python", "CSS", "AI/ML"],
      period: "Sep 2023 - Mar 2024",
      description: "AI-powered travel planning platform providing personalized recommendations and booking integration using intelligent algorithms.",
      type: "development"
    },
    {
      title: "Static Malware Analysis",
      tech: ["Machine Learning", "Python", "ANN", "SVM"],
      period: "Dec 2024 - May 2025",
      description: "Memory-optimized ML models for static malware detection using software metadata, comparing ANN, SVM, and GBM algorithms.",
      type: "security"
    }
  ],
  
  achievements: [
    "4th Place at MIST CyberTron 2025",
    "18th Place at Inter-University CTF 2023 (BUET)",
    "Completed TryHackMe Jr Penetration Tester Path",
    "Completed TryHackMe Web Fundamentals Path",
    "CodeForces Rating: 1182 (700+ problems solved)",
    "6th Place Soccer Bot - Chittagong Science Carnival 2022"
  ],
  
  education: {
    degree: "BSc in Computer Science and Engineering",
    university: "Military Institute of Science and Technology",
    period: "Apr 2021 - Apr 2025",
    location: "Dhaka, Bangladesh"
  }
};

// Routes
app.get('/', (req, res) => {
  res.render('index', { data: portfolioData });
});

app.get('/projects', (req, res) => {
  res.render('projects', { data: portfolioData });
});

app.get('/contact', (req, res) => {
  res.render('contact', { data: portfolioData });
});

app.post('/contact', (req, res) => {
  const { name, email, message } = req.body;
  
  // Here you would typically send an email
  console.log('Contact form submission:', { name, email, message });
  
  res.json({ 
    success: true, 
    message: 'Thank you for your message! I\'ll get back to you soon.' 
  });
});

// API endpoint for portfolio data
app.get('/api/portfolio', (req, res) => {
  res.json(portfolioData);
});

// 404 handler
app.use((req, res) => {
  res.status(404).render('404', { data: portfolioData });
});

app.listen(PORT, () => {
  console.log(`🚀 Portfolio server running at http://localhost:${PORT}`);
  console.log(`📧 Contact: ${portfolioData.email}`);
});