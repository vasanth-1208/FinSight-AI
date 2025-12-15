// OTP Login Flow
let otpSent = false;
let otpTimer = null;
let otpCountdown = 60;
let generatedOTP = '';

const mobileInput = document.getElementById('mobile');
const otpGroup = document.getElementById('otpGroup');
const otpInput = document.getElementById('otp');
const submitBtn = document.getElementById('submitBtn');
const submitText = document.getElementById('submitText');
const resendOtpBtn = document.getElementById('resendOtp');
const otpTimerEl = document.getElementById('otpTimer');
const rememberOption = document.getElementById('rememberOption');
const alternativeLogin = document.getElementById('alternativeLogin');
const loginForm = document.getElementById('loginForm');
const demoOtpContainer = document.getElementById('demoOtpContainer');
const demoOtpValue = document.getElementById('demoOtpValue');

// Generate random 6-digit OTP
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Mobile number validation
if (mobileInput) {
    mobileInput.addEventListener('input', function() {
        this.value = this.value.replace(/[^0-9]/g, '');
        if (this.value.length === 10) {
            this.setCustomValidity('');
        } else {
            this.setCustomValidity('Please enter a valid 10-digit mobile number');
        }
    });
}

// OTP input validation
if (otpInput) {
    otpInput.addEventListener('input', function() {
        this.value = this.value.replace(/[^0-9]/g, '');
    });
}

// Form Submission
if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const mobile = mobileInput.value.trim();
        
        if (!otpSent) {
            // Step 1: Send OTP
            if (mobile.length !== 10) {
                showError('Please enter a valid 10-digit mobile number');
                return;
            }
            
            submitBtn.disabled = true;
            submitText.textContent = 'Sending OTP...';
            
            // Generate and display demo OTP
            generatedOTP = generateOTP();
            
            // Simulate OTP sending
            setTimeout(() => {
                otpSent = true;
                otpGroup.style.display = 'block';
                rememberOption.style.display = 'flex';
                alternativeLogin.style.display = 'block';
                demoOtpContainer.style.display = 'block';
                submitText.textContent = 'Verify OTP';
                submitBtn.disabled = false;
                mobileInput.disabled = true;
                
                // Display demo OTP
                if (demoOtpValue) {
                    demoOtpValue.textContent = generatedOTP;
                }
                
                // Start OTP timer
                startOTPTimer();
                
                showSuccess('OTP sent to ' + mobile + '. Please check your phone.');
                otpInput.focus();
            }, 1500);
            
        } else {
            // Step 2: Verify OTP
            const otp = otpInput.value.trim();
            
            if (otp.length !== 6) {
                showError('Please enter the 6-digit OTP');
                return;
            }
            
            submitBtn.disabled = true;
            submitText.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verifying...';
            
            // Simulate OTP verification
            setTimeout(() => {
                // Verify OTP matches generated OTP
                if (otp === generatedOTP) {
                    showSuccess('Login successful! Redirecting...');
                    
                    // Hide demo OTP
                    if (demoOtpContainer) {
                        demoOtpContainer.style.display = 'none';
                    }
                    
                    // Store login state
                    const remember = document.getElementById('remember')?.checked;
                    if (remember) {
                        localStorage.setItem('rememberUser', 'true');
                        localStorage.setItem('mobile', mobile);
                    }
                    
                    // Store mobile for dashboard
                    localStorage.setItem('mobile', mobile);
                    
                    // Redirect after 1.5 seconds
                    setTimeout(() => {
                        window.location.href = 'dashboard.html';
                    }, 1500);
                } else {
                    showError('Invalid OTP. Please enter the correct OTP shown above.');
                    submitBtn.disabled = false;
                    submitText.textContent = 'Verify OTP';
                }
            }, 1500);
        }
    });
}

// Start OTP Timer
function startOTPTimer() {
    otpCountdown = 60;
    resendOtpBtn.style.display = 'none';
    
    otpTimer = setInterval(() => {
        otpCountdown--;
        if (otpTimerEl) {
            otpTimerEl.textContent = `OTP expires in ${otpCountdown} seconds`;
        }
        
        if (otpCountdown <= 0) {
            clearInterval(otpTimer);
            if (otpTimerEl) {
                otpTimerEl.textContent = '';
            }
            if (resendOtpBtn) {
                resendOtpBtn.style.display = 'inline-block';
            }
        }
    }, 1000);
}

// Resend OTP
if (resendOtpBtn) {
    resendOtpBtn.addEventListener('click', function() {
        const mobile = mobileInput.value.trim();
        
        if (mobile.length !== 10) {
            showError('Please enter a valid mobile number');
            return;
        }
        
        this.disabled = true;
        this.textContent = 'Sending...';
        
        // Generate new OTP
        generatedOTP = generateOTP();
        
        // Simulate resending OTP
        setTimeout(() => {
            this.disabled = false;
            this.textContent = 'Resend';
            startOTPTimer();
            
            // Update demo OTP display
            if (demoOtpValue) {
                demoOtpValue.textContent = generatedOTP;
            }
            
            showSuccess('OTP resent successfully!');
        }, 1000);
    });
}

// Password Login Alternative
const passwordLoginLink = document.getElementById('passwordLoginLink');
if (passwordLoginLink) {
    passwordLoginLink.addEventListener('click', function(e) {
        e.preventDefault();
        // Switch to password login mode (you can implement this if needed)
        alert('Password login option will be available soon');
    });
}

// Show Error Message
function showError(message) {
    // Remove existing messages
    const existingError = document.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `
        <i class="fas fa-exclamation-circle"></i>
        <span>${message}</span>
    `;
    
    loginForm.insertBefore(errorDiv, loginForm.firstChild);
    
    // Remove after 5 seconds
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

// Show Success Message
function showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${message}</span>
    `;
    
    loginForm.insertBefore(successDiv, loginForm.firstChild);
    
    // Remove after 3 seconds
    setTimeout(() => {
        successDiv.remove();
    }, 3000);
}

// Social Login Buttons
document.querySelectorAll('.social-btn').forEach(button => {
    button.addEventListener('click', function() {
        const provider = this.classList.contains('google-btn') ? 'Google' : 'Facebook';
        alert(`${provider} login integration would be implemented here`);
    });
});

// Auto-fill username if remembered
window.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('rememberUser') === 'true') {
        const username = localStorage.getItem('username');
        if (username) {
            document.getElementById('username').value = username;
            document.getElementById('remember').checked = true;
        }
    }
    
    // Add focus animations
    const inputs = document.querySelectorAll('.login-form input');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });
        
        input.addEventListener('blur', function() {
            if (!this.value) {
                this.parentElement.classList.remove('focused');
            }
        });
    });
});

// Add CSS for error/success messages
const style = document.createElement('style');
style.textContent = `
    .error-message,
    .success-message {
        padding: 1rem 1.25rem;
        border-radius: 12px;
        margin-bottom: 1rem;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        font-weight: 500;
        animation: slideDown 0.3s ease;
    }
    
    .error-message {
        background: #fee2e2;
        color: #dc2626;
        border: 1px solid #fecaca;
    }
    
    .success-message {
        background: #d1fae5;
        color: #059669;
        border: 1px solid #a7f3d0;
    }
    
    .error-message i,
    .success-message i {
        font-size: 1.2rem;
    }
    
    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .btn-login:disabled {
        opacity: 0.7;
        cursor: not-allowed;
    }
`;
document.head.appendChild(style);

