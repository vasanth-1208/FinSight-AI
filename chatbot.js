// Chatbot Configuration
const API_BASE = 'http://localhost:3000/api';
let conversationId = null;
let currentAgent = 'master';
let currentMode = null; // 'loan-application', 'emi-calculator', 'eligibility-check', null
let conversationData = {
    mobile: localStorage.getItem('mobile') || '9876543210',
    loanAmount: null,
    tenure: null,
    purpose: null,
    stage: 'greeting',
    currentQuestion: null,
    collectedData: {}
};
let isProcessing = false;


// Agent definitions
const AGENTS = {
    master: {
        name: 'Master Agent',
        icon: 'brain',
        role: 'Orchestrates conversation flow'
    },
    sales: {
        name: 'Sales Agent',
        icon: 'briefcase',
        role: 'Collects loan requirements'
    },
    verification: {
        name: 'Verification Agent',
        icon: 'shield-alt',
        role: 'Verifies customer data'
    },
    underwriting: {
        name: 'Underwriting Agent',
        icon: 'chart-bar',
        role: 'Evaluates risk and eligibility'
    },
    sanction: {
        name: 'Sanction Agent',
        icon: 'file-contract',
        role: 'Generates sanction letter'
    }
};

// Initialize chatbot
async function initChatbot() {
    console.log('Initializing chatbot...');
    
    try {
        conversationId = 'conv_' + Date.now();
        updateAgentStatus('master', 'active');
        
        // Reset conversation state for new session
        resetConversationState();
        
        // Load conversation history (for display only - read-only)
        const hasHistory = loadConversationHistory();
        
        // Show welcome message if no history
        if (!hasHistory) {
            showWelcomeMessage();
        }
        
        // Setup input handlers
        const chatInput = document.getElementById('chatInput');
        const sendBtn = document.getElementById('sendBtn');
        
        if (chatInput) {
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                }
            });
        } else {
            console.error('Chat input element not found during initialization');
        }
        
        if (!sendBtn) {
            console.error('Send button element not found during initialization');
        }
        
        // Hide suggestions if there's history
        const messages = JSON.parse(localStorage.getItem('chatMessages') || '[]');
        const suggestedQuestions = document.getElementById('suggestedQuestions');
        if (messages.length > 0 && suggestedQuestions) {
            suggestedQuestions.style.display = 'none';
            localStorage.setItem('chatStarted', 'true');
        }
        
        // Ensure suggestion buttons are visible and working
        if (suggestedQuestions) {
            suggestedQuestions.style.display = 'flex';
        }
        
        console.log('Chatbot initialized successfully');
    } catch (error) {
        console.error('Error initializing chatbot:', error);
    }
}

// Show welcome message
function showWelcomeMessage() {
    const messagesContainer = document.getElementById('chatMessages');
    const welcomeDiv = document.createElement('div');
    welcomeDiv.className = 'message bot-message';
    
    welcomeDiv.innerHTML = `
        <div class="message-avatar">
            <i class="fas fa-robot"></i>
        </div>
        <div class="message-content">
            <div class="message-header">
                <span class="message-sender">Master Agent</span>
                <span class="message-time">Just now</span>
            </div>
            <div class="message-text">
                👋 Hello! I'm your AI Loan Assistant. I can help you with:
                <ul style="margin-top: 0.5rem; padding-left: 1.5rem;">
                    <li>Apply for a personal loan</li>
                    <li>Check loan eligibility</li>
                    <li>Calculate EMI</li>
                    <li>Answer loan-related questions</li>
                </ul>
                <p style="margin-top: 1rem;">How can I assist you today?</p>
            </div>
        </div>
    `;
    
    messagesContainer.appendChild(welcomeDiv);
}

// Load conversation history (read-only display)
function loadConversationHistory() {
    const messages = JSON.parse(localStorage.getItem('chatMessages') || '[]');
    const messagesContainer = document.getElementById('chatMessages');
    
    if (messages.length === 0) {
        return false; // No history
    }
    
    // Add separator before history
    addConversationSeparator();
    
    // Load and display history (read-only, won't affect current state)
    messages.forEach(msg => {
        // Skip old incomplete application messages to avoid confusion
        if (msg.text && (
            msg.text.toLowerCase().includes('question 1 of 3') ||
            msg.text.toLowerCase().includes('question 2 of 3') ||
            msg.text.toLowerCase().includes('question 3 of 3')
        )) {
            return; // Skip old incomplete application prompts
        }
        addMessageToDisplay(msg.type, msg.text, msg.sender, msg.timestamp);
    });
    
    // Add separator after history
    addConversationSeparator();
    
    return true; // Has history
}

// Reset conversation state (but keep history visible)
function resetConversationState() {
    conversationData = {
        mobile: localStorage.getItem('mobile') || '9876543210',
        loanAmount: null,
        tenure: null,
        purpose: null,
        stage: 'greeting',
        currentQuestion: null,
        collectedData: {}
    };
    conversationId = 'conv_' + Date.now();
    isProcessing = false;
}

// Resume incomplete conversation
function resumeConversation() {
    if (conversationData.stage === 'collecting_loan_amount') {
        addMessage('bot', `Welcome back! Let's continue your loan application.\n\n💰 What loan amount are you looking for?\n\nPlease enter the amount (e.g., ₹5,00,000 or 500000)`, 'Sales Agent');
        conversationData.currentQuestion = 'loan_amount';
    } else if (conversationData.stage === 'collecting_tenure') {
        addMessage('bot', `Welcome back! I have your loan amount: ₹${conversationData.loanAmount.toLocaleString()}\n\n📅 How many months would you like to repay the loan?\n\nPlease enter the tenure (e.g., 12, 24, 36, 48, or 60 months)`, 'Sales Agent');
        conversationData.currentQuestion = 'tenure';
    } else if (conversationData.stage === 'collecting_purpose') {
        addMessage('bot', `Welcome back! I have:\n• Loan Amount: ₹${conversationData.loanAmount.toLocaleString()}\n• Tenure: ${conversationData.tenure} months\n\n🎯 What is the purpose of this loan?\n\nPlease specify (e.g., Home renovation, Medical expenses, Education, etc.)`, 'Sales Agent');
        conversationData.currentQuestion = 'purpose';
    }
}

// Send message - Define as regular function first, then attach to window
async function sendMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (!message || isProcessing) return;
    
    // Clear input
    input.value = '';
    const sendBtn = document.getElementById('sendBtn');
    if (sendBtn) sendBtn.disabled = true;
    isProcessing = true;
    
    // Hide suggestions
    const suggestedQuestions = document.getElementById('suggestedQuestions');
    if (suggestedQuestions) suggestedQuestions.style.display = 'none';
    localStorage.setItem('chatStarted', 'true');
    
    // Add user message to chat
    addMessage('user', message, 'You');
    
    // Save user response to conversation data
    await saveUserResponse(conversationData.currentQuestion, message);
    
    // Show typing indicator
    showTypingIndicator();
    
    // Process message with AI agents
    setTimeout(() => {
        processMessage(message);
    }, 1000);
}

