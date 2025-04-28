<x-layout>
    <div id="modal-overlay" class="modal-overlay" style="display: flex;">
        <div class="modal-container">
            <div class="modal-header">
                <h2 id="form-title">Create New Account</h2>
            </div>
            <div class="modal-body">
                <form id="register-form" method="POST" action="{{ route('register') }}" enctype="multipart/form-data">
                    @csrf

                    <!-- Profile Photo Upload Section -->
                    <div class="profile-photo-section" style="display: flex; justify-content: center; margin-bottom: 20px;">
                        <div class="avatar-upload-container" style="position: relative; cursor: pointer;">
                            <div class="avatar-container" style="width: 100px; height: 100px; border-radius: 50%; overflow: hidden; margin: 0 auto;">
                                <img id="avatar-preview" src="{{ asset('images/user-sample.png') }}" alt="Profile Avatar" style="width: 100%; height: 100%; object-fit: cover;">
                            </div>
                            <div class="avatar-overlay" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; justify-content: center; align-items: center; background-color: rgba(0,0,0,0.5); border-radius: 50%; opacity: 0; transition: opacity 0.3s;">
                                <svg xmlns="http://www.w3.org/2000/svg" height="36px" viewBox="0 -960 960 960" width="36px" fill="#ffffff">
                                    <path d="M440-280h80v-160h160v-80H520v-160h-80v160H280v80h160v160Zm40 200q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Z" />
                                </svg>
                            </div>
                            <input type="file" id="profile_photo" name="profile_photo" accept="image/jpeg,image/jpg" style="display: none;">
                        </div>
                    </div>

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

                    <input type="hidden" name="status_id" value="2">

                    <div class="form-actions">
                        <a href="{{ route('login') }}" class="btn btn-secondary">Back to Login</a>
                        <button type="submit" class="btn btn-primary">Register</button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <script>
        // Avatar upload handling
        document.addEventListener('DOMContentLoaded', function() {
            const avatarContainer = document.querySelector('.avatar-upload-container');
            const avatarOverlay = document.querySelector('.avatar-overlay');
            const fileInput = document.getElementById('profile_photo');
            const avatarPreview = document.getElementById('avatar-preview');

            // Show overlay on hover
            avatarContainer.addEventListener('mouseenter', function() {
                avatarOverlay.style.opacity = '1';
            });

            avatarContainer.addEventListener('mouseleave', function() {
                avatarOverlay.style.opacity = '0';
            });

            // Trigger file input click
            avatarContainer.addEventListener('click', function() {
                fileInput.click();
            });

            // Preview the selected image
            fileInput.addEventListener('change', function() {
                if (this.files && this.files[0]) {
                    const reader = new FileReader();

                    reader.onload = function(e) {
                        avatarPreview.src = e.target.result;
                    }

                    reader.readAsDataURL(this.files[0]);
                }
            });
        });

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

            // Photo validation (optional)
            const photo = document.getElementById('profile_photo');
            if (photo.files.length > 0) {
                const file = photo.files[0];
                // Check file type
                if (!file.type.match('image/jpe?g')) {
                    errors.push("Profile photo must be a JPG/JPEG image");
                }
                // Check file size (max 2MB)
                if (file.size > 2 * 1024 * 1024) {
                    errors.push("Profile photo must be less than 2MB");
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
