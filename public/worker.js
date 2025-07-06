// document.getElementById('sub').addEventListener('click', addReminder);
// document.getElementById('back').addEventListener('click', () => window.history.back());

// let deleteTargetRow = null;

// async function addReminder() {
//   const medInput = document.querySelector('.medicineName');
//   const timeInput = document.querySelector('.medicineTime');
//   const doseInput = document.querySelector('.medicineDose');
//   const noteInput = document.querySelector('.medicineNotes');

//   if (!medInput.value || !timeInput.value || !doseInput.value) {
//     alert('All fields are required.');
//     return;
//   }

//   const reminderData = {
//     medicineName: medInput.value,
//     time: timeInput.value,
//     dose: doseInput.value,
//     notes: noteInput.value
//   };

//   const token = localStorage.getItem('token'); // Make sure token is stored after login

//   try {
//     const response = await fetch('http://localhost:5000/api/reminders', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${token}`
//       },
//       body: JSON.stringify({ reminders: [reminderData] }) // Backend expects an array
//     });

//     const data = await response.json();

//     if (!response.ok) {
//       alert(data.message || 'Failed to save reminder');
//       return;
//     }

//     // Append to table only after successful API response
//     const tableBody = document.getElementById('reminderTableBody');
//     const row = document.createElement('tr');
//     row.innerHTML = `
//       <td>${reminderData.medicineName}</td>
//       <td>${reminderData.time}</td>
//       <td>${reminderData.dose}</td>
//       <td>${reminderData.notes}</td>
//       <td>
//         <button class="btn btn-success btn-sm" onclick="this.closest('tr').remove()">✔️ Taken</button>
//         <button class="delete-btn" onclick="confirmDelete(this)">🗑 Delete</button>
//       </td>
//     `;
//     tableBody.appendChild(row);

//     // Clear input fields
//     medInput.value = '';
//     timeInput.value = '';
//     doseInput.value = '';
//     noteInput.value = '';

//   } catch (err) {
//     console.error('Error adding reminder:', err);
//     alert('Something went wrong!');
//   }
// }


// function confirmDelete(button) {
//   deleteTargetRow = button.closest('tr');
//   const modal = new bootstrap.Modal(document.getElementById('deleteModal'));
//   modal.show();
// }

// document.getElementById('confirmDeleteBtn').addEventListener('click', () => {
//   if (deleteTargetRow) {
//     deleteTargetRow.remove();
//     deleteTargetRow = null;
//   }
//   bootstrap.Modal.getInstance(document.getElementById('deleteModal')).hide();
// });
// let back=document.getElementById('back');
// back.addEventListener('click',function(){
//     console.log('button clicked');
//     goBack();
// });
// function goBack() {
//   console.log('goBack function called');
//   window.location.href = "reminder.html";
// }

document.getElementById('sub').addEventListener('click', addReminder);
document.getElementById('back').addEventListener('click', () => {
  console.log('button clicked');
  goBack();
});

let deleteTargetRow = null;
let deleteReminderId = null;


// Add Reminder Function
async function addReminder() {
  const medInput = document.querySelector('.medicineName');
  const timeInput = document.querySelector('.medicineTime');
  const doseInput = document.querySelector('.medicineDose');
  const noteInput = document.querySelector('.medicineNotes');

  if (!medInput.value || !timeInput.value || !doseInput.value) {
    alert('All fields are required.');
    return;
  }

  const reminderData = {
    medicineName: medInput.value,
    time: timeInput.value,
    dose: doseInput.value,
    notes: noteInput.value
  };

  const token = localStorage.getItem('token'); // Ensure token exists

  try {
    const response = await fetch('http://localhost:5000/api/reminders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
      isNurse: false,
      reminders: {
        reminders:[reminderData]
      }  // 🔥 This key must match what your backend expects
    }),// Send as array
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || 'Failed to save reminder');
      return;
    }

    appendReminderToTable(reminderData);

    // Clear inputs
    medInput.value = '';
    timeInput.value = '';
    doseInput.value = '';
    noteInput.value = '';

  } catch (err) {
    console.error('Error adding reminder:', err);
    alert('Something went wrong!');
  }
}

