// Password Toggle
function setupPasswordToggle(toggleId, inputId) {
    const toggle = document.getElementById(toggleId);
    const input = document.getElementById(inputId);
    
    if (toggle && input) {
        toggle.addEventListener('click', function() {
            const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
            input.setAttribute('type', type);
            
            const icon = this.querySelector('i');
            if (type === 'password') {
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            } else {
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            }
        });
    }
}

setupPasswordToggle('passwordToggle', 'password');
setupPasswordToggle('confirmPasswordToggle', 'confirmPassword');

// Mobile number validation
const mobileInput = document.getElementById('mobile');
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

// Password validation
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirmPassword');

if (passwordInput) {
    passwordInput.addEventListener('input', function() {
        validatePassword();
    });
}

if (confirmPasswordInput) {
    confirmPasswordInput.addEventListener('input', function() {
        validatePassword();
    });
}

function validatePassword() {
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    
    if (confirmPassword && password !== confirmPassword) {
        confirmPasswordInput.setCustomValidity('Passwords do not match');
    } else {
        confirmPasswordInput.setCustomValidity('');
    }
    
    // Password strength check
    if (password.length < 8) {
        passwordInput.setCustomValidity('Password must be at least 8 characters');
    } else if (!/(?=.*[a-zA-Z])(?=.*[0-9])/.test(password)) {
        passwordInput.setCustomValidity('Password must contain both letters and numbers');
    } else {
        passwordInput.setCustomValidity('');
    }
}

// Form Submission
const registerForm = document.getElementById('registerForm');

if (registerForm) {
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form values
        const formData = {
            name: document.getElementById('fullName').value.trim(),
            phone: document.getElementById('mobile').value.trim(),
            email: document.getElementById('email').value.trim(),
            password: document.getElementById('password').value,
            dob: document.getElementById('dob').value,
            city: document.getElementById('city').value.trim(),
            employment_type: document.getElementById('employmentType').value,
            terms: document.getElementById('terms').checked,
            creditScore: document.getElementById('creditScore').checked,
            kycConsent: document.getElementById('kycConsent').checked
        };
        
        // Validate required fields
        if (!formData.name || !formData.phone || !formData.email || !formData.password) {
            showError('Please fill in all required fields');
            return;
        }
        
        // Validate password match
        if (formData.password !== document.getElementById('confirmPassword').value) {
            showError('Passwords do not match');
            return;
        }
        
        // Validate consent checkboxes
        if (!formData.terms || !formData.creditScore || !formData.kycConsent) {
            showError('Please accept all consent and compliance terms');
            return;
        }
        
        // Validate mobile number
        if (formData.phone.length !== 10) {
            showError('Please enter a valid 10-digit mobile number');
            return;
        }
        
        // Submit button state
        const submitButton = this.querySelector('.btn-login');
        const originalText = submitButton.innerHTML;
        
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating Account...';
        
        // Simulate API call
        setTimeout(() => {
            // Store user data (in real app, send to backend)
            const userData = {
                name: formData.name,
                phone: formData.phone,
                email: formData.email,
                dob: formData.dob || null,
                city: formData.city || null,
                employment_type: formData.employment_type || null,
                consent_given: true,
                registered_at: new Date().toISOString()
            };
            
            // Store in localStorage (in real app, this would be in backend)
            localStorage.setItem('userData', JSON.stringify(userData));
            localStorage.setItem('isRegistered', 'true');
            
            showSuccess('Account created successfully! Redirecting to login...');
            
            // Redirect to login after 2 seconds
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        }, 2000);
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
    
    registerForm.insertBefore(errorDiv, registerForm.firstChild);
    
    // Scroll to error
    errorDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    
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
    
    registerForm.insertBefore(successDiv, registerForm.firstChild);
    
    // Scroll to success
    successDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Add CSS for error/success messages and form enhancements
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
    
    .form-section {
        margin-bottom: 2rem;
        padding-bottom: 2rem;
        border-bottom: 1px solid var(--border-color);
    }
    
    .form-section:last-of-type {
        border-bottom: none;
    }
    
    .section-title {
        font-size: 1.2rem;
        font-weight: 700;
        color: var(--text-dark);
        margin-bottom: 1.5rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    .optional {
        font-size: 0.9rem;
        font-weight: 400;
        color: var(--text-light);
    }
    
    .required {
        color: #dc2626;
        font-weight: 600;
    }
    
    .form-hint {
        display: block;
        margin-top: 0.5rem;
        font-size: 0.85rem;
        color: var(--text-light);
        font-style: italic;
    }
    
    .form-select {
        width: 100%;
        padding: 1rem 1.25rem;
        border: 2px solid var(--border-color);
        border-radius: 12px;
        font-size: 1rem;
        font-family: inherit;
        transition: all 0.3s ease;
        background: white;
        color: var(--text-dark);
        cursor: pointer;
        appearance: none;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23333' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: right 1rem center;
        padding-right: 3rem;
    }
    
    .form-select:focus {
        outline: none;
        border-color: var(--primary-color);
        box-shadow: 
            0 0 0 4px rgba(102, 126, 234, 0.1),
            0 4px 12px rgba(102, 126, 234, 0.15);
        transform: translateY(-2px);
    }
    
    .kyc-notice {
        background: #eff6ff;
        border: 1px solid #bfdbfe;
        border-radius: 12px;
        padding: 1rem 1.25rem;
        margin: 1.5rem 0;
        display: flex;
        gap: 0.75rem;
        color: #1e40af;
    }
    
    .kyc-notice i {
        font-size: 1.2rem;
        flex-shrink: 0;
        margin-top: 0.2rem;
    }
    
    .kyc-notice p {
        margin: 0;
        font-size: 0.9rem;
        line-height: 1.6;
    }
    
    .consent-group {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }
    
    .consent-checkbox {
        align-items: flex-start;
        padding: 1rem;
        background: #f9fafb;
        border-radius: 12px;
        border: 1px solid var(--border-color);
        transition: all 0.3s ease;
    }
    
    .consent-checkbox:hover {
        background: #f3f4f6;
        border-color: var(--primary-color);
    }
    
    .consent-checkbox input[type="checkbox"] {
        margin-top: 0.2rem;
    }
    
    .consent-checkbox a {
        color: var(--primary-color);
        text-decoration: none;
        font-weight: 600;
    }
    
    .consent-checkbox a:hover {
        text-decoration: underline;
    }
    
    .otp-input-wrapper {
        position: relative;
        display: flex;
        gap: 0.5rem;
        align-items: center;
    }
    
    .otp-input-wrapper input {
        flex: 1;
        text-align: center;
        font-size: 1.2rem;
        letter-spacing: 0.5rem;
        font-weight: 600;
    }
    
    .resend-otp {
        padding: 0.5rem 1rem;
        background: var(--primary-color);
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 0.9rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        white-space: nowrap;
    }
    
    .resend-otp:hover {
        background: var(--primary-dark);
        transform: translateY(-2px);
    }
    
    .resend-otp:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
    
    .otp-timer {
        margin-top: 0.5rem;
        font-size: 0.85rem;
        color: var(--text-light);
        text-align: center;
    }
    
    .alternative-login {
        text-align: center;
        margin-top: 1rem;
    }
    
    .alternative-login a {
        color: var(--primary-color);
        text-decoration: none;
        font-weight: 600;
        font-size: 0.9rem;
        transition: color 0.3s ease;
    }
    
    .alternative-login a:hover {
        color: var(--primary-dark);
        text-decoration: underline;
    }
`;
document.head.appendChild(style);

