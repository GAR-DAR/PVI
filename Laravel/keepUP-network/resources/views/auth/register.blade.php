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
                    </div>

                    <div class="form-group">
                        <label for="password">Password:</label>
                        <input type="password" id="password" name="password" required>
                    </div>

                    <div class="form-group">
                        <label for="password_confirmation">Confirm Password:</label>
                        <input type="password" id="password_confirmation" name="password_confirmation" required>
                    </div>

                    <div class="form-actions">
                        <a href="{{ route('login') }}" class="btn btn-secondary">Back to Login</a>
                        <button type="submit" class="btn btn-primary">Register & Continue</button>
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

            // If there are validation errors, prevent form submission and show only the first error
            if (errors.length > 0) {
                e.preventDefault();
                showNotification(errors[0], 'info');
            }
        });

    </script>
</x-layout>
