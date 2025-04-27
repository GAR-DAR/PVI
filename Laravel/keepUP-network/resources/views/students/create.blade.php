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
