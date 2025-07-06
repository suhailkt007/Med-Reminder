document.addEventListener('DOMContentLoaded', function () {
   let btn = document.querySelector('.reminder-btn');

   btn.addEventListener('click', function () {
       btn.style.display = 'none'; // Hides the reminder-btn element
       window.location.href = 'reminder.html'; // Redirects to reminder.html
   });
});