// Append reminder to table
function appendReminderToTable(reminderData) {
  const tableBody = document.getElementById('reminderTableBody');
  const row = document.createElement('tr');
  row.innerHTML = `
    <td>${reminderData.medicineName}</td>
    <td>${reminderData.time}</td>
    <td>${reminderData.dose}</td>
    <td>${reminderData.notes}</td>
    <td>
      <button class="btn btn-success btn-sm" onclick="this.closest('tr').remove()">✔️ Taken</button>
      <button class="delete-btn" onclick="confirmDelete(this)">🗑 Delete</button>
    </td>
  `;
  // tableBody.appendChild(row);

  fetchReminders()
}

// Delete confirmation modal logic
// function confirmDelete(button) {
//   deleteTargetRow = button.closest('tr');
//   const modal = new bootstrap.Modal(document.getElementById('deleteModal'));
//   modal.show();
// }
function confirmDelete(button) {
  deleteTargetRow = button.closest('tr');
  deleteReminderId = button.closest('tr').querySelector('.taken-btn')?.dataset.id;
  const modal = new bootstrap.Modal(document.getElementById('deleteModal'));
  modal.show();
}



// document.getElementById('confirmDeleteBtn').addEventListener('click', () => {
//   if (deleteTargetRow) {
//     deleteTargetRow.remove();
//     deleteTargetRow = null;
//   }
//   bootstrap.Modal.getInstance(document.getElementById('deleteModal')).hide();
// });

document.getElementById('confirmDeleteBtn').addEventListener('click', async () => {
  const token = localStorage.getItem('token');

  if (!deleteReminderId) {
    alert('Reminder ID not found.');
    return;
  }

  try {
    const response = await fetch(`http://localhost:5000/api/reminders/${deleteReminderId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to delete reminder');
    }

    // Remove the row from the table
    if (deleteTargetRow) {
      deleteTargetRow.remove();
    }

    // Reset values
    deleteTargetRow = null;
    deleteReminderId = null;

    bootstrap.Modal.getInstance(document.getElementById('deleteModal')).hide();

    // alert(result.message);
    await fetchReminders();


  } catch (err) {
    alert('Error deleting reminder: ' + err.message);
    console.error(err);
  }
});

// Back Navigation
function goBack() {
  console.log('goBack function called');
  window.location.href = "reminder.html";
}

async function fetchReminders() {
  const token = localStorage.getItem('token');

  try {
    const response = await fetch('http://localhost:5000/api/reminders', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || 'Failed to fetch reminders');
      return;
    }

    const tableBody = document.getElementById('reminderTableBody');
    tableBody.innerHTML = ''; // Clear table

    data.reminders.forEach(reminder => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${reminder.medicineName}</td>
        <td>${reminder.time}</td>
        <td>${reminder.dose}</td>
        <td>${reminder.notes}</td>
        <td>
          <button class="btn btn-success taken-btn btn-sm" onclick="markReminderAsTaken(event)" data-id="${reminder._id}">✔️ Taken</button>

          <button class="delete-btn" onclick="confirmDelete(this)">🗑 Delete</button>
        </td>
      `;
      tableBody.appendChild(row);
    });

  } catch (err) {
    console.error('Error fetching reminders:', err);
    alert('Could not load reminders.');
  }
}


async function markReminderAsTaken(event) {
  const button = event.target;
  const reminderId = button.dataset.id;
  const token = localStorage.getItem('token');

  try {
    const response = await fetch('http://localhost:5000/api/reminders/mark-taken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(
        { reminderId }
      ),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to mark reminder as taken');
    }

    // Optionally, show a toast/alert
    alert(result.message);

    // Remove the row from the table
    button.closest('tr').remove();

  } catch (err) {
    alert('Error: ' + err.message);
    console.error(err);
  }
}

fetchReminders();
// reminder-modal.js
const reminderSound = document.getElementById('reminderSound');
const reminderModal = document.getElementById('reminderModal');

// Play sound when modal is shown
reminderModal.addEventListener('shown.bs.modal', () => {
  if (reminderSound) {
    reminderSound.currentTime = 0;
    reminderSound.play().catch(err => console.warn("Sound play blocked:", err));
  }
});

// Stop sound when modal is hidden
reminderModal.addEventListener('hidden.bs.modal', () => {
  if (reminderSound) {
    reminderSound.pause();
    reminderSound.currentTime = 0;
  }
});


