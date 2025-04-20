<x-layout>
    <div id="modal-overlay" class="modal-overlay" style="display: flex;">
        <div class="modal-container">
            <div class="modal-header">
                <h2 id="form-title">Delete Student</h2>
            </div>
            <div class="modal-body">
                <p class="confirmation-message">Are you sure you want to delete <strong>{{ $student->first_name }} {{ $student->last_name }}</strong>?</p>

                <form id="delete-form" method="POST" action="{{ route('students.destroy', $student->id) }}">
                    @csrf
                    @method('DELETE')

                    <div class="form-actions">
                        <button type="button" id="cancel-btn" class="btn btn-primary" onclick="window.location.href='{{ route('students.index') }}'">Cancel</button>
                        <button type="submit" id="delete-btn" class="btn btn-danger">Delete</button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <script src="{{ asset('js/notification.js') }}"></script>

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

        // Display errors or success messages
        @if($errors -> any())
        document.addEventListener('DOMContentLoaded', function() {
            showNotification("{{ $errors->first() }}", 'info');
        });
        @endif

        @if(session('success'))
        document.addEventListener('DOMContentLoaded', function() {
            showNotification("{{ session('success') }}", 'success');
        });
        @endif

    </script>
</x-layout>
