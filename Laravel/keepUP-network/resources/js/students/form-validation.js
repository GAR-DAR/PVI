// Show notification function
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
    <div class="notification-content">
      <div class="notification-icon">
        ${type === 'success'
          ? '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="var(--accent2-clr)"><path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z"/></svg>'
          : '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="var(--accent1-clr)"><path d="M480-280q17 0 28.5-11.5T520-320q0-17-11.5-28.5T480-360q-17 0-28.5 11.5T440-320q0 17 11.5 28.5T480-280Zm-40-160h80v-240h-80v240Zm40 360q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/></svg>'}
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
  
  // event listener to close button
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
  
  // Animation
  setTimeout(() => {
    notification.classList.add('notification-show');
  }, 10);
}

// Validation functions
function validateGroup(value) {
  const groupRegex = /^[A-Z]{2}-\d{1,2}$/;
  if (!groupRegex.test(value)) {
    return "Group must be in format XX-## (e.g., PZ-25)";
  }
  return null; // No error
}

function validateFirstName(value) {
  const nameRegex = /^[A-Za-z]{2,}$/;
  if (!nameRegex.test(value)) {
    return "First name should contain at least 2 letters (no numbers or special characters)";
  }
  return null; // No error
}

function validateLastName(value) {
  const nameRegex = /^[A-Za-z\s]{2,}$/;
  if (!nameRegex.test(value)) {
    return "Last name should contain at least 2 letters (spaces allowed, no numbers or special characters)";
  }
  return null; // No error
}

function validateBirthday(value) {
  if (!value) {
    return "Birthday is required";
  }
  
  const birthDate = new Date(value);
  const today = new Date();
  const minDate = new Date();
  const maxDate = new Date();
  minDate.setFullYear(today.getFullYear() - 100); // Max 100 years old
  maxDate.setFullYear(today.getFullYear() - 18); // Min 18 years old
  
  if (birthDate > today) {
    return "Birthday cannot be in the future";
  }
  
  if (birthDate < minDate) {
    return "Birthday cannot be more than 100 years ago";
  }
  
  if (birthDate > maxDate) {
    return "You must be at least 18 years old";
  }
  
  return null; // No error
}

// Form validation function
function validateStudentForm() {
  const group = document.getElementById('group').value;
  const firstName = document.getElementById('first_name').value;
  const lastName = document.getElementById('last_name').value;
  const gender = document.getElementById('gender_id').value;
  const birthday = document.getElementById('birthday').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  
  // Check each field and collect errors
  const errors = [];
  
  // Group validation
  const groupError = validateGroup(group);
  if (groupError) errors.push(groupError);
  
  // First name validation
  const firstNameError = validateFirstName(firstName);
  if (firstNameError) errors.push(firstNameError);
  
  // Last name validation
  const lastNameError = validateLastName(lastName);
  if (lastNameError) errors.push(lastNameError);
  
  // Gender validation (simple required check)
  if (!gender) errors.push("Please select a gender");
  
  // Birthday validation
  const birthdayError = validateBirthday(birthday);
  if (birthdayError) errors.push(birthdayError);
  
  // Basic email validation
  if (!email) errors.push("Email is required");
  
  // Basic password validation
  if (!password || password.length < 6) errors.push("Password must be at least 6 characters");
  
  // If there are errors, show only the first one
  if (errors.length > 0) {
    showNotification(errors[0], 'info');
    return false;
  }
  
  return true;
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Display first server validation error if it exists
  if (typeof firstError !== 'undefined' && firstError) {
    showNotification(firstError, 'info');
  } else if (typeof serverErrors !== 'undefined' && serverErrors.length > 0) {
    // Fallback to first in array if firstError isn't available
    showNotification(serverErrors[0], 'info');
  }
  
  // Display success message
  if (typeof successMessage !== 'undefined' && successMessage) {
    showNotification(successMessage, 'success');
  }
  
  // Form validation on submit
  const form = document.getElementById('student-form');
  if (form) {
    form.addEventListener('submit', function(e) {
      if (!validateStudentForm()) {
        e.preventDefault(); // Prevent form submission if validation fails
      }
    });
  }
});