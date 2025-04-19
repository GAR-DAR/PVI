<x-layout>
    <div id="modal-overlay" class="modal-overlay" style="display: flex;">
        <div class="modal-container">
            <div class="modal-header">
                <h2 id="form-title">Add New Student</h2>
            </div>
            <div class="modal-body">
                <form id="student-form" method="POST" action="{{ route('students.store') }}">
                    @csrf
                    <input type="hidden" id="student-id" name="id">
                    <!-- Add hidden status_id field with default value 1 for online -->
                    <input type="hidden" id="status_id" name="status_id" value="1">
                    <div class="form-group">
                        <label for="group">Group:</label>
                        <input type="text" id="group" name="group" required maxlength="10" value="{{ old('group') }}">
                    </div>
                    <div class="name-row">
                        <div class="form-group">
                            <label for="first_name">First Name:</label>
                            <input type="text" id="first_name" name="first_name" minlength="2" maxlength="50" required value="{{ old('first_name') }}">
                        </div>
                        <div class="form-group">
                            <label for="last_name">Last Name:</label>
                            <input type="text" id="last_name" name="last_name" minlength="2" maxlength="50" required value="{{ old('last_name') }}">
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="gender_id">Gender:</label>
                        <select id="gender_id" name="gender_id" required>
                            <option value="">Select Gender</option>
                            @foreach($genders as $gender)
                            <option value="{{ $gender->id }}" {{ old('gender_id') == $gender->id ? 'selected' : '' }}>{{ $gender->name }}</option>
                            @endforeach
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="birthday">Birthday:</label>
                        <input type="date" id="birthday" name="birthday" required max="{{ date('Y-m-d') }}" value="{{ old('birthday') }}">
                    </div>
                    <div class="form-group">
                        <label for="email">Email:</label>
                        <input type="email" id="email" name="email" required value="{{ old('email') }}">
                    </div>
                    <div class="form-group">
                        <label for="password">Password:</label>
                        <input type="password" id="password" name="password" required minlength="6">
                    </div>
                    <div class="form-actions">
                        <button type="button" id="cancel-btn" class="btn btn-danger" onclick="window.location.href='{{ route('students.index') }}'">Cancel</button>
                        <button type="submit" id="save-btn" class="btn btn-primary">Save</button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <script>
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

        // Display only the first validation error from server
        @if($errors -> any())
        document.addEventListener('DOMContentLoaded', function() {
            showNotification("{{ $errors->first() }}", 'info');
        });
        @endif

        // Display success message
        @if(session('success'))
        document.addEventListener('DOMContentLoaded', function() {
            showNotification("{{ session('success') }}", 'success');
        });
        @endif

        // Client-side validation before form submission
        document.getElementById('student-form').addEventListener('submit', function(e) {
            let errors = [];

            // Group validation
            const group = document.getElementById('group').value;
            const groupRegex = /^[A-Z]{2}-\d{1,2}$/;
            if (!groupRegex.test(group)) {
                errors.push("Group must be in format XX-## (e.g., PZ-25)");
            }

            // First name validation
            const firstName = document.getElementById('first_name').value;
            const firstNameRegex = /^[A-Za-z]{2,}$/;
            if (!firstNameRegex.test(firstName)) {
                errors.push("First name should contain at least 2 letters (no numbers or special characters)");
            }

            // Last name validation
            const lastName = document.getElementById('last_name').value;
            const lastNameRegex = /^[A-Za-z\s]{2,}$/;
            if (!lastNameRegex.test(lastName)) {
                errors.push("Last name should contain at least 2 letters (spaces allowed, no numbers or special characters)");
            }

            // Birthday validation
            const birthday = document.getElementById('birthday').value;
            if (birthday) {
                const birthDate = new Date(birthday);
                const today = new Date();
                const minDate = new Date();
                const maxDate = new Date();
                minDate.setFullYear(today.getFullYear() - 100); // Max 100 years old
                maxDate.setFullYear(today.getFullYear() - 18); // Min 18 years old

                if (birthDate > today) {
                    errors.push("Birthday cannot be in the future");
                } else if (birthDate < minDate) {
                    errors.push("Birthday cannot be more than 100 years ago");
                } else if (birthDate > maxDate) {
                    errors.push("You must be at least 18 years old");
                }
            }

            // If there are validation errors, prevent form submission and show only the first error
            if (errors.length > 0) {
                e.preventDefault();
                showNotification(errors[0], 'info');
            }
        });

    </script>
</x-layout>
