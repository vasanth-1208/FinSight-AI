# AI Chatbot Integration - Easilon Bank

## 🤖 Multi-Agent AI Chatbot System

### Overview
The chatbot implements a sophisticated **Agentic AI** system with multiple specialized agents working together to handle loan applications and customer queries.

## 🧠 Agent Architecture

### 1. Master Agent 🧠
- **Role**: Orchestrates conversation flow
- **Responsibilities**: Routes queries to appropriate agents, manages overall conversation

### 2. Sales Agent 💼
- **Role**: Collects loan requirements
- **Responsibilities**: 
  - Gathers loan amount
  - Collects tenure preferences
  - Understands loan purpose
  - Guides user through application process

### 3. Verification Agent 🔐
- **Role**: Verifies customer data
- **Responsibilities**:
  - Fetches customer profile from CRM
  - Verifies KYC status
  - Checks credit score
  - Validates pre-approved limits

### 4. Underwriting Agent 📊
- **Role**: Evaluates risk and eligibility
- **Responsibilities**:
  - Calculates EMI
  - Evaluates credit score bands
  - Checks eligibility rules
  - Makes approval/rejection decisions

### 5. Sanction Agent 📄
- **Role**: Generates sanction letter
- **Responsibilities**:
  - Creates sanction reference ID
  - Generates approval documents
  - Provides download links

## 🎯 Features

### Conversation Flow
1. **Greeting** → Master Agent welcomes user
2. **Loan Application** → Sales Agent collects details
3. **Verification** → Verification Agent checks profile
4. **Eligibility** → Underwriting Agent evaluates
5. **Decision** → Sanction Agent generates letter

### Capabilities
- ✅ Loan application processing
- ✅ Eligibility checking
- ✅ EMI calculation
- ✅ Document requirements
- ✅ Application status tracking
- ✅ Real-time agent status updates
- ✅ Conversation history
- ✅ MongoDB integration

## 📁 Files Created

1. **chatbot.html** - Main chatbot interface
2. **chatbot.css** - Chatbot styling
3. **chatbot.js** - Agent logic and conversation handling
4. **server.js** - Updated with chatbot API endpoints

## 🚀 Usage

### Access Chatbot
- Direct URL: `http://localhost:3000/chatbot.html`
- From Dashboard: Click "Chatbot" button in navigation
- From Home: Click "AI Chatbot" in navigation menu

### Example Conversations

**Loan Application:**
```
User: "I want to apply for a loan"
Bot: "What loan amount are you looking for?"
User: "₹5,00,000"
Bot: "How many months would you like to repay?"
User: "36 months"
Bot: "What is the purpose of this loan?"
User: "Home renovation"
Bot: [Verifies profile] [Evaluates eligibility] [Shows result]
```

**Eligibility Check:**
```
User: "Check my eligibility"
Bot: [Fetches profile] [Shows credit score] [Displays pre-approved limit]
```

**EMI Calculation:**
```
User: "Calculate EMI"
Bot: [Asks for amount, rate, tenure] [Calculates and displays EMI]
```

## 🔗 Integration Points

### Dashboard Integration
- Chatbot saves loan applications to MongoDB
- Dashboard displays real-time application status
- Agent orchestration timeline visible in dashboard

### MongoDB Collections
- `chatbot_conversations` - Stores chat history
- `loan_applications` - Stores loan applications
- `customer_profiles` - Customer data for verification

## 🎨 UI Features

- **Agent Status Sidebar** - Shows which agent is active
- **Real-time Typing Indicator** - Shows when bot is processing
- **Message History** - Persists across sessions
- **Quick Actions** - Suggested questions
- **Responsive Design** - Works on mobile and desktop

## 🔄 Agent Orchestration Flow

```
Master Agent (Start)
    ↓
Sales Agent (Collect Details)
    ↓
Verification Agent (Verify Profile)
    ↓
Underwriting Agent (Evaluate Risk)
    ↓
Sanction Agent (Generate Letter)
    ↓
Master Agent (Complete)
```

## 📊 Data Flow

1. User sends message → Chatbot processes
2. Appropriate agent handles request
3. Data saved to MongoDB
4. Dashboard updates in real-time
5. User receives response with next steps

## 🛠️ API Endpoints

- `POST /api/chatbot/conversation` - Save conversation
- `GET /api/chatbot/conversations/:mobile` - Get conversation history
- `POST /api/loan-application` - Save loan application (from chatbot)
- `GET /api/customer-profile/:mobile` - Get customer profile

## 💡 Next Steps

To enhance the chatbot:
1. Add natural language processing (NLP)
2. Integrate with external credit bureaus
3. Add voice input/output
4. Implement sentiment analysis
5. Add multi-language support

