#!/usr/bin/env tsx

import * as fs from 'fs'
import * as path from 'path'

// Sample CV data for testing
const sampleCVs = [
  {
    filename: 'john_doe.txt',
    content: `John Doe
Software Engineer

Contact Information:
Email: john.doe@email.com
Phone: (555) 123-4567
Location: San Francisco, CA

Professional Summary:
Experienced software engineer with 5 years of experience in full-stack development. 
Proficient in Python, JavaScript, and React. Strong background in machine learning and AI.

Work Experience:
Senior Software Engineer - TechCorp (2021-2024)
- Developed scalable web applications using React and Node.js
- Implemented machine learning models for recommendation systems
- Led a team of 3 junior developers
- Technologies: Python, JavaScript, React, TensorFlow, AWS

Software Engineer - StartupXYZ (2019-2021)
- Built REST APIs using Python and Django
- Developed frontend applications with React
- Worked with PostgreSQL and Redis databases
- Technologies: Python, Django, React, PostgreSQL, Redis

Education:
Bachelor of Science in Computer Science
Stanford University (2015-2019)
GPA: 3.8/4.0

Skills:
- Programming Languages: Python, JavaScript, TypeScript, Java
- Frameworks: React, Django, Node.js, Express
- Databases: PostgreSQL, MongoDB, Redis
- Cloud: AWS, Docker, Kubernetes
- Machine Learning: TensorFlow, PyTorch, scikit-learn`
  },
  {
    filename: 'jane_smith.txt',
    content: `Jane Smith
Data Scientist

Contact Information:
Email: jane.smith@email.com
Phone: (555) 987-6543
Location: New York, NY

Professional Summary:
Data scientist with 4 years of experience in machine learning and statistical analysis.
Expert in Python, R, and SQL. Passionate about turning data into actionable insights.

Work Experience:
Senior Data Scientist - DataCorp (2022-2024)
- Developed predictive models for customer churn analysis
- Built recommendation systems using collaborative filtering
- Analyzed large datasets using Python and Spark
- Technologies: Python, R, Spark, TensorFlow, AWS

Data Scientist - Analytics Inc (2020-2022)
- Created statistical models for business forecasting
- Developed data pipelines using Apache Airflow
- Performed A/B testing and statistical analysis
- Technologies: Python, R, SQL, Airflow, Tableau

Education:
Master of Science in Data Science
MIT (2018-2020)

Bachelor of Science in Mathematics
Harvard University (2014-2018)

Skills:
- Programming Languages: Python, R, SQL, Scala
- Machine Learning: TensorFlow, PyTorch, scikit-learn, XGBoost
- Data Tools: Pandas, NumPy, Spark, Airflow
- Visualization: Tableau, Matplotlib, Seaborn
- Statistics: Hypothesis testing, Regression analysis, Time series`
  },
  {
    filename: 'mike_johnson.txt',
    content: `Mike Johnson
DevOps Engineer

Contact Information:
Email: mike.johnson@email.com
Phone: (555) 456-7890
Location: Austin, TX

Professional Summary:
DevOps engineer with 6 years of experience in cloud infrastructure and automation.
Expert in AWS, Docker, and Kubernetes. Strong background in CI/CD and monitoring.

Work Experience:
Senior DevOps Engineer - CloudTech (2021-2024)
- Designed and implemented CI/CD pipelines using Jenkins and GitLab
- Managed AWS infrastructure with Terraform
- Implemented monitoring solutions with Prometheus and Grafana
- Technologies: AWS, Docker, Kubernetes, Terraform, Jenkins

DevOps Engineer - InfraCorp (2018-2021)
- Automated deployment processes using Ansible
- Managed containerized applications with Docker Swarm
- Implemented logging solutions with ELK stack
- Technologies: Docker, Ansible, ELK, AWS, Linux

Education:
Bachelor of Science in Information Technology
University of Texas at Austin (2014-2018)

Certifications:
- AWS Certified Solutions Architect
- Certified Kubernetes Administrator (CKA)
- Docker Certified Associate

Skills:
- Cloud Platforms: AWS, Azure, GCP
- Containers: Docker, Kubernetes, Docker Swarm
- Infrastructure as Code: Terraform, CloudFormation, Ansible
- CI/CD: Jenkins, GitLab CI, GitHub Actions
- Monitoring: Prometheus, Grafana, ELK Stack`
  }
]

async function generateSampleCVs() {
  const outputDir = path.join(process.cwd(), 'sample-cvs')
  
  // Create output directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  console.log('Generating sample CV files...')
  
  for (const cv of sampleCVs) {
    const filePath = path.join(outputDir, cv.filename)
    fs.writeFileSync(filePath, cv.content, 'utf8')
    console.log(`Created: ${cv.filename}`)
  }

  console.log('')
  console.log(`✅ Generated ${sampleCVs.length} sample CV files in: ${outputDir}`)
  console.log('')
  console.log('Note: These are text files for testing. In a real scenario, you would have PDF files.')
  console.log('To test with actual PDFs, you can:')
  console.log('1. Convert these text files to PDFs using any online converter')
  console.log('2. Generate realistic PDF CVs using AI tools')
  console.log('3. Use the provided CV generation script (if available)')
}

if (require.main === module) {
  generateSampleCVs().catch(console.error)
}