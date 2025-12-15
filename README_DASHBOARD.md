# Dashboard Setup Instructions

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Server
```bash
npm start
```

The server will start on `http://localhost:3000`

### 3. Access the Dashboard
- Main Page: http://localhost:3000
- Dashboard: http://localhost:3000/dashboard.html
- Login: http://localhost:3000/login.html

## 📊 Dashboard Features

### Panels Included:
1. **Demo Scenarios** - Test different customer profiles
2. **Customer Profile** - KYC-lite information from CRM
3. **Loan Request Summary** - Application details
4. **Underwriting & Risk Evaluation** - Complete eligibility analysis
5. **Agent Orchestration** - Multi-agent workflow timeline
6. **Salary Slip Verification** - Conditional panel for edge cases
7. **Final Decision & Sanction** - Approval/rejection with sanction letter
8. **System Metadata** - Decision time and automation level

## 🗄️ MongoDB Integration

The dashboard connects to MongoDB Atlas:
- **Connection**: Automatic via Express server
- **Database**: `easilon_bank`
- **Collections**: 
  - `customer_profiles`
  - `loan_applications`

## 🎯 Demo Scenarios

Click on any scenario in the sidebar to test:
- **9876543210** → Instant Approval
- **9123456780** → Salary Slip Required (Low Credit)
- **7654321098** → Salary Slip Required (High Amount)
- **9679012345** → Rejection – Low Credit Score
- **8765432109** → Rejection – Amount > 2× Limit

## 📝 Data Flow

1. User logs in → Mobile stored in localStorage
2. Dashboard loads → Fetches customer profile from MongoDB
3. Loan application → Saved to MongoDB
4. Eligibility evaluation → Real-time calculation
5. Decision → Stored in MongoDB

## 🔧 API Endpoints

- `POST /api/customer-profile` - Save customer profile
- `GET /api/customer-profile/:mobile` - Get customer profile
- `POST /api/loan-application` - Save loan application
- `GET /api/loan-applications/:mobile` - Get loan applications
- `PUT /api/loan-application/:id` - Update loan application