// Make globally accessible immediately
if (typeof window !== 'undefined') {
    window.sendMessage = sendMessage;
}

// Send suggestion - Define as regular function first, then attach to window
function sendSuggestion(text) {
    document.getElementById('chatInput').value = text;
    sendMessage();
}

// Make globally accessible immediately
if (typeof window !== 'undefined') {
    window.sendSuggestion = sendSuggestion;
}

// Process message through agent system
async function processMessage(message) {
    hideTypingIndicator();
    isProcessing = false;
    
    const lowerMessage = message.toLowerCase().trim();
    
    // Check for cancel/restart commands first
    if (lowerMessage.includes('cancel') || lowerMessage.includes('restart') || lowerMessage.includes('start over') || lowerMessage.includes('new')) {
        await cancelCurrentFlow();
        return;
    }
    
    // Check for intent change (user wants to switch to different flow)
    // More flexible intent detection
    const wantsLoanApplication = lowerMessage.includes('apply') || 
                                (lowerMessage.includes('loan') && (lowerMessage.includes('want') || lowerMessage.includes('need') || lowerMessage.includes('apply'))) ||
                                lowerMessage === 'apply loan' ||
                                lowerMessage === 'i want to apply for a loan' ||
                                lowerMessage.startsWith('apply');
    const wantsEMI = lowerMessage.includes('emi') || 
                     lowerMessage.includes('calculate') || 
                     lowerMessage === 'calculate emi';
    const wantsEligibility = lowerMessage.includes('eligibility') || 
                            lowerMessage.includes('eligible') || 
                            lowerMessage.includes('qualify') ||
                            lowerMessage.includes('check my eligibility') ||
                            lowerMessage.includes('check eligibility');
    
    // CRITICAL: Prevent Master Agent from interrupting when another agent is active
    const isAgentActive = currentAgent !== 'master' && currentAgent !== null;
    const isInActiveFlow = conversationData.stage !== 'greeting' && 
                          conversationData.stage !== 'completed' && 
                          conversationData.stage !== 'verifying' &&
                          conversationData.stage !== 'underwriting_complete';
    
    // If another agent is active, only allow specific responses or intent switches
    if (isAgentActive || isInActiveFlow) {
        // Allow intent switches even when agent is active
        if (wantsLoanApplication && currentMode !== 'loan-application') {
            await cancelCurrentFlow();
            await startLoanApplication();
            return;
        }
        if (wantsEMI && currentMode !== 'emi-calculator') {
            await cancelCurrentFlow();
            startEMICalculation();
            return;
        }
        if (wantsEligibility && currentMode !== 'eligibility-check') {
            await cancelCurrentFlow();
            await handleVerificationAgent(message);
            return;
        }
        if (lowerMessage.includes('document') || lowerMessage.includes('kyc') || lowerMessage.includes('required')) {
            handleDocumentQuery();
            return;
        }
        
        // If Sales Agent is collecting data, handle responses
        if (conversationData.stage === 'collecting_loan_amount') {
            await handleLoanAmountResponse(message);
            return;
        } else if (conversationData.stage === 'collecting_tenure') {
            await handleTenureResponse(message);
            return;
        } else if (conversationData.stage === 'collecting_purpose') {
            await handlePurposeResponse(message);
            return;
        } else if (conversationData.stage === 'collecting_emi_calc') {
            handleEMIResponse(message);
            return;
        }
        
        // If underwriting is in progress, don't interrupt
        if (conversationData.stage === 'underwriting' || currentAgent === 'underwriting') {
            addMessage('bot', `⏳ Underwriting is in progress. Please wait for the evaluation to complete.`, 'Master Agent');
            document.getElementById('sendBtn').disabled = false;
            return;
        }
        
        // Otherwise, let the active agent handle it (don't let Master Agent interrupt)
        document.getElementById('sendBtn').disabled = false;
        return;
    }
    
    // Check if we're in the middle of collecting loan application data
    if (conversationData.stage === 'collecting_loan_amount') {
        await handleLoanAmountResponse(message);
    } else if (conversationData.stage === 'collecting_tenure') {
        await handleTenureResponse(message);
    } else if (conversationData.stage === 'collecting_purpose') {
        await handlePurposeResponse(message);
    } else if (conversationData.stage === 'collecting_emi_calc') {
        // Check if user wants to switch to loan application
        if (wantsLoanApplication) {
            await cancelCurrentFlow();
            await startLoanApplication();
        } else {
            handleEMIResponse(message);
        }
    } else {
        // Only Master Agent handles general queries when no agent is active
        // Prioritize intent detection
        if (wantsLoanApplication) {
            await startLoanApplication();
        } else if (wantsEligibility) {
            await handleVerificationAgent(message);
        } else if (wantsEMI) {
            startEMICalculation();
        } else if (lowerMessage.includes('document') || lowerMessage.includes('kyc') || lowerMessage.includes('required') || lowerMessage.includes('what documents')) {
            handleDocumentQuery();
        } else if (lowerMessage.includes('status') || lowerMessage.includes('check') || lowerMessage.includes('application')) {
            await handleApplicationStatus();
        } else {
            // If message contains "loan" but didn't match above, try to start loan application
            if (lowerMessage.includes('loan')) {
                await startLoanApplication();
            } else {
                handleGeneralQuery(message);
            }
        }
    }
    
    document.getElementById('sendBtn').disabled = false;
}

// Cancel current flow and reset
async function cancelCurrentFlow() {
    const currentStage = conversationData.stage;
    
    if (currentStage !== 'greeting' && currentStage !== 'completed') {
        addMessage('bot', `🔄 Cancelling current process...`, 'Master Agent');
        
        // Reset conversation state
        conversationData.loanAmount = null;
        conversationData.tenure = null;
        conversationData.purpose = null;
        conversationData.collectedData = {};
        conversationData.stage = 'greeting';
        conversationData.currentQuestion = null;
        currentMode = null;
        
        // Reset agent statuses
        updateAgentStatus('sales', 'idle');
        updateAgentStatus('verification', 'idle');
        updateAgentStatus('underwriting', 'idle');
        updateAgentStatus('sanction', 'idle');
        updateAgentStatus('master', 'active');
        currentAgent = 'master';
        
        updateModeIndicator(null);
        
        await saveConversationState();
    }
}

