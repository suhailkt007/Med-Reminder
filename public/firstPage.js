document.addEventListener("DOMContentLoaded", () => {
    const wrapper = document.querySelector('.main-wrapper');
    wrapper.classList.add('loaded');
  
    // Typing effect
    const subheading = document.querySelector('.second-line');
    const text = "is not something we can buy ";
    const icon = `<i class="fa-solid fa-user-nurse text-warning ms-2"></i>`;
    let index = 0;
  
    function typeWriter() {
      if (index < text.length) {
        subheading.innerHTML = text.slice(0, index + 1);
        index++;
        setTimeout(typeWriter, 100);
      } else {
        subheading.innerHTML += icon;
      }
    }
    typeWriter();
  
    // Theme Toggle
    const themeToggle = document.getElementById("themeToggle");
    const themeIcon = document.getElementById("themeIcon");
    themeToggle.addEventListener("click", () => {
      document.body.classList.toggle("dark-mode");
      themeIcon.classList.toggle("fa-moon");
      themeIcon.classList.toggle("fa-sun");
    });
  
    // Click Sound
    const sound = document.getElementById("clickSound");
    const startBtn = document.getElementById("startBtn");
    startBtn.addEventListener("click", () => {
      sound.currentTime = 0;
      sound.play();
    });
  
    // Scroll reveal (in case of longer content)
    const reveals = document.querySelectorAll(".reveal");
    function checkReveal() {
      for (let el of reveals) {
        const top = el.getBoundingClientRect().top;
        if (top < window.innerHeight * 0.85) {
          el.classList.add("visible");
        }
      }
    }
  
    window.addEventListener("scroll", checkReveal);
    checkReveal(); // run on load
  });
  