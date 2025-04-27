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
</x-layout>
