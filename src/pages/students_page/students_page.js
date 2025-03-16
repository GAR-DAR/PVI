// Current Date: 2025-03-15 18:11:54
// Current User: GAR-DAR

let editingStudent = null; // current editing student
let selectedStudents = []; // array to store selected student IDs
let deleteConfirmationActive = false; // flag to track if delete confirmation is active
let pendingDeleteId = null; // ID of student pending deletion

document.addEventListener('DOMContentLoaded', initPage);

//------------------------------------------------------------------------------------------Page initialization

function initPage() {
  // Initialize with sample data on first load
  if (document.querySelector('.students-div table tbody').children.length === 0) {
    initializeSampleData();
  }
  
  const addButton = document.querySelector('.ico-button-on-light');
  if (addButton) {
    addButton.addEventListener('click', addStudent);
  }
  
  document.getElementById('save-btn').addEventListener('click', function(e) {
    e.preventDefault(); // submission with js, not default html one
    if (document.getElementById('student-form').checkValidity()) { // check if all fields are filled 
      saveStudentData();
    }
  });
  
  document.getElementById('cancel-btn').addEventListener('click', function() {
    closeModal('modal-overlay');
  });
  
  setupHeaderCheckbox();
  
  updateActionButtonsState();
  
  // Set up delete modal event listeners
  setupDeleteModalListeners();
}

function setupDeleteModalListeners() {
  // Get all the elements
  const deleteCloseBtn = document.getElementById('delete-close-btn');
  const deleteCancelBtn = document.getElementById('delete-cancel-btn');
  const deleteConfirmBtn = document.getElementById('delete-confirm-btn');
  
  // Handle close button click
  if (deleteCloseBtn) {
    deleteCloseBtn.addEventListener('click', function() {
      hideDeleteModal();
    });
  }
  
  // Handle cancel button click
  if (deleteCancelBtn) {
    deleteCancelBtn.addEventListener('click', function() {
      hideDeleteModal();
    });
  }
  
  // Handle confirm button click
  if (deleteConfirmBtn) {
    deleteConfirmBtn.addEventListener('click', function() {
      if (pendingDeleteId) {
        // Single student delete
        removeStudent(pendingDeleteId);
        showNotification(`Student deleted successfully.`, 'success');
        pendingDeleteId = null;
      } else if (selectedStudents.length > 0) {
        // Multiple students delete
        const count = selectedStudents.length;
        selectedStudents.forEach(id => {
          removeStudent(id);
        });
        selectedStudents = [];
        showNotification(`${count} students deleted successfully.`, 'success');
      }
      
      updateActionButtonsState();
      hideDeleteModal();
    });
  }
}

// Initialize with sample data
function initializeSampleData() {
  const sampleStudents = [
    {
      id: 1,
      group: 'PZ-25',
      firstName: 'Iryna',
      lastName: 'Hrabovenska',
      gender: 'Female',
      birthday: '13/08/2006',
      status: 'online'
    },
    {
      id: 2,
      group: 'PZ-25',
      firstName: 'Marichka',
      lastName: 'Lytvin',
      gender: 'Female',
      birthday: '12/02/1950',
      status: 'offline'
    },
    {
      id: 3,
      group: 'PZ-26',
      firstName: 'Marta',
      lastName: 'Baba Zastrizhna',
      gender: 'Female',
      birthday: '12/02/1750',
      status: 'offline'
    },
    {
      id: 4,
      group: 'PZ-26',
      firstName: 'Marta',
      lastName: 'Baba Zastrizhna',
      gender: 'Female',
      birthday: '12/02/1750',
      status: 'offline'
    }
 
  ];
  
  // Add each sample student to the DOM
  sampleStudents.forEach(student => {
    createStudentRow(student);
  });
  
  // Add event listeners to the newly created buttons and checkboxes
  addActionButtonListeners();
  setupCheckboxListeners();
}

//------------------------------------------------------------------------------------------DOM Data Management

