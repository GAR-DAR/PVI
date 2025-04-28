<x-layout>
    <div id="modal-overlay" class="modal-overlay" style="display: flex;">
        <div class="modal-container">
            <div class="modal-header">
                <h2 id="form-title">Add New Student</h2>
            </div>
            <div class="modal-body">
                <form id="student-form" method="POST" action="{{ route('students.store') }}" enctype="multipart/form-data">
                    @csrf
                    <input type="hidden" id="student-id" name="id">

                    <input type="hidden" id="status_id" name="status_id" value="2">

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

