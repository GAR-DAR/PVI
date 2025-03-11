

let editingStudent = null; //current editing student

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
    e.preventDefault(); //submission with js, not default html one
    if (document.getElementById('student-form').checkValidity()) { //check if all fields are filled 
      saveStudentData();
    }
  });
  
  document.getElementById('cancel-btn').addEventListener('click', closeModal);
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
    }
  ];
  
  // Add each sample student to the DOM
  sampleStudents.forEach(student => {
    createStudentRow(student);
  });
  
  // Add event listeners to the newly created buttons
  addActionButtonListeners();
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
    <td><input type="checkbox"></td>
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
        <button class="ico-button edit-btn" data-id="${student.id}">
          <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="var(--text-clr)"><path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z"/></svg>
        </button>
        <button class="ico-button delete-btn" data-id="${student.id}">
          <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="var(--alert-clr)"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/></svg>
        </button>
      </div>
    </td>
  `;
  
  tbody.appendChild(row);
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
  statusSvg.setAttribute('fill', student.status === 'online' ? 'var(--green-clr)' : 'var(--grey-clr)');
  
  return true;
}

// Remove a student from the DOM
function removeStudent(id) {
  const row = document.querySelector(`.students-div table tbody tr[data-id="${id}"]`);
  if (row) {
    row.remove();
    return true;
  }
  return false;
}

//------------------------------------------------Event listeners for table
function addActionButtonListeners() {
  document.querySelectorAll('.edit-btn').forEach(button => {
    button.addEventListener('click', function() {
      const studentId = parseInt(this.getAttribute('data-id'));
      editStudent(studentId);
    });
  });
  
  document.querySelectorAll('.delete-btn').forEach(button => {
    button.addEventListener('click', function() {
      const studentId = parseInt(this.getAttribute('data-id'));
      deleteStudent(studentId);
    });
  });
}

//------------------------------------------------------------------------------------------Modal form

//-----------------------------------------------Add modal form
function addStudent() {
  editingStudent = null; // Clear any existing editing student
  
  document.getElementById('form-title').textContent = 'Add New Student'; // add mode
  
  document.getElementById('student-id').value = '';
  document.getElementById('group').value = '';
  document.getElementById('firstName').value = '';
  document.getElementById('lastName').value = '';
  document.getElementById('gender').value = '';
  document.getElementById('birthday').value = '';
  
  showModal();
}

//-----------------------------------------------Edit modal form
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
  
  showModal();
}

//-----------------------------------------------Delete student
function deleteStudent(studentId) {
  const student = getStudentById(studentId);
  
  if (student && confirm(`Are you sure you want to delete ${student.firstName} ${student.lastName}?`)) {
    removeStudent(studentId);
  }
}

//-----------------------------------------------Save student data
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
  } else {
    // Add new student
    createStudentRow(student);
    // Add listeners to the new row's buttons
    addActionButtonListeners();
  }
  
  closeModal();
}

//-----------------------------------------------Modal help functions
function showModal() {
  document.getElementById('modal-overlay').style.display = 'flex';
}

function closeModal() {
  document.getElementById('modal-overlay').style.display = 'none';
}