// Function to create and add a student row to the table
function createStudentRow(student) {
  const tbody = document.querySelector('.students-div table tbody');
  if (!tbody) return;
  
  const row = document.createElement('tr');
  
  // Store all student data as data attributes
  row.dataset.id = student.id;
  row.dataset.group = student.group;
  row.dataset.firstName = student.firstName;
  row.dataset.lastName = student.lastName;
  row.dataset.gender = student.gender;
  row.dataset.birthday = student.birthday;
  row.dataset.status = student.status;
  
  row.innerHTML = `
    <td class="hidden">${student.id}</td>
    <td>
      <div class="custom-checkbox-container">
        <input type="checkbox" id="student-${student.id}" class="student-checkbox" data-id="${student.id}">
        <label for="student-${student.id}" class="custom-checkbox"></label>
      </div>
    </td>
    <td>${student.group}</td>
    <td>${student.firstName} ${student.lastName}</td>
    <td>${student.gender}</td>
    <td>${student.birthday}</td>
    <td>
      <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="${student.status === 'online' ? 'var(--green-clr)' : 'var(--grey-clr)'}">${
        '<path d="M480-80q-82 0-155-31.5t-127.5-86Q143-252 111.5-325T80-480q0-83 31.5-155.5t86-127Q252-817 325-848.5T480-880q83 0 155.5 31.5t127 86q54.5 54.5 86 127T880-480q0 82-31.5 155t-86 127.5q-54.5 54.5-127 86T480-80Zm0-160q100 0 170-70t70-170q0-100-70-170t-170-70q-100 0-170 70t-70 170q0 100 70 170t170 70Z"/>'
      }</svg>
    </td>
    <td>
      <div class="options">
        <button class="ico-button edit-btn" data-id="${student.id}" disabled>
          <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="var(--text-clr)"><path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z"/></svg>
        </button>
        <button class="ico-button delete-btn" data-id="${student.id}" disabled>
          <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="var(--alert-clr)"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/></svg>
        </button>
      </div>
    </td>
  `;
  
  tbody.appendChild(row);
}

// Setup the checkboxes event handlers
function setupCheckboxListeners() {
  // Student checkboxes
  document.querySelectorAll('.student-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', function() {
      const studentId = parseInt(this.dataset.id);
      
      if (this.checked) {
        // Add to selected array if not already there
        if (!selectedStudents.includes(studentId)) {
          selectedStudents.push(studentId);
        }
      } else {
        // Remove from selected array
        selectedStudents = selectedStudents.filter(id => id !== studentId);
        
        // Uncheck header checkbox if any student checkbox is unchecked
        const headerCheckbox = document.querySelector('.header-checkbox');
        if (headerCheckbox) {
          headerCheckbox.checked = false;
        }
      }
      
      // Update buttons state based on selection
      updateActionButtonsState();
    });
  });
}

// Setup the header checkbox for selecting all students
function setupHeaderCheckbox() {
  // Replace the default header checkbox with custom checkbox
  const headerCheckboxCell = document.querySelector('.students-div table thead th:nth-child(2)');
  if (headerCheckboxCell) {
    headerCheckboxCell.innerHTML = `
      <div class="custom-checkbox-container">
        <input type="checkbox" id="select-all-students" class="header-checkbox">
        <label for="select-all-students" class="custom-checkbox"></label>
      </div>
    `;
    
    // Add event listener to header checkbox
    const headerCheckbox = document.querySelector('.header-checkbox');
    if (headerCheckbox) {
      headerCheckbox.addEventListener('change', function() {
        const studentCheckboxes = document.querySelectorAll('.student-checkbox');
        
        // Check/uncheck all student checkboxes
        studentCheckboxes.forEach(checkbox => {
          checkbox.checked = this.checked;
          
          const studentId = parseInt(checkbox.dataset.id);
          if (this.checked) {
            // Add to selected array if not already there
            if (!selectedStudents.includes(studentId)) {
              selectedStudents.push(studentId);
            }
          }
        });
        
        // If unchecked, clear selected array
        if (!this.checked) {
          selectedStudents = [];
        }
        
        // Update buttons state
        updateActionButtonsState();
      });
    }
  }
}

// Update action buttons state (enabled/disabled) based on selection
function updateActionButtonsState() {
  // Don't update buttons if a delete confirmation is active
  if (deleteConfirmationActive) return;
  
  const editButtons = document.querySelectorAll('.edit-btn');
  const deleteButtons = document.querySelectorAll('.delete-btn');
  
  if (selectedStudents.length === 0) {
    // No selection - disable all buttons
    editButtons.forEach(btn => btn.disabled = true);
    deleteButtons.forEach(btn => btn.disabled = true);
  } else if (selectedStudents.length === 1) {
    // Single selection - enable edit and delete for selected student
    const selectedId = selectedStudents[0];
    
    editButtons.forEach(btn => {
      const btnId = parseInt(btn.dataset.id);
      btn.disabled = btnId !== selectedId;
    });
    
    deleteButtons.forEach(btn => {
      const btnId = parseInt(btn.dataset.id);
      btn.disabled = btnId !== selectedId;
    });
  } else {
    // Multiple selection - disable edit buttons, enable delete buttons for selected students
    editButtons.forEach(btn => btn.disabled = true);
    
    deleteButtons.forEach(btn => {
      const btnId = parseInt(btn.dataset.id);
      btn.disabled = !selectedStudents.includes(btnId);
    });
  }
}

