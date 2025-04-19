<!-- Add/Edit Student Modal -->
<div id="modal-overlay" class="modal-overlay">
    <div class="modal-container">
        <div class="modal-header">
            <h2 id="form-title">Add New Student</h2>
        </div>
        <div class="modal-body">
            <form id="student-form">
                <input type="hidden" id="student-id">
                <div class="form-group">
                    <label for="group">Group:</label>
                    <input type="text" id="group" name="group" required>
                </div>
                <div class="name-row">
                    <div class="form-group">
                        <label for="firstName">First Name:</label>
                        <input type="text" id="firstName" name="firstName" pattern="^[A-Za-z]{2,}$" title="At least 2 letters, no numbers or special characters" required>
                    </div>
                    <div class="form-group">
                        <label for="lastName">Last Name:</label>
                        <input type="text" id="lastName" name="lastName" pattern="^[A-Za-z\s]{2,}$" title="At least 2 letters, spaces allowed, no numbers or special characters" required>
                    </div>
                </div>
                <div class="form-group">
                    <label for="gender">Gender:</label>
                    <select id="gender" name="gender" required>
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="birthday">Birthday:</label>
                    <input type="date" id="birthday" name="birthday" required>
                </div>
                <div class="form-actions">
                    <button type="button" id="cancel-btn" class="btn btn-danger">Cancel</button>
                    <button type="submit" id="save-btn" class="btn btn-primary">Save</button>
                </div>
            </form>
        </div>
    </div>
</div>
