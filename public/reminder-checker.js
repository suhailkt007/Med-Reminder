    const socket = io('http://localhost:5000'); // your server URL
  
    const userId = localStorage.getItem('userId'); // make sure this exists!
  
    socket.on('connect', () => {
      console.log('🔌 Connected to socket:', socket.id);
      if (userId) {
        socket.emit('registerUser', userId);
        console.log('✅ Registered user:', userId);
      }
    });
  
    socket.on('reminder', (data) => {
      console.log('🔔 Reminder received:', data.message);
      showToast(data.message); // your toast function
      playSound(); // Play a sound
      triggerVibration(); // Trigger vibration
    });
  
    function showToast(message) {
      const toast = document.createElement('div');
      toast.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
          <span style="font-size: 20px;">💊</span>
          <span>${message}</span>
        </div>
      `;
  
      Object.assign(toast.style, {
        position: 'fixed',
        bottom: '30px',
        right: '30px',
        background: 'rgba(50, 50, 50, 0.8)',
        color: '#fff',
        padding: '14px 20px',
        borderRadius: '12px',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
        backdropFilter: 'blur(10px)',
        zIndex: 9999,
        fontSize: '16px',
        fontFamily: 'Segoe UI, sans-serif',
        animation: 'fadeInOut 5s ease-in-out forwards',
      });
  
      // Keyframes (for fade-in and slide-out)
      const styleSheet = document.createElement("style");
      styleSheet.innerHTML = `
        @keyframes fadeInOut {
          0% { opacity: 0; transform: translateY(20px); }
          10% { opacity: 1; transform: translateY(0); }
          90% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-20px); }
        }
      `;
      document.head.appendChild(styleSheet);
  
      document.body.appendChild(toast);
  
      setTimeout(() => {
        toast.remove();
        styleSheet.remove();
      }, 5000);
    }
  
    // // Play sound on reminder
    function playSound() {
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const oscillator = audioCtx.createOscillator();
oscillator.type = 'sine';
oscillator.frequency.setValueAtTime(800, audioCtx.currentTime); // value in hertz
oscillator.connect(audioCtx.destination);
oscillator.start();
setTimeout(function() {
oscillator.stop();
}, 500);

    }
    
  
    // Trigger vibration on mobile
    function triggerVibration() {
      if (navigator.vibrate) {
        navigator.vibrate([200, 100, 200]); // Vibrates for 200ms, pauses for 100ms, vibrates for 200ms
      }
    }