// Start loan application process
async function startLoanApplication() {
    // Reset conversation state for new application
    conversationData.loanAmount = null;
    conversationData.tenure = null;
    conversationData.purpose = null;
    conversationData.collectedData = {};
    
    updateAgentStatus('sales', 'working');
    updateAgentStatus('master', 'idle');
    currentAgent = 'sales';
    currentMode = 'loan-application';
    conversationData.stage = 'collecting_loan_amount';
    conversationData.currentQuestion = 'loan_amount';
    
    updateModeIndicator('loan-application');
    
    addMessage('bot', `Great! I'll help you apply for a loan. Let me collect some details from you.\n\n**Question 1 of 3:**\n\n💰 What loan amount are you looking for?\n\nPlease enter the amount (e.g., ₹5,00,000 or 500000)\n\n*Minimum loan amount: ₹50,000*`, 'Sales Agent');
    
    // Save conversation state
    await saveConversationState();
}

// Handle loan amount response
async function handleLoanAmountResponse(message) {
    const lowerMessage = message.toLowerCase().trim();
    
    // Check if user wants to cancel or switch
    if (lowerMessage.includes('cancel') || lowerMessage.includes('restart') || lowerMessage.includes('back')) {
        await cancelCurrentFlow();
        return;
    }
    
    // Extract loan amount from message - handle various formats
    let amount = null;
    
    // Try to extract number (handles ₹5,00,000, 5000000, 50 lakhs, etc.)
    const amountMatch = message.match(/₹?\s*(\d+[\d,]*)/);
    if (amountMatch) {
        amount = parseInt(amountMatch[1].replace(/,/g, ''));
    }
    
    // Handle "lakhs" or "crores"
    if (!amount) {
        const lakhMatch = message.match(/(\d+\.?\d*)\s*(lakh|lakhs|lac|lacs)/i);
        if (lakhMatch) {
            amount = Math.round(parseFloat(lakhMatch[1]) * 100000);
        }
    }
    
    if (!amount) {
        const croreMatch = message.match(/(\d+\.?\d*)\s*(crore|crores|cr)/i);
        if (croreMatch) {
            amount = Math.round(parseFloat(croreMatch[1]) * 10000000);
        }
    }
    
    if (amount) {
        // Validate amount - BFSI requirement: minimum ₹50,000
        if (amount < 50000) {
            addMessage('bot', `⚠️ **Invalid Amount**\n\nMinimum loan amount is ₹50,000.\n\nPlease enter a valid amount:\n• ₹50,000 (Minimum)\n• ₹5,00,000\n• ₹10,00,000`, 'Sales Agent');
            return;
        }
        
        if (amount > 10000000) {
            addMessage('bot', `⚠️ **Amount Too High**\n\nMaximum loan amount is ₹1,00,00,000 (₹1 Crore).\n\n**Your entered:** ₹${amount.toLocaleString()} (₹${(amount/10000000).toFixed(1)} Crores)\n\n**Please enter a lower amount:**\n• ₹5,00,000 (₹5 Lakhs)\n• ₹10,00,000 (₹10 Lakhs)\n• ₹50,00,000 (₹50 Lakhs)\n• ₹1,00,00,000 (₹1 Crore - Maximum)`, 'Sales Agent');
            return;
        }
        
        conversationData.loanAmount = amount;
        conversationData.collectedData.loanAmount = amount;
        conversationData.stage = 'collecting_tenure';
        conversationData.currentQuestion = 'tenure';
        
        // Save to database
        await saveLoanApplicationData('loanAmount', amount);
        
        addMessage('bot', `✅ **Great!** I've noted your loan amount: **₹${amount.toLocaleString()}**\n\n**Question 2 of 3:**\n\n📅 How many months would you like to repay the loan?\n\n**Options:**\n• 12 months (1 year)\n• 24 months (2 years)\n• 36 months (3 years)\n• 48 months (4 years)\n• 60 months (5 years)\n\n*You can also type "cancel" to start over*`, 'Sales Agent');
        
        // Save conversation state
        await saveConversationState();
    } else {
        // Check if it's a text response that might indicate user wants something else
        if (lowerMessage.includes('apply') || lowerMessage.includes('loan') || lowerMessage.includes('need')) {
            addMessage('bot', `I see you want to apply for a loan! Let's start fresh.\n\n💰 **What loan amount are you looking for?**\n\nPlease enter the amount in numbers (e.g., ₹5,00,000 or 500000)`, 'Sales Agent');
        } else {
            addMessage('bot', `⚠️ **I didn't understand that.**\n\nPlease enter a valid loan amount in numbers.\n\n**Examples:**\n• ₹5,00,000\n• 500000\n• 5 lakhs\n• ₹10,00,000\n\n*Or type "cancel" to start over*`, 'Sales Agent');
        }
    }
}

// Handle tenure response
async function handleTenureResponse(message) {
    const lowerMessage = message.toLowerCase().trim();
    
    // Check if user wants to cancel or switch
    if (lowerMessage.includes('cancel') || lowerMessage.includes('restart') || lowerMessage.includes('back')) {
        await cancelCurrentFlow();
        return;
    }
    
    // Extract tenure - handle various formats
    let tenure = null;
    
    // Try to match "X months" or "X years" or just number
    const tenureMatch = message.match(/(\d+)\s*(month|year|yr|mo|months|years|m|y)/i) || message.match(/(\d+)/);
    if (tenureMatch) {
        tenure = parseInt(tenureMatch[1]);
        
        // Convert years to months if needed
        if (lowerMessage.includes('year') || lowerMessage.includes('yr') || lowerMessage.includes(' y')) {
            tenure = tenure * 12;
        }
        
        // Handle common tenure options
        if (lowerMessage.includes('one') || (lowerMessage === '1')) {
            tenure = 12;
        } else if (lowerMessage.includes('two') || (lowerMessage === '2')) {
            tenure = 24;
        } else if (lowerMessage.includes('three') || (lowerMessage === '3')) {
            tenure = 36;
        } else if (lowerMessage.includes('four') || (lowerMessage === '4')) {
            tenure = 48;
        } else if (lowerMessage.includes('five') || (lowerMessage === '5')) {
            tenure = 60;
        }
    }
    
    if (tenure) {
        // Validate tenure - BFSI requirement: minimum 12 months
        if (tenure < 12) {
            addMessage('bot', `⚠️ **Invalid Tenure**\n\nMinimum tenure is 12 months.\n\n**Please choose from:**\n• 12 months (1 year) - Minimum\n• 24 months (2 years)\n• 36 months (3 years)\n• 48 months (4 years)\n• 60 months (5 years)`, 'Sales Agent');
            return;
        }
        
        if (tenure > 60) {
            addMessage('bot', `⚠️ **Tenure Too Long**\n\nMaximum tenure is 60 months (5 years).\n\n**Please choose from:**\n• 12 months (1 year)\n• 24 months (2 years)\n• 36 months (3 years)\n• 48 months (4 years)\n• 60 months (5 years)`, 'Sales Agent');
            return;
        }
        
        // Round to nearest valid option
        const validTenures = [12, 24, 36, 48, 60];
        const nearestTenure = validTenures.reduce((prev, curr) => 
            Math.abs(curr - tenure) < Math.abs(prev - tenure) ? curr : prev
        );
        
        conversationData.tenure = nearestTenure;
        conversationData.collectedData.tenure = nearestTenure;
        conversationData.stage = 'collecting_purpose';
        conversationData.currentQuestion = 'purpose';
        
        // Save to database
        await saveLoanApplicationData('tenure', nearestTenure);
        
        addMessage('bot', `✅ **Perfect!** Tenure noted: **${nearestTenure} months** (${nearestTenure/12} ${nearestTenure/12 === 1 ? 'year' : 'years'})\n\n**Question 3 of 3:**\n\n🎯 What is the purpose of this loan?\n\n**Common purposes:**\n• Home renovation\n• Medical expenses\n• Education\n• Business\n• Wedding\n• Debt consolidation\n• Other (please specify)\n\n*You can type "cancel" to start over*`, 'Sales Agent');
        
        // Save conversation state
        await saveConversationState();
    } else {
        addMessage('bot', `⚠️ **I didn't understand that.**\n\nPlease enter a valid tenure.\n\n**Examples:**\n• 36 months\n• 3 years\n• 36\n• Three years\n\n*Or type "cancel" to start over*`, 'Sales Agent');
    }
}

