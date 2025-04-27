let editingStudent = null; 
let selectedStudents = []; 
let deleteConfirmationActive = false; 
let pendingDeleteId = null;

document.addEventListener('DOMContentLoaded', initPage);

function initPage() {


  setupTableRowButtons();
  
  setupSelectionSystem();
  
  updateActionButtonStates();
}


function setupSelectionSystem() {
  // Set up "select all" checkbox in the table header
  const selectAllCheckbox = document.getElementById('select-all-students');
  if (selectAllCheckbox) {
    selectAllCheckbox.addEventListener('change', function() {
      const studentCheckboxes = document.querySelectorAll('.student-checkbox');
      const isChecked = this.checked;
      
      // Update all student checkboxes to match header checkbox
      studentCheckboxes.forEach(checkbox => {
        checkbox.checked = isChecked;
      });
      
      // Update the selected students array and button states
      updateSelectedStudents();
    });
  }
  
  // Set up individual student checkboxes
  const studentCheckboxes = document.querySelectorAll('.student-checkbox');
  studentCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', function() {
      // Update the array of selected students
      updateSelectedStudents();
      
      // Check if all checkboxes are checked to update "select all" checkbox
      const selectAllCheckbox = document.getElementById('select-all-students');
      if (selectAllCheckbox) {
        const allCheckboxes = document.querySelectorAll('.student-checkbox');
        const allChecked = Array.from(allCheckboxes).every(checkbox => checkbox.checked);
        const anyChecked = Array.from(allCheckboxes).some(checkbox => checkbox.checked);
        
        // Set the "select all" checkbox state
        selectAllCheckbox.checked = allChecked;
        
        // You could also implement indeterminate state if needed
        // selectAllCheckbox.indeterminate = anyChecked && !allChecked;
      }
    });
  });
}

function updateSelectedStudents() {
  // Clear the array
  selectedStudents = [];
  
  // Get all checked checkboxes
  const checkedCheckboxes = document.querySelectorAll('.student-checkbox:checked');
  
  // Add each selected student ID to our array
  checkedCheckboxes.forEach(checkbox => {
    const studentId = checkbox.id.replace('student-', '');
    selectedStudents.push(studentId);
  });
  
  // Update button states based on selection
  updateActionButtonStates();
}

function updateActionButtonStates() {
  const rows = document.querySelectorAll('tbody tr');
  
  // Disable all buttons first
  const allEditButtons = document.querySelectorAll('.edit-btn');
  const allDeleteButtons = document.querySelectorAll('.delete-btn');
  
  allEditButtons.forEach(btn => btn.disabled = true);
  allDeleteButtons.forEach(btn => btn.disabled = true);
  
  // If no students are selected, all buttons remain disabled
  if (selectedStudents.length === 0) {
    return;
  }
  
  // If one student is selected, enable both edit and delete for that student
  if (selectedStudents.length === 1) {
    const selectedId = selectedStudents[0];
    
    // Find and enable buttons for the selected student
    rows.forEach(row => {
      const checkbox = row.querySelector('.student-checkbox');
      if (checkbox && checkbox.id === `student-${selectedId}`) {
        const editBtn = row.querySelector('.edit-btn');
        const deleteBtn = row.querySelector('.delete-btn');
        
        if (editBtn) editBtn.disabled = false;
        if (deleteBtn) deleteBtn.disabled = false;
      }
    });
  } 
  // If multiple students are selected, enable only delete buttons for those students
  else if (selectedStudents.length > 1) {
    rows.forEach(row => {
      const checkbox = row.querySelector('.student-checkbox');
      if (checkbox && checkbox.checked) {
        const deleteBtn = row.querySelector('.delete-btn');
        if (deleteBtn) deleteBtn.disabled = false;
      }
    });
  }
}

function setupTableRowButtons() {
  // Set up edit buttons
  const editButtons = document.querySelectorAll('.edit-btn');
  editButtons.forEach(button => {
    button.addEventListener('click', function() {
      const studentId = this.getAttribute('data-student-id');
      editStudent(studentId);
    });
    // Initially disable all buttons
    button.disabled = true;
  });
  
  // Set up delete buttons
  const deleteButtons = document.querySelectorAll('.delete-btn');
  deleteButtons.forEach(button => {
    button.addEventListener('click', function() {
      const studentId = this.getAttribute('data-student-id');
      
      // Check if multiple selection is active
      if (selectedStudents.length > 1) {
        deleteMultipleStudents();
      } else {
        deleteStudent(studentId);
      }
    });
    // Initially disable all buttons
    button.disabled = true;
  });
}

function addActionButtonListeners() {
  // This function will be called when new buttons are added to the DOM
  setupTableRowButtons();
  updateActionButtonStates();
}

//------------------------------------------------------------------------------ Students Action Functions

function editStudent(studentId) {
  
}

function deleteStudent(studentId) {
 
}

function deleteMultipleStudents() {
  
}

function addStudent() {
 
}

function saveStudentData() {
  
}

function closeModal(modalId) {
  // Hide the specified modal
  document.getElementById(modalId).style.display = 'none';
}

