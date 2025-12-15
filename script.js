// Mobile Menu Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

if (hamburger) {
    hamburger.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        hamburger.classList.toggle('active');
    });

    // Close menu when clicking on a link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            hamburger.classList.remove('active');
        });
    });
}

// Navbar scroll effect
const navbar = document.querySelector('.navbar');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
    
    lastScroll = currentScroll;
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offsetTop = target.offsetTop - 80;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// Loan Calculator
function calculateLoan() {
    const loanAmount = parseFloat(document.getElementById('loanAmount').value) || 500000;
    const interestRate = parseFloat(document.getElementById('interestRate').value) || 5.5;
    const loanTerm = parseFloat(document.getElementById('loanTerm').value) || 5;

    const monthlyRate = interestRate / 100 / 12;
    const numberOfPayments = loanTerm * 12;

    // Calculate monthly payment using the formula: M = P * [r(1+r)^n] / [(1+r)^n - 1]
    const monthlyPayment = loanAmount * 
        (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
        (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

    const totalAmount = monthlyPayment * numberOfPayments;
    const totalInterest = totalAmount - loanAmount;

    // Update display with Indian number formatting
    document.getElementById('monthlyPayment').textContent = 
        '₹' + formatIndianCurrency(monthlyPayment);
    document.getElementById('totalInterest').textContent = 
        '₹' + formatIndianCurrency(totalInterest);
    document.getElementById('totalAmount').textContent = 
        '₹' + formatIndianCurrency(totalAmount);
}

// Sync range inputs with number inputs
function syncInputs(numberId, rangeId) {
    const numberInput = document.getElementById(numberId);
    const rangeInput = document.getElementById(rangeId);

    if (numberInput && rangeInput) {
        // Update range when number changes
        numberInput.addEventListener('input', () => {
            rangeInput.value = numberInput.value;
            calculateLoan();
        });

        // Update number when range changes
        rangeInput.addEventListener('input', () => {
            numberInput.value = rangeInput.value;
            calculateLoan();
        });
    }
}

// Initialize calculator
document.addEventListener('DOMContentLoaded', () => {
    syncInputs('loanAmount', 'loanAmountRange');
    syncInputs('interestRate', 'interestRateRange');
    syncInputs('loanTerm', 'loanTermRange');
    calculateLoan();
});

// Animate elements on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe service cards and feature cards
document.querySelectorAll('.service-card, .feature-card, .feature-item').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(card);
});

// Add active state to navigation based on scroll position
const sections = document.querySelectorAll('section[id]');

function highlightNavigation() {
    const scrollY = window.pageYOffset;

    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 100;
        const sectionId = section.getAttribute('id');

        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            document.querySelectorAll('.nav-link').forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
}

window.addEventListener('scroll', highlightNavigation);

// Add parallax effect to hero section
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero');
    if (hero && scrolled < window.innerHeight) {
        hero.style.transform = `translateY(${scrolled * 0.5}px)`;
    }
});

// Counter animation for stats
function animateCounter(element, target, duration = 2000) {
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;

    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = formatStatValue(target);
            clearInterval(timer);
        } else {
            element.textContent = formatStatValue(Math.floor(current));
        }
    }, 16);
}

function formatStatValue(value) {
    if (value >= 100000000000) {
        return '₹' + (value / 100000000000).toFixed(1) + 'L Cr+';
    } else if (value >= 1000000000) {
        return '₹' + (value / 1000000000).toFixed(1) + 'Cr+';
    } else if (value >= 10000000) {
        return '₹' + (value / 10000000).toFixed(1) + 'Cr+';
    } else if (value >= 100000) {
        return '₹' + (value / 100000).toFixed(1) + 'L+';
    } else if (value >= 1000) {
        return '₹' + formatIndianCurrency(value) + '+';
    }
    return '₹' + value.toString();
}

// Format currency in Indian numbering system (Lakhs and Crores)
function formatIndianCurrency(amount) {
    const num = Math.round(amount);
    if (num >= 10000000) {
        // Crores
        const crores = (num / 10000000).toFixed(2);
        return crores + ' Cr';
    } else if (num >= 100000) {
        // Lakhs
        const lakhs = (num / 100000).toFixed(2);
        return lakhs + ' L';
    } else {
        // Regular formatting with Indian style (last 3 digits, then 2 digits)
        const numStr = num.toString();
        if (numStr.length <= 3) {
            return numStr;
        }
        let result = numStr.slice(-3);
        let remaining = numStr.slice(0, -3);
        while (remaining.length > 2) {
            result = remaining.slice(-2) + ',' + result;
            remaining = remaining.slice(0, -2);
        }
        if (remaining.length > 0) {
            result = remaining + ',' + result;
        }
        return result;
    }
}

// Animate stats when they come into view
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
            entry.target.classList.add('animated');
            const statValue = entry.target.querySelector('.stat-value');
            if (statValue) {
                const text = statValue.textContent;
                let numericValue = parseFloat(text.replace(/[^0-9.]/g, ''));
                
                // Handle Indian currency format
                if (text.includes('L Cr') || text.includes('Lakh Cr')) {
                    numericValue *= 100000000000;
                } else if (text.includes('Cr')) {
                    numericValue *= 10000000;
                } else if (text.includes('L') || text.includes('Lakh')) {
                    numericValue *= 100000;
                } else if (text.includes('B')) {
                    numericValue *= 1000000000;
                } else if (text.includes('M')) {
                    numericValue *= 1000000;
                }
                
                animateCounter(statValue, numericValue);
            }
        }
    });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-item').forEach(stat => {
    statsObserver.observe(stat);
});

// Add ripple effect to buttons
document.querySelectorAll('.btn-primary, .btn-outline').forEach(button => {
    button.addEventListener('click', function(e) {
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('ripple');
        
        this.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    });
});

// Add CSS for ripple effect
const style = document.createElement('style');
style.textContent = `
    .btn-primary, .btn-outline {
        position: relative;
        overflow: hidden;
    }
    
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.6);
        transform: scale(0);
        animation: ripple-animation 0.6s ease-out;
        pointer-events: none;
    }
    
    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Form validation for loan calculator
document.querySelectorAll('#loanAmount, #interestRate, #loanTerm').forEach(input => {
    input.addEventListener('blur', function() {
        const value = parseFloat(this.value);
        const min = parseFloat(this.min);
        const max = parseFloat(this.max);
        
        if (value < min) {
            this.value = min;
        } else if (value > max) {
            this.value = max;
        }
        
        calculateLoan();
    });
});

// Add loading animation
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease';
        document.body.style.opacity = '1';
    }, 100);
});

// Contact form handling
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form values
        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            subject: document.getElementById('subject').value,
            message: document.getElementById('message').value
        };
        
        // Show success message (in a real app, this would send to a server)
        alert('Thank you for contacting us! We will get back to you soon.\n\nYour message:\n' + formData.message);
        
        // Reset form
        contactForm.reset();
    });
}