// Handle purpose response
async function handlePurposeResponse(message) {
    const purpose = message.trim();
    
    if (purpose.length < 3) {
        addMessage('bot', `⚠️ Please provide a valid purpose for the loan.\n\n**Examples:** Home renovation, Medical expenses, Education, Business, Wedding, etc.`, 'Sales Agent');
        return;
    }
    
    // Normalize common purposes
    const lowerPurpose = purpose.toLowerCase();
    let normalizedPurpose = purpose;
    
    if (lowerPurpose.includes('home') || lowerPurpose.includes('renovation') || lowerPurpose.includes('house')) {
        normalizedPurpose = 'Home Renovation';
    } else if (lowerPurpose.includes('medical') || lowerPurpose.includes('health') || lowerPurpose.includes('hospital')) {
        normalizedPurpose = 'Medical Expenses';
    } else if (lowerPurpose.includes('education') || lowerPurpose.includes('study') || lowerPurpose.includes('school')) {
        normalizedPurpose = 'Education';
    } else if (lowerPurpose.includes('business') || lowerPurpose.includes('commercial')) {
        normalizedPurpose = 'Business';
    } else if (lowerPurpose.includes('wedding') || lowerPurpose.includes('marriage')) {
        normalizedPurpose = 'Wedding';
    } else if (lowerPurpose.includes('debt') || lowerPurpose.includes('consolidation')) {
        normalizedPurpose = 'Debt Consolidation';
    } else {
        // Capitalize first letter of each word
        normalizedPurpose = purpose.split(' ').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        ).join(' ');
    }
    
    conversationData.purpose = normalizedPurpose;
    conversationData.collectedData.purpose = normalizedPurpose;
    conversationData.stage = 'verifying';
    conversationData.currentQuestion = null;
    
    // Save to database
    await saveLoanApplicationData('purpose', normalizedPurpose);
    
    addMessage('bot', `✅ **Thank you!** Purpose noted: **${normalizedPurpose}**\n\n📋 **Summary of your loan application:**\n\n• **Loan Amount:** ₹${conversationData.loanAmount.toLocaleString()}\n• **Tenure:** ${conversationData.tenure} months (${conversationData.tenure/12} ${conversationData.tenure/12 === 1 ? 'year' : 'years'})\n• **Purpose:** ${normalizedPurpose}\n\n⏳ Let me verify your details and check your eligibility...`, 'Sales Agent');
    
    // Save complete application
    await saveCompleteLoanApplication();
    
    // Update agent status
    updateAgentStatus('sales', 'idle');
    
    // Move to verification agent
    setTimeout(() => {
        handleVerificationAgent('verify');
    }, 2000);
}

// Verification Agent - Verify customer data
async function handleVerificationAgent(message) {
    updateAgentStatus('verification', 'working');
    updateAgentStatus('sales', 'idle');
    updateAgentStatus('master', 'idle');
    currentAgent = 'verification';
    currentMode = 'eligibility-check';
    updateModeIndicator('eligibility-check');
    
    addMessage('bot', `🔍 **Eligibility Check Mode**\n\n🔐 Verifying your customer profile and KYC details...`, 'Verification Agent');
    
    // Simulate verification
    setTimeout(async () => {
        // Fetch customer profile
        try {
            const response = await fetch(`${API_BASE}/customer-profile/${conversationData.mobile}`);
            const result = await response.json();
            
            if (result.success && result.data) {
                const profile = result.data;
                addMessage('bot', `✅ Verification complete!\n\n📋 Your Profile:\n• Name: ${profile.name}\n• Credit Score: ${profile.creditScore}\n• Pre-approved Limit: ₹${profile.preApprovedLimit.toLocaleString()}\n• KYC Status: ${profile.kycStatus}`, 'Verification Agent');
                
                // Move to underwriting
                setTimeout(() => {
                    handleUnderwritingAgent();
                }, 2000);
            } else {
                addMessage('bot', `⚠️ Profile not found. Please register first or contact support.`, 'Verification Agent');
                updateAgentStatus('verification', 'idle');
                updateAgentStatus('master', 'active');
                currentAgent = 'master';
                currentMode = null;
                updateModeIndicator(null);
            }
        } catch (error) {
            addMessage('bot', `✅ Verification complete! Moving to eligibility check...`, 'Verification Agent');
            setTimeout(() => {
                handleUnderwritingAgent();
            }, 2000);
        }
    }, 2000);
}