function getAllStudents() {
  const studentRows = document.querySelectorAll('.students-div table tbody tr');
  return Array.from(studentRows).map(row => {
    return {
      id: parseInt(row.dataset.id),
      group: row.dataset.group,
      firstName: row.dataset.firstName,
      lastName: row.dataset.lastName,
      gender: row.dataset.gender,
      birthday: row.dataset.birthday,
      status: row.dataset.status
    };
  });
}

function getStudentById(id) {
  const row = document.querySelector(`.students-div table tbody tr[data-id="${id}"]`);
  if (!row) return null;
  
  return {
    id: parseInt(row.dataset.id),
    group: row.dataset.group,
    firstName: row.dataset.firstName,
    lastName: row.dataset.lastName,
    gender: row.dataset.gender,
    birthday: row.dataset.birthday,
    status: row.dataset.status
  };
}

// Update a student in the DOM
function updateStudent(student) {
  const row = document.querySelector(`.students-div table tbody tr[data-id="${student.id}"]`);
  if (!row) return false;
  
  // Update data attributes
  row.dataset.group = student.group;
  row.dataset.firstName = student.firstName;
  row.dataset.lastName = student.lastName;
  row.dataset.gender = student.gender;
  row.dataset.birthday = student.birthday;
  row.dataset.status = student.status;
  
  // Update visible content
  row.children[2].textContent = student.group;
  row.children[3].textContent = `${student.firstName} ${student.lastName}`;
  row.children[4].textContent = student.gender;
  row.children[5].textContent = student.birthday;
  
  // Update status icon
  const statusSvg = row.children[6].querySelector('svg');
  if (statusSvg) {
    statusSvg.setAttribute('fill', student.status === 'online' ? 'var(--green-clr)' : 'var(--grey-clr)');
  }
  
  return true;
}

// Setup event listeners for table
function addActionButtonListeners() {
  // Edit button listeners
  document.querySelectorAll('.edit-btn').forEach(button => {
    button.addEventListener('click', function() {
      if (this.disabled) return;
      
      const studentId = parseInt(this.getAttribute('data-id'));
      editStudent(studentId);
    });
  });
  
  // Delete button listeners
  document.querySelectorAll('.delete-btn').forEach(button => {
    button.addEventListener('click', function() {
      if (this.disabled) return;
      
      const studentId = parseInt(this.getAttribute('data-id'));
      
      if (selectedStudents.length > 1) {
        // If multiple students are selected, delete all selected
        deleteMultipleStudents();
      } else {
        // Delete single student
        deleteStudent(studentId);
      }
    });
  });
  
  // Setup checkbox listeners for new rows
  setupCheckboxListeners();
}

//------------------------------------------------------------------------------------------Modal form

// Add modal form
function addStudent() {
  editingStudent = null; // Clear any existing editing student
  
  document.getElementById('form-title').textContent = 'Add New Student'; // add mode
  
  document.getElementById('student-id').value = '';
  document.getElementById('group').value = '';
  document.getElementById('firstName').value = '';
  document.getElementById('lastName').value = '';
  document.getElementById('gender').value = '';
  document.getElementById('birthday').value = '';
  
  showModal('modal-overlay');
}

// Edit modal form
function editStudent(studentId) {
  editingStudent = getStudentById(studentId);
  if (!editingStudent) return;
  
  document.getElementById('form-title').textContent = 'Edit Student';
  
  let birthdayParts = editingStudent.birthday.split('/');
  let formattedDate = `${birthdayParts[2]}-${birthdayParts[1].padStart(2, '0')}-${birthdayParts[0].padStart(2, '0')}`;
  
  document.getElementById('student-id').value = editingStudent.id;
  document.getElementById('group').value = editingStudent.group;
  document.getElementById('firstName').value = editingStudent.firstName;
  document.getElementById('lastName').value = editingStudent.lastName;
  document.getElementById('gender').value = editingStudent.gender;
  document.getElementById('birthday').value = formattedDate;
  
  showModal('modal-overlay');
}

