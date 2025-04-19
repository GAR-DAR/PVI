
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
  const maxDate = new Date(); // This was missing
  minDate.setFullYear(today.getFullYear() - 100); // Max 100 years old
  maxDate.setFullYear(today.getFullYear() - 18); // Min 18 years old
  
  if (birthDate > today) {
    return "Birthday cannot be in the future";
  }
  
  if (birthDate < minDate) {
    return "Birthday cannot be more than 100 years ago";
  }
  
  return null; // No error
}

//---------------------------------------------------------------------------------------- Main function to validate the form


function validateStudentForm() {
  const group = document.getElementById('group').value;
  const firstName = document.getElementById('firstName').value;
  const lastName = document.getElementById('lastName').value;
  const gender = document.getElementById('gender').value;
  const birthday = document.getElementById('birthday').value;
  
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
  
  // If there are errors, show the first one in a notification
  if (errors.length > 0) {
    showNotification(errors[0], 'info'); // Use 'info' type for validation messages
    return false;
  }
  
  return true;
}