// Underwriting Agent - Evaluate eligibility
async function handleUnderwritingAgent() {
    updateAgentStatus('underwriting', 'working');
    updateAgentStatus('verification', 'idle');
    currentAgent = 'underwriting';
    conversationData.stage = 'underwriting';
    
    addMessage('bot', `📊 Evaluating your loan eligibility and risk assessment...`, 'Underwriting Agent');
    
    // Get customer profile
    let profile;
    try {
        const response = await fetch(`${API_BASE}/customer-profile/${conversationData.mobile}`);
        const result = await response.json();
        profile = result.success ? result.data : getDemoProfile(conversationData.mobile);
    } catch (error) {
        profile = getDemoProfile(conversationData.mobile);
    }
    
    // Calculate eligibility
    setTimeout(async () => {
        const loanAmount = conversationData.loanAmount || 500000;
        const tenure = conversationData.tenure || 36;
        
        const evaluation = evaluateEligibility(profile, loanAmount, tenure);
        
        // Save loan application
        await saveCompleteLoanApplication();
        
        // Also save evaluation details
        try {
            await fetch(`${API_BASE}/loan-application`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    mobile: conversationData.mobile,
                    amount: loanAmount,
                    tenure: tenure,
                    purpose: conversationData.purpose || 'Personal Loan',
                    status: evaluation.status,
                    evaluation: evaluation,
                    timestamp: new Date().toISOString()
                })
            });
        } catch (error) {
            console.error('Error saving evaluation:', error);
        }
        
        // Show detailed Underwriting Summary Panel
        const emiRatio = evaluation.emiRatio || ((evaluation.emi / profile.monthlySalary) * 100);
        const maxAllowedEMI = profile.monthlySalary * 0.5;
        
        let summaryText = `📊 **Underwriting Summary**\n\n`;
        summaryText += `**Credit Score:** ${profile.creditScore} (${evaluation.creditBand.band})\n`;
        summaryText += `**Pre-Approved Limit:** ₹${profile.preApprovedLimit.toLocaleString()}\n`;
        summaryText += `**Requested Amount:** ₹${loanAmount.toLocaleString()}\n`;
        summaryText += `**Monthly Salary:** ₹${profile.monthlySalary.toLocaleString()}\n`;
        summaryText += `**Tenure:** ${tenure} months\n`;
        summaryText += `**Interest Rate:** ${evaluation.appliedRate}%\n`;
        summaryText += `**EMI:** ₹${evaluation.emi.toLocaleString()}\n`;
        summaryText += `**EMI / Salary:** ${emiRatio.toFixed(1)}%\n\n`;
        
        summaryText += `**Rules Triggered:**\n`;
        if (loanAmount <= profile.preApprovedLimit) {
            summaryText += `✅ Amount ≤ pre-approved limit\n`;
        } else if (loanAmount <= profile.preApprovedLimit * 2) {
            summaryText += `⚠️ Amount > pre-approved limit (≤ 2× limit)\n`;
        } else {
            summaryText += `❌ Amount > 2× pre-approved limit\n`;
        }
        
        if (profile.creditScore >= 700) {
            summaryText += `✅ Credit score ≥ 700\n`;
        } else {
            summaryText += `❌ Credit score < 700\n`;
        }
        
        if (evaluation.emi <= maxAllowedEMI) {
            summaryText += `✅ EMI ≤ 50% of salary\n`;
        } else {
            summaryText += `❌ EMI > 50% of salary\n`;
        }
        
        addMessage('bot', summaryText, 'Underwriting Agent');
        
        // Show Final Decision
        setTimeout(() => {
            let decisionText = `\n**Final Decision:** `;
            
            if (evaluation.status === 'approved') {
                decisionText += `✅ **APPROVED**\n\n`;
                decisionText += `**Reason:** Loan amount is within pre-approved limit and all eligibility criteria are met.\n\n`;
                decisionText += `Your loan application has been approved!`;
                addMessage('bot', decisionText, 'Underwriting Agent');
                
                conversationData.stage = 'underwriting_complete';
                updateAgentStatus('underwriting', 'idle');
                
                // Move to sanction agent
                setTimeout(() => {
                    handleSanctionAgent(evaluation, profile, loanAmount, tenure);
                }, 2000);
            } else if (evaluation.status === 'salary-required') {
                decisionText += `⏳ **SALARY SLIP REQUIRED**\n\n`;
                decisionText += `**Reason:** Loan amount exceeds pre-approved limit but is within 2× limit. Salary slip verification required.\n\n`;
                decisionText += `Please upload your salary slip for further verification.`;
                addMessage('bot', decisionText, 'Underwriting Agent');
                
                conversationData.stage = 'underwriting_complete';
                updateAgentStatus('underwriting', 'idle');
                updateAgentStatus('master', 'active');
                currentAgent = 'master';
            } else {
                decisionText += `❌ **REJECTED**\n\n`;
                decisionText += `**Reason:** ${evaluation.reason}\n\n`;
                decisionText += `**Suggestions:**\n`;
                decisionText += `• Try a lower loan amount (≤ ₹${profile.preApprovedLimit.toLocaleString()})\n`;
                if (profile.creditScore < 700) {
                    decisionText += `• Improve your credit score (currently ${profile.creditScore}, need ≥ 700)\n`;
                }
                decisionText += `• Consider a longer tenure to reduce EMI`;
                addMessage('bot', decisionText, 'Underwriting Agent');
                
                conversationData.stage = 'underwriting_complete';
                updateAgentStatus('underwriting', 'idle');
                updateAgentStatus('master', 'active');
                currentAgent = 'master';
                currentMode = null;
                updateModeIndicator(null);
            }
        }, 1500);
    }, 2000);
}

// Sanction Agent - Generate sanction letter
async function handleSanctionAgent(evaluation, profile, loanAmount, tenure) {
    updateAgentStatus('sanction', 'working');
    currentAgent = 'sanction';
    
    addMessage('bot', `📄 Generating your sanction letter...`, 'Sanction Agent');
    
    setTimeout(() => {
        const sanctionId = 'SAN' + Date.now();
        const sanctionDate = new Date().toLocaleDateString('en-IN');
        
        let sanctionText = `✅ **Sanction Letter Generated!**\n\n`;
        sanctionText += `📋 **Sanction Details:**\n\n`;
        sanctionText += `**Reference ID:** ${sanctionId}\n`;
        sanctionText += `**Loan Amount:** ₹${loanAmount.toLocaleString()}\n`;
        sanctionText += `**Tenure:** ${tenure} months\n`;
        sanctionText += `**Interest Rate:** ${evaluation.appliedRate}%\n`;
        sanctionText += `**Monthly EMI:** ₹${evaluation.emi.toLocaleString()}\n`;
        sanctionText += `**Approval Date:** ${sanctionDate}\n\n`;
        sanctionText += `Your loan has been approved! You can download the sanction letter below or view full details on the dashboard.`;
        
        addMessage('bot', sanctionText, 'Sanction Agent');
        
        // Add download button message
        setTimeout(() => {
            addMessage('bot', `📥 **Download Sanction Letter**\n\n🔗 [View Dashboard](dashboard.html) | Reference: ${sanctionId}`, 'Sanction Agent');
            
            conversationData.stage = 'completed';
            updateAgentStatus('sanction', 'idle');
            updateAgentStatus('master', 'active');
            currentAgent = 'master';
            currentMode = null;
            updateModeIndicator(null);
        }, 1000);
    }, 2000);
}

