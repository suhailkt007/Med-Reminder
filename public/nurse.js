  document.getElementById('sub').addEventListener('click', addReminder);
  document.getElementById('back').addEventListener('click', () => window.history.back());

  let deleteTargetRow = null;
  let deleteReminderId = null;

  

  async function addReminder() {
    const nameInput = document.querySelector('.patientName');
    const medInput = document.querySelector('.medicineName');
    const timeInput = document.querySelector('.medicineTime');
    const doseInput = document.querySelector('.medicineDose');
    const noteInput = document.querySelector('.medicineNotes');

    if (!nameInput.value || !medInput.value || !timeInput.value || !doseInput.value) {
      alert('All fields are required.');
      return;
    }

    const reminderData = {
      reminders: [
        {
          patientName: nameInput.value,
          medicineName: medInput.value,
          time: timeInput.value,
          dose: doseInput.value,
          notes: noteInput.value,
        }
      ]
    };

    const token = localStorage.getItem('token'); // Assumes token is stored after login

    try {
      const response = await fetch('http://localhost:5000/api/reminders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          isNurse: true,
          reminders: reminderData  // 🔥 This key must match what your backend expects
        }),
      });
    
      const result = await response.json();
    
      if (!response.ok) {
        throw new Error(result.message || 'Failed to add reminder');
      }
    
      const savedReminder = result.reminders[0];
    
      loadReminders();
    
      // Clear inputs
      nameInput.value = '';
      medInput.value = '';
      timeInput.value = '';
      doseInput.value = '';
      noteInput.value = '';
    
    } catch (err) {
      alert('Error: ' + err.message);
      console.error(err);
    }
  }


  function confirmDelete(button) {
    deleteTargetRow = button.closest('tr');
    deleteReminderId = button.closest('tr').querySelector('.taken-btn')?.dataset.id;
    const modal = new bootstrap.Modal(document.getElementById('deleteModal'));
    modal.show();
  }
  

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
      await loadReminders();

  
    } catch (err) {
      alert('Error deleting reminder: ' + err.message);
      console.error(err);
    }
  });
  
  let back=document.getElementById('back');
  back.addEventListener('click',function(){
      console.log('button clicked');
      goBack();
  });
  function goBack() {
    console.log('goBack function called');
    window.location.href = "reminder.html";
  }

  document.addEventListener('DOMContentLoaded', loadReminders);

async function loadReminders() {
  const token = localStorage.getItem('token');
  const tableBody = document.getElementById('reminderTableBody');
  tableBody.innerHTML = ''; // Clear existing rows

  try {
    const response = await fetch('http://localhost:5000/api/reminders/nurse', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to load reminders');
    }

    result.reminders.forEach(reminder => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${reminder.patientName}</td>
        <td>${reminder.medicineName}</td>
        <td>${reminder.time}</td>
        <td>${reminder.dose}</td>
        <td>${reminder.notes}</td>
         <td>
    <button class="btn btn-success btn-sm taken-btn" data-id="${reminder._id}">✔️ Taken</button>
    <button class="delete-btn" onclick="confirmDelete(this)">🗑 Delete</button>
  </td>
      `;
      tableBody.appendChild(row);
      row.querySelector('.taken-btn').addEventListener('click', markReminderAsTaken);
    });

  } catch (err) {
    alert('Error loading reminders: ' + err.message);
    console.error(err);
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


// loadReminders()




      // Add to table only after successful backend save
      // const tableBody = document.getElementById('reminderTableBody');
      // const row = document.createElement('tr');
      // row.innerHTML = `
      //   <td>${savedReminder.patientName}</td>
      //   <td>${savedReminder.medicineName}</td>
      //   <td>${savedReminder.time}</td>
      //   <td>${savedReminder.dose}</td>
      //   <td>${savedReminder.notes}</td>
      //   <td>
      //     <button class="btn btn-success btn-sm" onclick="this.closest('tr').remove()">✔️ Taken</button>
      //     <button class="delete-btn" onclick="confirmDelete(this)">🗑 Delete</button>
      //   </td>
      // `;
      // tableBody.appendChild(row);