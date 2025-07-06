// socket.js
if (!window.socket) {
  const socket = io('http://localhost:5000');
  window.socket = socket;

  const userId = localStorage.getItem('userId');

  let userHasInteracted = false;
  let pendingReminderData = null;

  // Create AudioContext globally
  window.audioCtx = new (window.AudioContext || window.webkitAudioContext)();

  // Setup interaction listeners
  function handleFirstInteraction() {
    if (window.audioCtx.state === 'suspended') {
      window.audioCtx.resume();
    }
    userHasInteracted = true;
    if (pendingReminderData) {
      processReminder(pendingReminderData);
      pendingReminderData = null;
    }
  }

  document.addEventListener('click', handleFirstInteraction, { once: true });
  document.addEventListener('touchstart', handleFirstInteraction, { once: true });

  socket.on('connect', () => {
    console.log('🔌 Connected to socket:', socket.id);
    if (userId) {
      socket.emit('registerUser', userId);
      console.log('✅ Registered user:', userId);
    }
  });

  socket.on('reminder', (data) => {
    console.log('🔔 Reminder received:', data);
    if (userHasInteracted) {
      processReminder(data);
    } else {
      pendingReminderData = data;
    }
  });

  function processReminder(data) {
    // Update modal fields
    document.getElementById('medicineName').textContent = data.medicineName || 'N/A';
    document.getElementById('dose').textContent = data.dose || 'N/A';
    document.getElementById('reminderTime').textContent = data.time || 'N/A';
    document.getElementById('patientName').textContent = data.patientName || 'N/A';

    // Show the modal
    const modal = new bootstrap.Modal(document.getElementById('reminderModal'));
    modal.show();

    // Play sound and trigger vibration
    playSound();
    triggerVibration();
  }

  function playSound() {
    const reminderSound = document.getElementById('reminderSound');
    if (reminderSound) {
      reminderSound.currentTime = 0;
      reminderSound.play().catch(e => {
        console.error('Audio play failed:', e);
        playFallbackSound();
      });
    } else {
      playFallbackSound();
    }
  }

  function playFallbackSound() {
    try {
      const oscillator = window.audioCtx.createOscillator();
      const gainNode = window.audioCtx.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(800, window.audioCtx.currentTime);

      gainNode.gain.setValueAtTime(0.5, window.audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, window.audioCtx.currentTime + 0.5);

      oscillator.connect(gainNode);
      gainNode.connect(window.audioCtx.destination);

      oscillator.start();
      oscillator.stop(window.audioCtx.currentTime + 0.5);
    } catch (e) {
      console.error('Fallback sound failed:', e);
    }
  }

  function triggerVibration() {
    try {
      if (navigator.vibrate) {
        navigator.vibrate([200, 100, 200, 100, 200]);
      }
    } catch (e) {
      console.error('Vibration blocked:', e);
    }
  }

  document.getElementById('reminderModal').addEventListener('hidden.bs.modal', function () {
    const reminderSound = document.getElementById('reminderSound');
    if (reminderSound) {
      reminderSound.pause();
      reminderSound.currentTime = 0;
    }
  });
}