// Start EMI calculation
function startEMICalculation() {
    conversationData.stage = 'collecting_emi_calc';
    conversationData.currentQuestion = 'emi_amount';
    currentMode = 'emi-calculator';
    updateAgentStatus('master', 'active');
    currentAgent = 'master';
    
    updateModeIndicator('emi-calculator');
    
    addMessage('bot', `🧮 **EMI Calculator Mode**\n\nI can help you calculate EMI! Let me collect the details.\n\n**Step 1 of 3:**\n\n💰 What is the loan amount?\n\nPlease enter the amount (e.g., ₹5,00,000 or 500000)\n\n*Minimum amount: ₹50,000*`, 'Master Agent');
}

// Handle EMI calculation responses
async function handleEMIResponse(message) {
    const lowerMessage = message.toLowerCase().trim();
    
    // Check if user wants to cancel or switch
    if (lowerMessage.includes('cancel') || lowerMessage.includes('restart') || lowerMessage.includes('back')) {
        await cancelCurrentFlow();
        return;
    }
    
    // Check if user wants to switch to loan application
    if (lowerMessage.includes('apply') || lowerMessage.includes('need loan') || lowerMessage.includes('want loan')) {
        await cancelCurrentFlow();
        await startLoanApplication();
        return;
    }
    
    if (conversationData.currentQuestion === 'emi_amount') {
        const amountMatch = message.match(/₹?(\d+[\d,]*)/);
        if (amountMatch) {
            const amount = parseInt(amountMatch[1].replace(/,/g, ''));
            
            // Validate amount - BFSI requirement: minimum ₹50,000
            if (amount < 50000) {
                addMessage('bot', `⚠️ **Invalid Amount**\n\nMinimum amount is ₹50,000.\n\nPlease enter a valid amount (e.g., ₹5,00,000)`, 'Master Agent');
                return;
            }
            
            if (amount > 100000000) {
                addMessage('bot', `⚠️ **Amount Too High**\n\nPlease enter a reasonable amount.\n\n**Examples:**\n• ₹5,00,000\n• ₹10,00,000\n• ₹50,00,000`, 'Master Agent');
                return;
            }
            
            conversationData.collectedData.emiAmount = amount;
            conversationData.currentQuestion = 'emi_rate';
            addMessage('bot', `✅ Amount noted: ₹${amount.toLocaleString()}\n\n**Step 2 of 3:**\n\n📊 What is the interest rate?\n\nPlease enter the rate (e.g., 10.5% or 10.5)\n\n*Rate must be between 8% and 30%*\n\n*Type "cancel" to start over or "apply loan" to switch to loan application*`, 'Master Agent');
        } else {
            addMessage('bot', `⚠️ **I didn't understand that.**\n\nPlease enter a valid loan amount in numbers.\n\n**Examples:**\n• ₹5,00,000\n• 500000\n• 5 lakhs`, 'Master Agent');
        }
    } else if (conversationData.currentQuestion === 'emi_rate') {
        const rateMatch = message.match(/(\d+\.?\d*)\s*%?/);
        if (rateMatch) {
            const rate = parseFloat(rateMatch[1]);
            
            // Validate rate - BFSI requirement: 8% to 30%
            if (rate < 8 || rate > 30) {
                addMessage('bot', `⚠️ **Invalid Interest Rate**\n\nInterest rate should be between 8% and 30%.\n\nPlease enter a valid rate (e.g., 10.5%)`, 'Master Agent');
                return;
            }
            
            conversationData.collectedData.emiRate = rate;
            conversationData.currentQuestion = 'emi_tenure';
            addMessage('bot', `✅ Interest rate noted: ${rate}%\n\n**Step 3 of 3:**\n\n📅 What is the tenure in months?\n\nPlease enter the tenure (e.g., 36 months or 36)\n\n*Type "cancel" to start over*`, 'Master Agent');
        } else {
            addMessage('bot', `⚠️ **I didn't understand that.**\n\nPlease enter a valid interest rate.\n\n**Examples:**\n• 10.5%\n• 10.5\n• 12`, 'Master Agent');
        }
    } else if (conversationData.currentQuestion === 'emi_tenure') {
        const tenureMatch = message.match(/(\d+)/);
        if (tenureMatch) {
            let tenure = parseInt(tenureMatch[1]);
            
            // Handle "1 month" or "1 year" etc.
            if (lowerMessage.includes('month') && tenure === 1) {
                tenure = 1;
            } else if (lowerMessage.includes('year') || lowerMessage.includes('yr')) {
                tenure = tenure * 12;
            }
            
            // Validate tenure - BFSI requirement: minimum 12 months
            if (tenure < 12) {
                addMessage('bot', `⚠️ **Invalid Tenure**\n\nMinimum tenure is 12 months.\n\nPlease enter a valid tenure (e.g., 12, 24, 36 months)`, 'Master Agent');
                return;
            }
            
            if (tenure > 120) {
                addMessage('bot', `⚠️ **Tenure Too Long**\n\nMaximum tenure is 120 months (10 years).\n\nPlease enter a valid tenure (e.g., 12, 24, 36, 60 months)`, 'Master Agent');
                return;
            }
            
            const emi = calculateEMI(
                conversationData.collectedData.emiAmount,
                conversationData.collectedData.emiRate,
                tenure
            );
            const totalAmount = emi * tenure;
            const totalInterest = totalAmount - conversationData.collectedData.emiAmount;
            
            addMessage('bot', `✅ **EMI Calculation Complete!**\n\n📊 **Results:**\n• Loan Amount: ₹${conversationData.collectedData.emiAmount.toLocaleString()}\n• Interest Rate: ${conversationData.collectedData.emiRate}%\n• Tenure: ${tenure} ${tenure === 1 ? 'month' : 'months'}\n• **Monthly EMI: ₹${emi.toLocaleString()}**\n• Total Amount: ₹${totalAmount.toLocaleString()}\n• Total Interest: ₹${totalInterest.toLocaleString()}\n\n💡 Would you like to apply for this loan? Type "apply loan" to start your application.`, 'Master Agent');
            
            conversationData.stage = 'greeting';
            conversationData.currentQuestion = null;
            conversationData.collectedData = {};
            currentMode = null;
            updateModeIndicator(null);
        } else {
            addMessage('bot', `⚠️ **I didn't understand that.**\n\nPlease enter a valid tenure in months.\n\n**Examples:**\n• 36 months\n• 36\n• 3 years`, 'Master Agent');
        }
    }
}

// Handle document query
function handleDocumentQuery() {
    addMessage('bot', `📄 **Required Documents for Loan Application:**\n\n✅ Identity Proof:\n• PAN Card\n• Aadhaar Card\n\n✅ Address Proof:\n• Utility Bill\n• Bank Statement\n\n✅ Income Proof:\n• Salary Slips (last 3 months)\n• Bank Statements (last 6 months)\n\n✅ Employment Proof:\n• Employment Certificate\n• Offer Letter\n\n*Note: KYC details will be collected securely during the application process.*`, 'Master Agent');
}

