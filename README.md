
# 📄 ApplyAI – AI-Powered Resume Analyzer

**ApplyAI** is a smart resume analysis tool built with modern web technologies. Upload your resume, match it to job descriptions, and get detailed AI-driven feedback. Whether you're job hunting or optimizing your resume, ApplyAI gives you the insights you need to stand out.

---

## 🚀 Features

- 🔍 **AI Resume Analysis** – Upload PDF resumes for real-time analysis and actionable feedback  
- 💼 **Job Matching** – Compare your resume to job descriptions and receive match scores  
- 📊 **Analytics Dashboard** – Track how your resume performs over time with visual insights  
- 🔐 **Secure Auth** – User authentication powered by Clerk  
- ☁️ **Cloud Storage** – Secure file storage and access via AWS S3  
- 📈 **Visualizations** – Beautiful, interactive charts powered by Recharts  

---

## 🧱 Tech Stack

| Layer             | Technology                                 |
|------------------|---------------------------------------------|
| Frontend         | Next.js 14, React, Tailwind CSS             |
| Backend/API      | Next.js API Routes                          |
| Database         | AWS RDS (MySQL)                             |
| Authentication   | Clerk                                       |
| File Storage     | AWS S3                                      |
| AI/ML            | OpenRouter, Hugging Face Transformers       |
| PDF Parsing      | PDF.js                                      |
| Charts           | Recharts                                    |

---

## ⚙️ Getting Started

### ✅ Prerequisites

Before you begin, ensure you have the following:

- Node.js v18 or higher  
- MySQL (hosted on AWS RDS or locally)  
- AWS account with S3 bucket access  
- Clerk account for user authentication  
- OpenRouter API key

---

### 🔐 Environment Variables

Create a `.env.local` file in the root directory with these values:

```env
# Database
DB_HOST=your_rds_endpoint
DB_USER=your_mysql_user
DB_PASS=your_mysql_password
DB_NAME=your_db_name

# AWS S3
AWS_BUCKET_NAME=your_bucket_name
AWS_REGION=your_region
AWS_ACCESS_KEY=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key

# Clerk Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_frontend_key
CLERK_SECRET_KEY=your_clerk_backend_key

# AI Service
OPENROUTER_KEY=your_openrouter_api_key
```

---

### 🛠️ Installation

1. **Clone the Repository**

```bash
git clone https://github.com/DarthCoder501/applyai.git
cd applyai
```

2. **Install Dependencies**

```bash
npm install
```

3. **Initialize the Database**

```bash
npm run db:init
```

4. **Start the Development Server**

```bash
npm run dev
```

Then visit: [http://localhost:3000](http://localhost:3000)

---

## 🧭 Project Structure

```
applyai/
├── app/
│   ├── api/              → API routes
│   ├── analytics/        → Resume stats dashboard
│   ├── home/             → Main landing page
│   └── upload/           → Resume/job description upload pages
├── components/           → Reusable UI elements
├── lib/                  → Configs, utilities, and helpers
├── middleware.ts         → Middleware logic
└── ...
```

---

## 📡 API Endpoints

| Endpoint            | Description                             |
|---------------------|-----------------------------------------|
| `/api`              | Core resume analysis API                |
| `/api/save-analysis`| Save user feedback results              |
| `/api/get-analytics`| Retrieve data for charts and stats      |
| `/api/s3-upload`    | Securely upload files to AWS S3         |

---

## 🤝 Contributing

1. Fork the repository  
2. Create a feature branch (`git checkout -b feature/awesome-feature`)  
3. Commit your changes (`git commit -m 'Add awesome feature'`)  
4. Push to your fork (`git push origin feature/awesome-feature`)  
5. Open a pull request and describe your changes  

---

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for full details.

