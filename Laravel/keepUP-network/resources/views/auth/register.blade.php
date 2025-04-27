<x-layout>
    <div id="modal-overlay" class="modal-overlay" style="display: flex;">
        <div class="modal-container">
            <div class="modal-header">
                <h2 id="form-title">Create New Account</h2>
            </div>
            <div class="modal-body">
                <form id="register-form" method="POST" action="{{ route('register') }}">
                    @csrf
                    <div class="form-group">
                        <label for="email">Email:</label>
                        <input type="email" id="email" name="email" value="{{ old('email') }}" required autofocus>
                        @error('email')
                        <span class="error-message">{{ $message }}</span>
                        @enderror
                    </div>

                    <div class="form-group">
                        <label for="password">Password:</label>
                        <input type="password" id="password" name="password" required>
                        @error('password')
                        <span class="error-message">{{ $message }}</span>
                        @enderror
                    </div>

                    <div class="form-group">
                        <label for="password_confirmation">Confirm Password:</label>
                        <input type="password" id="password_confirmation" name="password_confirmation" required>
                    </div>

                    <div class="form-group">
                        <label for="group">Group:</label>
                        <input type="text" id="group" name="group" value="{{ old('group') }}" required maxlength="10">
                        @error('group')
                        <span class="error-message">{{ $message }}</span>
                        @enderror
                    </div>

                    <div class="form-group name-group" style="display: flex; gap: 10px;">
                        <div style="flex: 1;">
                            <label for="first_name">First Name:</label>
                            <input type="text" id="first_name" name="first_name" value="{{ old('first_name') }}" required style="width: 100%;">
                            @error('first_name')
                            <span class="error-message">{{ $message }}</span>
                            @enderror
                        </div>
                        <div style="flex: 1;">
                            <label for="last_name">Last Name:</label>
                            <input type="text" id="last_name" name="last_name" value="{{ old('last_name') }}" required style="width: 100%;">
                            @error('last_name')
                            <span class="error-message">{{ $message }}</span>
                            @enderror
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="gender_id">Gender:</label>
                        <select id="gender_id" name="gender_id" required>
                            <option value="">Select Gender</option>
                            @foreach($genders as $gender)
                            <option value="{{ $gender->id }}" {{ old('gender_id') == $gender->id ? 'selected' : '' }}>
                                {{ $gender->name }}
                            </option>
                            @endforeach
                        </select>
                        @error('gender_id')
                        <span class="error-message">{{ $message }}</span>
                        @enderror
                    </div>

                    <div class="form-group">
                        <label for="birthday">Birthday:</label>
                        <input type="date" id="birthday" name="birthday" value="{{ old('birthday') }}" required>
                        @error('birthday')
                        <span class="error-message">{{ $message }}</span>
                        @enderror
                    </div>

                    <!-- Hidden field for status_id, defaulting to online status (assuming ID 1 is online) -->
                    <input type="hidden" name="status_id" value="1">

                    <div class="form-actions">
                        <a href="{{ route('login') }}" class="btn btn-secondary">Back to Login</a>
                        <button type="submit" class="btn btn-primary">Register</button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <script>
        // Client-side validation
        document.getElementById('register-form').addEventListener('submit', function(e) {
            let errors = [];

            // Password validation
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('password_confirmation').value;

            if (password.length < 8) {
                errors.push("Password must be at least 8 characters");
            }

            if (password !== confirmPassword) {
                errors.push("Passwords do not match");
            }

            // Name validation
            const firstName = document.getElementById('first_name').value;
            const lastName = document.getElementById('last_name').value;

            if (firstName.length < 2) {
                errors.push("First name must be at least 2 characters");
            }

            if (lastName.length < 2) {
                errors.push("Last name must be at least 2 characters");
            }

            // Check if gender is selected
            const gender = document.getElementById('gender_id').value;

            if (!gender) {
                errors.push("Please select a gender");
            }

            // If there are validation errors, prevent form submission and show only the first error
            if (errors.length > 0) {
                e.preventDefault();
                showNotification(errors[0], 'info');
            }
        });

    </script>
</x-layout>