// Handle application status
async function handleApplicationStatus() {
    addMessage('bot', `🔍 Checking your application status...`, 'Master Agent');
    
    setTimeout(() => {
        addMessage('bot', `📊 **Application Status:**\n\n• Stage: Underwriting\n• Status: In Progress\n• Last Updated: ${new Date().toLocaleString()}\n\nFor detailed status, please visit the [Dashboard](dashboard.html)`, 'Master Agent');
    }, 1500);
}

// Handle general queries - ONLY when Master Agent is active and no other agent is working
function handleGeneralQuery(message) {
    // Don't respond if another agent is active
    if (currentAgent !== 'master' && currentAgent !== null) {
        return;
    }
    
    // Don't respond if we're in an active flow
    if (conversationData.stage !== 'greeting' && conversationData.stage !== 'completed' && conversationData.stage !== 'underwriting_complete') {
        return;
    }
    
    const responses = [
        `I understand you're asking about "${message}". Let me help you with that. Would you like to apply for a loan or check your eligibility?`,
        `That's a great question! I can help you with loan applications, eligibility checks, EMI calculations, and more. What would you like to know?`,
        `I'm here to assist you with your loan needs. You can ask me about:\n• Loan application process\n• Eligibility criteria\n• EMI calculations\n• Required documents\n\nHow can I help you today?`
    ];
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    addMessage('bot', randomResponse, 'Master Agent');
}