// Save student data
function saveStudentData() {
  const studentIdInput = document.getElementById('student-id');
  const groupInput = document.getElementById('group');
  const firstNameInput = document.getElementById('firstName');
  const lastNameInput = document.getElementById('lastName');
  const genderInput = document.getElementById('gender');
  const birthdayInput = document.getElementById('birthday');
  
  let dateValue = new Date(birthdayInput.value);
  let formattedDate = `${dateValue.getDate().toString().padStart(2, '0')}/${(dateValue.getMonth() + 1).toString().padStart(2, '0')}/${dateValue.getFullYear()}`;
  
  const student = {
    id: studentIdInput.value ? parseInt(studentIdInput.value) : Date.now(), // Use current timestamp as unique ID
    group: groupInput.value,
    firstName: firstNameInput.value,
    lastName: lastNameInput.value,
    gender: genderInput.value,
    birthday: formattedDate,
    status: editingStudent ? editingStudent.status : 'offline'
  };
  
  if (studentIdInput.value) {
    // Update existing student
    updateStudent(student);
    showNotification(`Student ${student.firstName} ${student.lastName} updated successfully`, 'success');
  } else {
    // Add new student
    createStudentRow(student);
    // Add listeners to the new row's buttons and checkbox
    addActionButtonListeners();
    showNotification(`Student ${student.firstName} ${student.lastName} added successfully`, 'success');
  }
  
  closeModal('modal-overlay');
}

// Modal help functions
function showModal(modalId) {
  document.getElementById(modalId).style.display = 'flex';
}

function closeModal(modalId) {
  document.getElementById(modalId).style.display = 'none';
}

//------------------------------------------------------------------------------------------Delete functionality

// Function to delete a single student
function deleteStudent(studentId) {
  const student = getStudentById(studentId);
  if (student) {
    pendingDeleteId = studentId;
    document.getElementById('delete-modal-title').textContent = 'Delete Student';
    document.getElementById('delete-message').textContent = `Would you like to delete ${student.firstName} ${student.lastName}?`;
    showModal('delete-modal-overlay');
  }
}

// Function to delete multiple students
function deleteMultipleStudents() {
  if (selectedStudents.length === 0) return;

  selectedStudentsStr = selectedStudents.map(id => `${getStudentById(id).firstName} ${getStudentById(id).lastName}`).join(', ');
  
  pendingDeleteId = null; // Multiple delete mode
  document.getElementById('delete-modal-title').textContent = 'Delete Students';
  document.getElementById('delete-message').textContent = `Would you like to delete ${selectedStudents.length} students? (${selectedStudentsStr})`;
  showModal('delete-modal-overlay');
}

function hideDeleteModal() {
  closeModal('delete-modal-overlay');
  pendingDeleteId = null;
}

function removeStudent(id) {
  const row = document.querySelector(`.students-div table tbody tr[data-id="${id}"]`);
  if (row) {
    row.remove();
    selectedStudents = selectedStudents.filter(studentId => studentId !== id);
    return true;
  }
  return false;
}

//------------------------------------------------------------------------------------------Notifications

function showNotification(message, type = 'info') {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
    <div class="notification-content">
      <div class="notification-icon">
        ${type === 'success'
          ? '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="var(--accent1-clr)"><path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z"/></svg>'
          : '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="var(--alert-clr)"><path d="M480-280q17 0 28.5-11.5T520-320q0-17-11.5-28.5T480-360q-17 0-28.5 11.5T440-320q0 17 11.5 28.5T480-280Zm-40-160h80v-240h-80v240Zm40 360q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/></svg>'}
      </div>
      <div class="notification-message">${message}</div>
    </div>
    <button class="notification-close">
      <svg xmlns="http://www.w3.org/2000/svg" height="18px" viewBox="0 -960 960 960" width="18px" fill="currentColor">
        <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"/>
      </svg>
    </button>
  `;
  
  // Add it to the DOM
  document.body.appendChild(notification);
  
  // Add event listener to close button
  notification.querySelector('.notification-close').addEventListener('click', () => {
    notification.classList.add('notification-hide');
    setTimeout(() => notification.remove(), 300);
  });
  
  setTimeout(() => {
    if (document.body.contains(notification)) {
      notification.classList.add('notification-hide');
      setTimeout(() => notification.remove(), 300);
    }
  }, 4000);
  
  // Animate in
  setTimeout(() => {
    notification.classList.add('notification-show');
  }, 10);
}