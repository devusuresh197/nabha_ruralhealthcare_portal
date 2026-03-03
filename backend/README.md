# RuralCare Portal

RuralCare Portal is a role-based rural healthcare coordination platform built with Next.js, designed to address the real-world healthcare challenges faced in rural regions such as Nabha in Punjab. In many semi-urban and rural areas like Nabha, patients often struggle with limited access to specialist doctors, delayed diagnosis, medicine stock shortages, long travel distances to district hospitals, and inefficient communication between frontline health workers and medical professionals. Primary health workers frequently handle high patient loads with minimal digital infrastructure, while pharmacists face difficulties in maintaining transparent stock updates and managing advance medicine requests. RuralCare Portal aims to digitally bridge this gap by creating a centralized system where health workers can submit structured patient cases, doctors can remotely review and provide medical advice, and pharmacists can manage stock and respond to medicine prebookings in real time. The platform also integrates AI-assisted triage to help prioritize high-risk cases while preserving doctor authority for final decisions. By combining role-based access control, structured workflows, and optional AI support, the system improves coordination, reduces unnecessary patient travel, enhances medicine availability visibility, and promotes faster clinical decision-making — ultimately supporting more efficient and equitable rural healthcare delivery.

---

## 🚀 Features

- Patient case submission and tracking  
- Doctor review with prescriptions and advice  
- Pharmacy stock management  
- Medicine prebooking system  
- AI-assisted triage with rule-based fallback  

---

## 🛠 Tech Stack

- Next.js (App Router)  
- React + TypeScript  
- Tailwind CSS  
- MongoDB  
- Gemini API (Optional for AI triage)  

---

## 👥 User Roles

### Health Worker
- Submit patient cases  
- Search medicine availability  
- Create medicine prebookings  

### Doctor
- Review pending cases  
- Provide prescriptions and medical advice  
- Override AI risk assessment  

### Pharmacist
- Manage stock for assigned pharmacy  
- View and respond to prebookings  

---

## 🔑 Demo Credentials (For Local Testing Only)

⚠️ These credentials are for development/demo use only.  
Do NOT use in production.

### Doctor
- Email: `rajeshruralcare.local`  
- Password: `Doctor@123`  

### Health Worker
- Email: `priya@ruralcare.local`  
- Password: `priya@123`  

### Pharmacist (Pharmacy 1)
- Email: `jatin@ruralcare.local`  
- Password: `jatin@123`  

---

## ⚙️ Setup Instructions

### 1. Install Dependencies

```bash
npm install
## ⚙️ Environment Configuration

To run the project locally, create a `.env.local` file in the root directory of the project and add the following environment variables:

```env
MONGODB_URI=your_mongodb_connection_string
MONGODB_DB_NAME=rural_health_portal

# Optional (for AI-based triage)
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash
## ▶️ Run the Development Server

After completing the installation and environment configuration steps, start the development server using:

```bash
npm run dev
## 🧠 AI-Assisted Triage System

The platform incorporates an AI-assisted triage system designed to enhance early clinical risk assessment and improve case prioritization. This feature supports healthcare professionals by providing an initial evaluation while ensuring that final medical decisions remain human-led.

- Automatically classifies patient cases into **Low**, **Medium**, or **High** risk categories  
- Integrates with the Gemini API when a valid API key is configured  
- Seamlessly falls back to a built-in rule-based risk assessment model if the API key is unavailable  
- Ensures that the doctor’s review remains the final and authoritative decision in all cases  