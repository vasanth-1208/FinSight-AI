// API Base URL
const API_BASE = 'http://localhost:3000/api';

// Save data to MongoDB via API
async function saveData(endpoint, data) {
    try {
        const response = await fetch(`${API_BASE}/${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        const result = await response.json();
        return result.success;
    } catch (error) {
        console.error('Save error:', error);
        // Fallback to localStorage
        const key = `${endpoint}_${Date.now()}`;
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    }
}

// Get data from MongoDB via API
async function getData(endpoint) {
    try {
        const response = await fetch(`${API_BASE}/${endpoint}`);
        const result = await response.json();
        return result.success ? (Array.isArray(result.data) ? result.data : [result.data]) : [];
    } catch (error) {
        console.error('Get data error:', error);
        // Fallback to localStorage
        const keys = Object.keys(localStorage);
        const results = keys
            .filter(key => key.startsWith(endpoint.split('/')[0]))
            .map(key => JSON.parse(localStorage.getItem(key)))
            .filter(item => item !== null);
        return results;
    }
}

// Update data via API
async function updateData(endpoint, id, data) {
    try {
        const response = await fetch(`${API_BASE}/${endpoint}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        const result = await response.json();
        return result.success;
    } catch (error) {
        console.error('Update error:', error);
        return false;
    }
}

// Demo customer profiles
const DEMO_PROFILES = {
    '9876543210': {
        name: 'Rahul Sharma',
        mobile: '9876543210',
        customerId: 'CUST001',
        age: 32,
        city: 'Mumbai',
        address: '123, Andheri West, Mumbai - 400053',
        dob: '1992-05-15',
        employmentType: 'Salaried',
        monthlySalary: 75000,
        existingCustomer: 'Yes',
        creditScore: 820,
        preApprovedLimit: 500000,
        kycStatus: 'Verified'
    },
    '9123456780': {
        name: 'Priya Patel',
        mobile: '9123456780',
        customerId: 'CUST002',
        age: 28,
        city: 'Delhi',
        address: '456, Connaught Place, Delhi - 110001',
        dob: '1996-08-22',
        employmentType: 'Salaried',
        monthlySalary: 45000,
        existingCustomer: 'No',
        creditScore: 680,
        preApprovedLimit: 200000,
        kycStatus: 'Verified'
    },
    '7654321098': {
        name: 'Amit Kumar',
        mobile: '7654321098',
        customerId: 'CUST003',
        age: 35,
        city: 'Bangalore',
        address: '789, Koramangala, Bangalore - 560095',
        dob: '1989-03-10',
        employmentType: 'Self-employed',
        monthlySalary: 120000,
        existingCustomer: 'Yes',
        creditScore: 750,
        preApprovedLimit: 800000,
        kycStatus: 'Verified'
    },
    '9679012345': {
        name: 'Sneha Reddy',
        mobile: '9679012345',
        customerId: 'CUST004',
        age: 26,
        city: 'Hyderabad',
        address: '321, Banjara Hills, Hyderabad - 500034',
        dob: '1998-11-05',
        employmentType: 'Salaried',
        monthlySalary: 35000,
        existingCustomer: 'No',
        creditScore: 620,
        preApprovedLimit: 100000,
        kycStatus: 'Pending'
    },
    '8765432109': {
        name: 'Vikram Singh',
        mobile: '8765432109',
        customerId: 'CUST005',
        age: 40,
        city: 'Pune',
        address: '654, Hinjewadi, Pune - 411057',
        dob: '1984-07-18',
        employmentType: 'Salaried',
        monthlySalary: 95000,
        existingCustomer: 'Yes',
        creditScore: 780,
        preApprovedLimit: 600000,
        kycStatus: 'Verified'
    }
};

// Load customer profile
async function loadCustomerProfile(mobile) {
    // Try to get from MongoDB first
    let profile = null;
    try {
        const profiles = await getData(`customer-profile/${mobile}`);
        if (profiles.length > 0) {
            profile = profiles[0];
        }
    } catch (error) {
        console.log('Could not fetch from API, using demo profile');
    }
    
    // Use demo profile if not found
    if (!profile) {
        profile = DEMO_PROFILES[mobile] || {
            name: 'Demo User',
            mobile: mobile,
            customerId: 'CUST' + Math.floor(Math.random() * 1000),
            age: 30,
            city: 'Mumbai',
            address: 'Demo Address',
            dob: '1994-01-01',
            employmentType: 'Salaried',
            monthlySalary: 50000,
            existingCustomer: 'No',
            creditScore: 700,
            preApprovedLimit: 300000,
            kycStatus: 'Pending'
        };

        // Save to MongoDB via API
        try {
            await saveData('customer-profile', profile);
        } catch (error) {
            console.log('Could not save to API, using local storage');
        }
    }

    return profile;
}

// Calculate EMI
function calculateEMI(principal, rate, tenure) {
    const monthlyRate = rate / 100 / 12;
    const numberOfPayments = tenure;
    const emi = principal * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
                (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
    return Math.round(emi);
}

// Get credit score band
function getCreditScoreBand(score) {
    if (score >= 750) return { band: 'Excellent', class: 'excellent', range: '750-900' };
    if (score >= 700) return { band: 'Good', class: 'good', range: '700-749' };
    return { band: 'Poor', class: 'poor', range: '<700' };
}

// Evaluate eligibility
function evaluateEligibility(profile, loanAmount, tenure) {
    const rules = [];
    let status = 'pending';
    let reason = '';
    
    const creditBand = getCreditScoreBand(profile.creditScore);
    const baseRate = profile.creditScore >= 750 ? 8.5 : profile.creditScore >= 700 ? 10.5 : 12.5;
    const appliedRate = baseRate;
    const emi = calculateEMI(loanAmount, appliedRate, tenure);
    const emiRatio = (emi / profile.monthlySalary) * 100;
    const maxAllowedEMI = profile.monthlySalary * 0.5;

    // Rule 1: Loan amount <= pre-approved limit
    if (loanAmount <= profile.preApprovedLimit) {
        rules.push({
            text: 'Loan amount ≤ pre-approved limit → Instant approval',
            status: 'passed',
            icon: 'check-circle'
        });
    } else if (loanAmount <= profile.preApprovedLimit * 2) {
        rules.push({
            text: 'Loan amount ≤ 2× limit → Salary slip required',
            status: 'warning',
            icon: 'exclamation-triangle'
        });
        status = 'salary-required';
        reason = 'Loan amount exceeds pre-approved limit. Salary slip verification required.';
    } else {
        rules.push({
            text: 'Amount > 2× limit → Rejection',
            status: 'failed',
            icon: 'times-circle'
        });
        status = 'rejected';
        reason = 'Loan amount exceeds 2× pre-approved limit.';
    }

    // Rule 2: Credit score check
    if (profile.creditScore < 700) {
        rules.push({
            text: 'Credit score < 700 → Rejection',
            status: 'failed',
            icon: 'times-circle'
        });
        if (status !== 'rejected') {
            status = 'rejected';
            reason = 'Credit score below minimum requirement (700).';
        }
    } else {
        rules.push({
            text: `Credit score ${profile.creditScore} (${creditBand.band}) → Passed`,
            status: 'passed',
            icon: 'check-circle'
        });
    }

    // Rule 3: EMI vs Salary ratio
    if (emi > maxAllowedEMI) {
        rules.push({
            text: 'EMI > 50% of salary → Rejection',
            status: 'failed',
            icon: 'times-circle'
        });
        if (status !== 'rejected') {
            status = 'rejected';
            reason = 'EMI exceeds 50% of monthly salary.';
        }
    } else {
        rules.push({
            text: `EMI (${emiRatio.toFixed(1)}%) ≤ 50% of salary → Passed`,
            status: 'passed',
            icon: 'check-circle'
        });
    }

    if (status === 'pending') {
        status = 'approved';
        reason = 'All eligibility criteria met. Loan approved.';
    }

    return {
        status,
        reason,
        rules,
        creditBand,
        baseRate,
        appliedRate,
        emi,
        emiRatio,
        maxAllowedEMI
    };
}

// Update dashboard with customer data
async function updateDashboard(mobile) {
    const profile = await loadCustomerProfile(mobile);
    
    // Update customer profile panel
    document.getElementById('customerName').textContent = profile.name;
    document.getElementById('customerMobile').textContent = profile.mobile;
    document.getElementById('customerId').textContent = profile.customerId;
    document.getElementById('customerAge').textContent = profile.age;
    document.getElementById('customerCity').textContent = profile.city;
    document.getElementById('customerAddress').textContent = profile.address;
    document.getElementById('customerDOB').textContent = profile.dob;
    document.getElementById('employmentType').textContent = profile.employmentType;
    document.getElementById('monthlySalary').textContent = `₹${profile.monthlySalary.toLocaleString()}`;
    document.getElementById('existingCustomer').textContent = profile.existingCustomer;
    
    const kycStatusEl = document.getElementById('kycStatus');
    kycStatusEl.textContent = profile.kycStatus;
    kycStatusEl.className = `panel-badge ${profile.kycStatus.toLowerCase() === 'verified' ? 'verified' : 'pending'}`;

    // Load loan application if exists
    try {
        const loanApps = await getData(`loan-applications/${mobile}`);
        if (loanApps.length > 0) {
            const latestApp = loanApps[loanApps.length - 1];
            updateLoanApplication(latestApp, profile);
        }
    } catch (error) {
        console.log('Could not load loan applications');
    }
}

// Update loan application display
function updateLoanApplication(app, profile) {
    document.getElementById('loanAmount').textContent = `₹${app.amount.toLocaleString()}`;
    document.getElementById('loanTenure').textContent = `${app.tenure} months`;
    document.getElementById('loanPurpose').textContent = app.purpose || 'Personal Loan';
    document.getElementById('requestTimestamp').textContent = new Date(app.timestamp || Date.now()).toLocaleString();
    
    const evaluation = evaluateEligibility(profile, app.amount, app.tenure);
    
    // Update underwriting panel
    document.getElementById('creditScore').textContent = profile.creditScore;
    const creditBandEl = document.getElementById('creditScoreBand');
    creditBandEl.textContent = `${evaluation.creditBand.band} (${evaluation.creditBand.range})`;
    creditBandEl.className = `score-band ${evaluation.creditBand.class}`;
    
    document.getElementById('preApprovedLimit').textContent = `₹${profile.preApprovedLimit.toLocaleString()}`;
    document.getElementById('baseInterestRate').textContent = `${evaluation.baseRate}%`;
    document.getElementById('maxTenure').textContent = '60 months';
    
    document.getElementById('calcLoanAmount').textContent = `₹${app.amount.toLocaleString()}`;
    document.getElementById('appliedInterestRate').textContent = `${evaluation.appliedRate}%`;
    document.getElementById('calcTenure').textContent = `${app.tenure} months`;
    document.getElementById('calculatedEMI').textContent = `₹${evaluation.emi.toLocaleString()}`;
    document.getElementById('calcMonthlySalary').textContent = `₹${profile.monthlySalary.toLocaleString()}`;
    
    const emiRatioEl = document.getElementById('emiRatio');
    emiRatioEl.textContent = `${evaluation.emiRatio.toFixed(1)}%`;
    if (evaluation.emiRatio <= 30) {
        emiRatioEl.className = 'ratio-value safe';
    } else if (evaluation.emiRatio <= 50) {
        emiRatioEl.className = 'ratio-value warning';
    } else {
        emiRatioEl.className = 'ratio-value danger';
    }
    
    document.getElementById('maxAllowedEMI').textContent = `₹${evaluation.maxAllowedEMI.toLocaleString()}`;
    
    // Update eligibility rules
    const rulesList = document.getElementById('eligibilityRules');
    rulesList.innerHTML = evaluation.rules.map(rule => `
        <div class="rule-item ${rule.status}">
            <i class="fas fa-${rule.icon}"></i>
            <span>${rule.text}</span>
        </div>
    `).join('');
    
    // Update final status
    const statusBadge = document.getElementById('eligibilityStatus');
    statusBadge.textContent = evaluation.status.charAt(0).toUpperCase() + evaluation.status.slice(1);
    statusBadge.className = `status-badge ${evaluation.status}`;
    
    const statusDisplay = document.getElementById('finalStatusDisplay');
    statusDisplay.innerHTML = `
        <div class="status-message ${evaluation.status}">
            <i class="fas fa-${evaluation.status === 'approved' ? 'check-circle' : evaluation.status === 'rejected' ? 'times-circle' : 'exclamation-triangle'}"></i>
            ${evaluation.status.toUpperCase()}
        </div>
        <p style="margin-top: 1rem; color: var(--text-light);">${evaluation.reason}</p>
    `;
    
    // Show/hide panels based on status
    if (evaluation.status === 'salary-required') {
        document.getElementById('salarySlipPanel').style.display = 'block';
    }
    
    if (evaluation.status === 'approved' || evaluation.status === 'rejected') {
        document.getElementById('decisionPanel').style.display = 'block';
        updateDecisionPanel(evaluation, app, profile);
    }
    
    // Update current stage
    const stageMap = {
        'approved': 'Approved',
        'rejected': 'Rejected',
        'salary-required': 'Salary Slip Required',
        'pending': 'Underwriting'
    };
    document.getElementById('currentStage').textContent = stageMap[evaluation.status] || 'Collecting Details';
}

// Update decision panel
function updateDecisionPanel(evaluation, app, profile) {
    const decisionContent = document.getElementById('decisionContent');
    
    if (evaluation.status === 'approved') {
        const sanctionId = 'SAN' + Date.now();
        decisionContent.innerHTML = `
            <div class="decision-approved">
                <div class="decision-title">
                    <i class="fas fa-check-circle"></i> Loan Approved
                </div>
                <div class="decision-details">
                    <div class="info-item">
                        <label>Final Loan Amount</label>
                        <span>₹${app.amount.toLocaleString()}</span>
                    </div>
                    <div class="info-item">
                        <label>Tenure</label>
                        <span>${app.tenure} months</span>
                    </div>
                    <div class="info-item">
                        <label>Interest Rate</label>
                        <span>${evaluation.appliedRate}%</span>
                    </div>
                    <div class="info-item">
                        <label>EMI</label>
                        <span>₹${evaluation.emi.toLocaleString()}</span>
                    </div>
                    <div class="info-item">
                        <label>Approval Date</label>
                        <span>${new Date().toLocaleDateString()}</span>
                    </div>
                    <div class="info-item">
                        <label>Sanction Reference ID</label>
                        <span>${sanctionId}</span>
                    </div>
                </div>
                <button class="download-btn" onclick="downloadSanctionLetter('${sanctionId}', ${app.amount}, ${app.tenure}, ${evaluation.appliedRate}, ${evaluation.emi})">
                    <i class="fas fa-download"></i>
                    Download Sanction Letter
                </button>
            </div>
        `;
    } else {
        decisionContent.innerHTML = `
            <div class="decision-rejected">
                <div class="decision-title">
                    <i class="fas fa-times-circle"></i> Loan Rejected
                </div>
                <p style="margin-top: 1rem; font-size: 1.1rem;">${evaluation.reason}</p>
                <div style="margin-top: 2rem; text-align: left;">
                    <h4 style="margin-bottom: 1rem;">Suggestions:</h4>
                    <ul style="list-style: none; padding: 0;">
                        <li style="margin-bottom: 0.5rem;"><i class="fas fa-check"></i> Try applying for a lower loan amount</li>
                        <li style="margin-bottom: 0.5rem;"><i class="fas fa-check"></i> Improve your credit score</li>
                        <li><i class="fas fa-check"></i> Consider increasing your tenure</li>
                    </ul>
                </div>
            </div>
        `;
    }
}

// Download sanction letter
function downloadSanctionLetter(sanctionId, amount, tenure, rate, emi) {
    const letter = `
        SANCTION LETTER
        
        Reference ID: ${sanctionId}
        Date: ${new Date().toLocaleDateString()}
        
        Dear Customer,
        
        We are pleased to inform you that your loan application has been approved.
        
        Loan Details:
        - Loan Amount: ₹${amount.toLocaleString()}
        - Tenure: ${tenure} months
        - Interest Rate: ${rate}%
        - EMI: ₹${emi.toLocaleString()}
        
        Please contact us to proceed with the disbursement.
        
        Easilon Bank
    `;
    
    const blob = new Blob([letter], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Sanction_Letter_${sanctionId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
}

// Initialize dashboard
async function initDashboard() {
    // Get mobile from localStorage or URL
    const mobile = localStorage.getItem('mobile') || '9876543210';
    document.getElementById('userMobile').textContent = mobile;
    
    // Load customer profile
    await updateDashboard(mobile);
    
    // Setup scenario clicks
    document.querySelectorAll('.scenario-item').forEach(item => {
        item.addEventListener('click', async function() {
            document.querySelectorAll('.scenario-item').forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            
            const mobile = this.dataset.mobile;
            localStorage.setItem('mobile', mobile);
            document.getElementById('userMobile').textContent = mobile;
            await updateDashboard(mobile);
        });
    });
    
    // Set default scenario
    document.querySelector(`[data-mobile="${mobile}"]`)?.classList.add('active');
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initDashboard);

