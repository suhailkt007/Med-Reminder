// reminder.js - Complete rewrite with audio autoplay solution

// DOM Elements
const nurse = document.getElementById('doctor');
const worker = document.getElementById('worker');
const text = document.getElementById('text');
const back = document.getElementById('back');
const nurseContainer = document.getElementById('nurse-container');
const workerContainer = document.getElementById('worker-container');

const reminderModal = document.getElementById('reminderModal');
const reminderSound = document.getElementById('reminderSound');
const acknowledgeBtn = document.getElementById('acknowledgeBtn');
const closeModal = document.getElementById('closeModal');
const testReminderBtn = document.getElementById('testReminderBtn');

// Bootstrap modal instance
let reminderModalInstance = null;

document.addEventListener('DOMContentLoaded', () => {
    if (reminderModal) {
        reminderModalInstance = new bootstrap.Modal(reminderModal, {
            backdrop: 'static',
            keyboard: false
        });

        if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
            if (testReminderBtn) {
                testReminderBtn.style.display = 'block';
            }
        }
    }

    const mainContent = document.querySelector('.main-content');
    if (mainContent) mainContent.classList.add('animate__fadeIn');

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('showReminder') === 'true') {
        const medicine = urlParams.get('medicine') || 'Medicine';
        const dose = urlParams.get('dose') || 'Standard dose';
        const time = urlParams.get('time') || 'Now';
        const patient = urlParams.get('patient') || 'Patient';

        setTimeout(() => {
            showReminderModal(medicine, dose, time, patient);
        }, 500);
    }
});

// Hover interactions
[nurseContainer, workerContainer].forEach(container => {
    if (!container) return;
    container.addEventListener('mouseenter', () => {
        text.textContent = container.id === 'nurse-container' ? 'Select Worker Mode' : 'Select User Mode';
        text.classList.add('animate__animated', 'animate__pulse');
    });
    container.addEventListener('mouseleave', () => {
        text.textContent = '';
        text.classList.remove('animate__pulse');
    });
});

// Mode selections
if (nurse) {
    nurse.addEventListener('click', () => {
        nurse.parentElement.classList.add('animate__animated', 'animate__bounceIn');
        text.textContent = 'YOU ARE SELECTED AS WORKER MODE';
        text.classList.add('animate__animated', 'animate__fadeInUp');
        nurse.style.boxShadow = '0 0 20px rgba(111, 66, 193, 0.8)';
        nurse.style.border = '3px solid #6f42c1';
        workerContainer.style.opacity = '0.5';
        setTimeout(() => window.location.href = 'nurse.html', 2000);
    });
}

if (worker) {
    worker.addEventListener('click', () => {
        worker.parentElement.classList.add('animate__animated', 'animate__bounceIn');
        text.textContent = 'YOU ARE SELECTED AS USER MODE';
        text.classList.add('animate__animated', 'animate__fadeInUp');
        worker.style.boxShadow = '0 0 20px rgba(111, 66, 193, 0.8)';
        worker.style.border = '3px solid #6f42c1';
        nurseContainer.style.opacity = '0.5';
        setTimeout(() => window.location.href = 'worker.html', 2000);
    });
}

// Back button behavior
if (back) {
    back.addEventListener('click', () => {
        const mainContent = document.querySelector('.main-content');
        if (mainContent) mainContent.classList.add('animate__fadeOutRight');
        setTimeout(() => window.location.href = 'main.html', 300);
    });
}

// ========== REMINDER FUNCTIONS ==========

function showReminderModal(medicine = 'Amoxicillin', dose = '500mg', time = '9:00 AM', patient = 'John Doe') {
    if (!reminderModalInstance) {
        console.error('Modal instance not initialized');
        return;
    }

    document.getElementById('medicineName').textContent = medicine;
    document.getElementById('dose').textContent = dose;
    document.getElementById('reminderTime').textContent = time;
    document.getElementById('patientName').textContent = patient;

    reminderModalInstance.show();
}


// ========== SOCKET.IO ==========

try {
    if (typeof io !== 'undefined') {
        const socket = io();
        socket.on('reminderAlert', data => {
            showReminderModal(
                data.medicine || 'Medicine',
                data.dose || 'Standard dose',
                data.time || 'Now',
                data.patient || 'Patient'
            );
        });
        console.log('Socket.io connected');
    }
} catch (err) {
    console.warn('Socket.io failed:', err);
}

