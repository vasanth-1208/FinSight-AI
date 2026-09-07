# FinSight AI – Intelligent BFSI Financial Assistant

FinSight AI is an AI-powered BFSI customer assistance platform designed to simplify financial interactions through an intelligent chatbot and an interactive financial dashboard.

The platform provides users with a conversational interface for financial assistance while presenting relevant financial information through a centralized dashboard.

---

## 🚀 Overview

Traditional banking and financial services often require users to navigate complex interfaces or depend on manual customer support.

**FinSight AI** addresses this challenge by combining:

* 💬 Intelligent conversational assistance
* 📊 Financial dashboard
* 🔐 User authentication interface
* 🏦 BFSI-focused customer experience
* 📱 Responsive web interface
* ⚡ Interactive frontend experience

The project was developed as part of the **EY Techathon BFSI challenge**.

---

## 🎯 Problem Statement

Customers interacting with financial institutions often face difficulties such as:

* Complex financial terminology
* Difficulty finding relevant information
* Repetitive customer-support queries
* Multiple interfaces for different financial services
* Limited personalization in traditional support systems

There is a need for a more accessible and intelligent financial assistance platform.

---

## 💡 Our Solution

FinSight AI provides a unified digital interface where users can interact with a financial assistant and access important financial information through a dashboard.

### Core workflow

```text
User
  ↓
Login / Authentication
  ↓
FinSight AI Interface
  ↓
┌───────────────────┬────────────────────┐
│ AI Financial      │ Financial Dashboard│
│ Assistant         │                    │
└───────────────────┴────────────────────┘
  ↓
Personalized Financial Assistance
```

---

## ✨ Key Features

### 💬 AI Financial Assistant

* Conversational financial assistance
* User-friendly chat interface
* BFSI-focused interaction
* Structured chatbot responses
* Interactive conversation experience

### 📊 Financial Dashboard

* Centralized financial information
* Visual representation of important metrics
* Dashboard-based navigation
* Interactive financial interface
* Clear information hierarchy

### 🔐 Authentication

* Dedicated login interface
* User-oriented access flow
* Session-based frontend experience

### 🎨 Modern UI

* Responsive layouts
* Clean financial-service design
* Interactive components
* Dashboard cards and visual elements
* Consistent typography and spacing
* Desktop and mobile-friendly interface

---

## 🏦 BFSI Focus

FinSight AI is designed around the **Banking, Financial Services and Insurance (BFSI)** domain.

The platform can be extended to support areas such as:

* Banking assistance
* Loan-related queries
* Financial product discovery
* Insurance assistance
* Account-related support
* Financial education
* Customer service automation

---

## 🧠 AI Assistant Architecture

The chatbot interface is designed to act as the primary conversational layer between the customer and financial services.

```text
Customer Query
      ↓
Chat Interface
      ↓
Intent / Query Processing
      ↓
Financial Knowledge / Business Logic
      ↓
Response Generation
      ↓
Customer
```

> AI capabilities should be connected to the actual model/backend implementation when deployed. The frontend itself should not be presented as a production AI model.

---

## 🖥️ Application Structure

```text
FinSight AI
│
├── Login
│
├── AI Chatbot
│   ├── Chat Interface
│   ├── Messages
│   └── User Interaction
│
├── Financial Dashboard
│   ├── Financial Metrics
│   ├── Insights
│   └── Visualizations
│
└── Configuration
```

---

## 🛠️ Tech Stack

### Frontend

* HTML5
* CSS3
* JavaScript
* Responsive Web Design

### UI

* Custom CSS
* Dashboard components
* Interactive JavaScript components

### Application Areas

* Authentication interface
* AI chatbot interface
* Financial dashboard
* BFSI customer experience

---

## 📂 Project Structure

```text
ey_techathon-bfsi-aichatbot/
│
├── index.html
│
├── chatbot.html
├── chatbot.css
├── chatbot.js
│
├── dashboard.html
├── dashboard.css
├── dashboard.js
│
├── login.css
│
├── CONFIG.md
├── README.md
│
└── .gitignore
```

---

## ⚙️ Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/vasanth-1208/ey_techathon-bfsi-aichatbot.git
```

### 2. Navigate to the project

```bash
cd ey_techathon-bfsi-aichatbot
```

### 3. Run the application

Since the project uses HTML, CSS and JavaScript, it can be opened directly through `index.html`.

For a better development experience, use a local development server such as VS Code Live Server.

---

## 🔄 User Flow

```text
                ┌─────────────┐
                │    User     │
                └──────┬──────┘
                       ↓
                ┌─────────────┐
                │    Login    │
                └──────┬──────┘
                       ↓
              ┌─────────────────┐
              │ FinSight AI Home │
              └────────┬────────┘
                       ↓
          ┌────────────┴────────────┐
          ↓                         ↓
 ┌────────────────┐       ┌─────────────────┐
 │ AI Assistant   │       │   Dashboard     │
 └───────┬────────┘       └────────┬────────┘
         ↓                         ↓
 ┌────────────────┐       ┌─────────────────┐
 │ User Query     │       │ Financial Data  │
 └───────┬────────┘       └────────┬────────┘
         └────────────┬────────────┘
                      ↓
             Financial Assistance
```

---

## 🔮 Future Enhancements

The platform can be extended with:

* 🤖 Production-grade LLM integration
* 📚 BFSI knowledge-base / RAG system
* 🔎 Intelligent intent detection
* 👤 Personalized financial recommendations
* 💳 Loan eligibility assistance
* 🛡️ Insurance recommendation engine
* 📈 Advanced financial analytics
* 🌐 Backend API integration
* 🗄️ Persistent user profiles
* 🔔 Personalized notifications
* 🔐 OAuth / enterprise authentication
* 📱 Progressive Web App support
* 🌍 Multi-language financial assistance

---

## 🔒 Security Considerations

For production deployment:

* Store secrets in environment variables
* Never commit API keys or credentials
* Implement secure authentication
* Validate user inputs
* Apply API rate limiting
* Use HTTPS
* Implement proper authorization
* Protect sensitive financial information
* Follow applicable financial-data privacy requirements

---

## 📌 Project Status

**Status:** Hackathon / Portfolio Project

The current project demonstrates the frontend experience and application concept for an intelligent BFSI financial assistant.

Production deployment would require connecting the interface to secure backend services, AI models, persistent databases and enterprise-grade authentication.

---

## 🏆 Hackathon

Developed for the **EY Techathon – BFSI Challenge**.

The project focuses on using conversational AI and digital interfaces to improve customer interaction within the banking and financial-services ecosystem.

---

## 👨‍💻 Author

**Vasantharaj M**

B.E. Computer Science & Engineering
Bannari Amman Institute of Technology

GitHub: `vasanth-1208`

---

## 📄 License

This project is intended for educational, hackathon and portfolio purposes.