// Add message to chat
function addMessage(type, text, sender) {
    const messagesContainer = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}-message`;
    
    const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    
    messageDiv.innerHTML = `
        <div class="message-avatar">
            <i class="fas fa-${type === 'bot' ? 'robot' : 'user'}"></i>
        </div>
        <div class="message-content">
            <div class="message-header">
                <span class="message-sender">${sender}</span>
                <span class="message-time">${time}</span>
            </div>
            <div class="message-text">${formatMessage(text)}</div>
        </div>
    `;
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    // Save to conversation history (only for display, not for state)
    saveConversationMessage(type, text, sender);
}

// Format message text (markdown-like)
function formatMessage(text) {
    // Convert markdown-style links
    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color: inherit; text-decoration: underline;">$1</a>');
    
    // Convert **bold**
    text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    
    // Convert line breaks
    text = text.replace(/\n/g, '<br>');
    
    return text;
}

// Show typing indicator
function showTypingIndicator() {
    const messagesContainer = document.getElementById('chatMessages');
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot-message typing-message';
    typingDiv.id = 'typingIndicator';
    
    typingDiv.innerHTML = `
        <div class="message-avatar">
            <i class="fas fa-robot"></i>
        </div>
        <div class="message-content">
            <div class="typing-indicator">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
        </div>
    `;
    
    messagesContainer.appendChild(typingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Hide typing indicator
function hideTypingIndicator() {
    const typingIndicator = document.getElementById('typingIndicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
    document.getElementById('sendBtn').disabled = false;
}

// Update agent status
function updateAgentStatus(agentName, status) {
    const agentItem = document.getElementById(`agent-${agentName}`);
    if (agentItem) {
        const statusEl = agentItem.querySelector('.agent-status');
        statusEl.textContent = status.charAt(0).toUpperCase() + status.slice(1);
        statusEl.className = `agent-status ${status}`;
        
        // Update active state
        document.querySelectorAll('.agent-status-item').forEach(item => {
            item.classList.remove('active');
        });
        
        if (status === 'active' || status === 'working') {
            agentItem.classList.add('active');
        }
    }
}

// Update mode indicator
function updateModeIndicator(mode) {
    // Remove existing mode indicator if any
    const existingIndicator = document.querySelector('.mode-indicator');
    if (existingIndicator) {
        existingIndicator.remove();
    }
    
    // Add mode indicator to chat header
    const chatHeader = document.querySelector('.chat-header-info');
    if (chatHeader && mode) {
        const modeLabels = {
            'loan-application': '📄 Loan Application Mode',
            'emi-calculator': '🧮 EMI Calculator Mode',
            'eligibility-check': '🔍 Eligibility Check Mode'
        };
        
        const indicator = document.createElement('div');
        indicator.className = 'mode-indicator';
        indicator.textContent = modeLabels[mode] || mode;
        indicator.style.cssText = `
            display: inline-block;
            margin-top: 0.5rem;
            padding: 0.25rem 0.75rem;
            background: rgba(99, 102, 241, 0.1);
            color: #6366f1;
            border-radius: 0.5rem;
            font-size: 0.875rem;
            font-weight: 500;
        `;
        chatHeader.appendChild(indicator);
    }
}

// Get demo profile
function getDemoProfile(mobile) {
    const DEMO_PROFILES = {
        '9876543210': { creditScore: 820, preApprovedLimit: 500000, monthlySalary: 75000 },
        '9123456780': { creditScore: 680, preApprovedLimit: 200000, monthlySalary: 45000 },
        '7654321098': { creditScore: 750, preApprovedLimit: 800000, monthlySalary: 120000 },
        '9679012345': { creditScore: 620, preApprovedLimit: 100000, monthlySalary: 35000 },
        '8765432109': { creditScore: 780, preApprovedLimit: 600000, monthlySalary: 95000 }
    };
    
    return DEMO_PROFILES[mobile] || { creditScore: 700, preApprovedLimit: 300000, monthlySalary: 50000 };
}

// Evaluate eligibility (same logic as dashboard)
function evaluateEligibility(profile, loanAmount, tenure) {
    const creditScore = profile.creditScore || 700;
    const preApprovedLimit = profile.preApprovedLimit || 300000;
    const monthlySalary = profile.monthlySalary || 50000;
    
    let status = 'pending';
    let reason = '';
    
    const creditBand = {
        band: creditScore >= 750 ? 'Excellent' : creditScore >= 700 ? 'Good' : 'Poor',
        range: creditScore >= 750 ? '750-900' : creditScore >= 700 ? '700-749' : '<700'
    };
    const baseRate = creditScore >= 750 ? 8.5 : creditScore >= 700 ? 10.5 : 12.5;
    const emi = calculateEMI(loanAmount, baseRate, tenure);
    const emiRatio = (emi / monthlySalary) * 100;
    const maxAllowedEMI = monthlySalary * 0.5;
    
    if (loanAmount <= preApprovedLimit) {
        status = 'approved';
        reason = 'Loan amount within pre-approved limit';
    } else if (loanAmount <= preApprovedLimit * 2) {
        status = 'salary-required';
        reason = 'Loan amount exceeds pre-approved limit';
    } else {
        status = 'rejected';
        reason = 'Loan amount exceeds 2× pre-approved limit';
    }
    
    if (creditScore < 700 && status !== 'rejected') {
        status = 'rejected';
        reason = 'Credit score below minimum requirement';
    }
    
    if (emi > maxAllowedEMI && status !== 'rejected') {
        status = 'rejected';
        reason = 'EMI exceeds 50% of monthly salary';
    }
    
    return {
        status,
        reason,
        creditBand,
        appliedRate: baseRate,
        emi,
        emiRatio,
        maxAllowedEMI
    };
}

// Calculate EMI
function calculateEMI(principal, rate, tenure) {
    const monthlyRate = rate / 100 / 12;
    const numberOfPayments = tenure;
    const emi = principal * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
                (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
    return Math.round(emi);
}

// Save user response to database
async function saveUserResponse(question, answer) {
    try {
        await fetch(`${API_BASE}/chatbot/response`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                conversationId: conversationId,
                mobile: conversationData.mobile,
                question: question,
                answer: answer,
                timestamp: new Date().toISOString()
            })
        });
    } catch (error) {
        console.error('Error saving response:', error);
    }
}

// Save loan application data incrementally
async function saveLoanApplicationData(field, value) {
    try {
        await fetch(`${API_BASE}/loan-application/update`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                mobile: conversationData.mobile,
                field: field,
                value: value,
                timestamp: new Date().toISOString()
            })
        });
    } catch (error) {
        console.error('Error saving application data:', error);
    }
}

// Save complete loan application
async function saveCompleteLoanApplication() {
    try {
        const applicationData = {
            mobile: conversationData.mobile,
            amount: conversationData.loanAmount,
            tenure: conversationData.tenure,
            purpose: conversationData.purpose,
            timestamp: new Date().toISOString(),
            source: 'chatbot',
            status: 'pending'
        };
        
        await fetch(`${API_BASE}/loan-application`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(applicationData)
        });
        
        console.log('Loan application saved:', applicationData);
    } catch (error) {
        console.error('Error saving complete application:', error);
    }
}

// Save conversation state
async function saveConversationState() {
    try {
        await fetch(`${API_BASE}/chatbot/state`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                conversationId: conversationId,
                mobile: conversationData.mobile,
                state: conversationData,
                timestamp: new Date().toISOString()
            })
        });
    } catch (error) {
        console.error('Error saving conversation state:', error);
        // Fallback to localStorage
        localStorage.setItem('conversationState', JSON.stringify(conversationData));
    }
}

// Load conversation state
async function loadConversationState() {
    try {
        const response = await fetch(`${API_BASE}/chatbot/state/${conversationData.mobile}`);
        const result = await response.json();
        if (result.success && result.data) {
            conversationData = { ...conversationData, ...result.data.state };
            return true;
        }
    } catch (error) {
        // Fallback to localStorage
        const savedState = localStorage.getItem('conversationState');
        if (savedState) {
            conversationData = { ...conversationData, ...JSON.parse(savedState) };
            return true;
        }
    }
    return false;
}

// Save conversation message
function saveConversationMessage(type, text, sender) {
    const messages = JSON.parse(localStorage.getItem('chatMessages') || '[]');
    messages.push({
        type,
        text,
        sender,
        timestamp: new Date().toISOString()
    });
    localStorage.setItem('chatMessages', JSON.stringify(messages));
}

// Load conversation history (read-only display)
function loadConversationHistory() {
    const messages = JSON.parse(localStorage.getItem('chatMessages') || '[]');
    const messagesContainer = document.getElementById('chatMessages');
    
    // Clear existing messages except welcome message
    const welcomeMsg = messagesContainer.querySelector('.bot-message');
    messagesContainer.innerHTML = '';
    if (welcomeMsg) {
        messagesContainer.appendChild(welcomeMsg);
    }
    
    // Load and display history (read-only, won't affect current state)
    if (messages.length > 0) {
        messages.forEach(msg => {
            // Don't reload if it's part of an incomplete application
            if (msg.type === 'user' && msg.text.toLowerCase().includes('apply')) {
                // Skip old "apply" messages to avoid confusion
                return;
            }
            addMessageToDisplay(msg.type, msg.text, msg.sender, msg.timestamp);
        });
    }
}

// Add message to display only (doesn't affect state)
function addMessageToDisplay(type, text, sender, timestamp) {
    const messagesContainer = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}-message history-message`;
    
    const time = timestamp ? new Date(timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    
    messageDiv.innerHTML = `
        <div class="message-avatar">
            <i class="fas fa-${type === 'bot' ? 'robot' : 'user'}"></i>
        </div>
        <div class="message-content">
            <div class="message-header">
                <span class="message-sender">${sender}</span>
                <span class="message-time">${time}</span>
            </div>
            <div class="message-text">${formatMessage(text)}</div>
        </div>
    `;
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Add conversation separator
function addConversationSeparator() {
    const messagesContainer = document.getElementById('chatMessages');
    const separator = document.createElement('div');
    separator.className = 'conversation-separator';
    separator.textContent = '━━━━ Previous Conversation ━━━━';
    messagesContainer.appendChild(separator);
}

// Clear chat
function clearChat() {
    if (confirm('Are you sure you want to clear all chat history?')) {
        // Clear display
        const messagesContainer = document.getElementById('chatMessages');
        messagesContainer.innerHTML = '';
        
        // Clear storage
        localStorage.removeItem('chatMessages');
        localStorage.removeItem('chatStarted');
        localStorage.removeItem('conversationState');
        
        // Reset state
        resetConversationState();
        
        // Reload page to show fresh welcome message
        location.reload();
    }
}

// Start new conversation
function startNewConversation() {
    // Reset conversation state but keep history visible
    resetConversationState();
    
    // Add separator
    addConversationSeparator();
    
    // Add new conversation message
    addMessage('bot', `🆕 **New Conversation Started**\n\nHow can I help you today?`, 'Master Agent');
    
    // Show suggestions again
    document.getElementById('suggestedQuestions').style.display = 'flex';
    localStorage.removeItem('chatStarted');
    
    updateAgentStatus('master', 'active');
    updateAgentStatus('sales', 'idle');
    updateAgentStatus('verification', 'idle');
    updateAgentStatus('underwriting', 'idle');
    updateAgentStatus('sanction', 'idle');
}

// Minimize chat function (for minimize button)
function minimizeChat() {
    // This is a placeholder - can be implemented if needed
    console.log('Minimize chat clicked');
}

// Initialize on load
document.addEventListener('DOMContentLoaded', initChatbot);

// Final block to ensure all necessary functions are exposed globally
if (typeof window !== 'undefined') {
    window.sendMessage = sendMessage;
    window.sendSuggestion = sendSuggestion;
    window.startNewConversation = startNewConversation;
    window.clearChat = clearChat;
    window.minimizeChat = minimizeChat;
}

