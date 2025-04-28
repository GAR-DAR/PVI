<x-layout>
    <div class="profile-container">
        @if(isset($student))
        <!-- Profile View for a specific student -->
        <div class="profile-header">
            <h2>Student Profile</h2>
            <div class="profile-avatar-section">
                <div class="large-avatar-container">
                    <img src="{{ $student->avatar_path ? asset($student->avatar_path) : asset('images/user-sample.png') }}" alt="{{ $student->first_name }}'s avatar" class="large-avatar">

                    @if($student->role_id == 2)
                    <div class="moderator-badge large-badge" title="Moderator">
                        <svg xmlns="http://www.w3.org/2000/svg" height="18px" viewBox="0 -960 960 960" width="18px" fill="#9966ff">
                            <path d="m233-80 65-281L80-550l288-25 112-265 112 265 288 25-218 189 65 281-247-149-247 149Z" />
                        </svg>
                    </div>
                    @endif
                </div>
                <div class="profile-name">
                    <h3>{{ $student->first_name }} {{ $student->last_name }}</h3>
                    <div class="status-indicator-text">
                        <span class="status-dot {{ $student->status && strtolower($student->status->name) == 'online' ? 'online' : 'offline' }}"></span>
                        {{ $student->status ? $student->status->name : 'Unknown' }}
                    </div>
                </div>
            </div>
        </div>

        <div class="profile-info">
            <div class="info-card">
                <h4>Personal Information</h4>
                <div class="info-item">
                    <span class="info-label">Group:</span>
                    <span class="info-value">{{ $student->group_name }}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Gender:</span>
                    <span class="info-value">{{ $student->gender ? $student->gender->name : 'Not specified' }}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Birthday:</span>
                    <span class="info-value">{{ $student->birthday }}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Email:</span>
                    <span class="info-value">{{ $student->email }}</span>
                </div>
            </div>
        </div>

        <div class="profile-actions">
            <button class="btn secondary-btn" onclick="window.location.href='{{ route('students.index') }}'">
                Back to Students
            </button>
        </div>

        @else
        <!-- Default profile view if no specific student is provided -->
        <div class="profile-header">
            <h2>My Profile</h2>
            @php
            $currentUser = Auth::user();
            $currentStudent = \App\Models\Students::where('email', $currentUser->email)->first();
            @endphp

            @if($currentStudent)
            <div class="profile-avatar-section">
                <div class="large-avatar-container">
                    <img src="{{ $currentStudent->avatar_path ? asset($currentStudent->avatar_path) : asset('images/user-sample.png') }}" alt="Your avatar" class="large-avatar">

                    @if($currentStudent->role_id == 2)
                    <div class="moderator-badge large-badge" title="Moderator">
                        <svg xmlns="http://www.w3.org/2000/svg" height="18px" viewBox="0 -960 960 960" width="18px" fill="#9966ff">
                            <path d="m233-80 65-281L80-550l288-25 112-265 112 265 288 25-218 189 65 281-247-149-247 149Z" />
                        </svg>
                    </div>
                    @endif
                </div>
                <div class="profile-name">
                    <h3>{{ $currentStudent->first_name }} {{ $currentStudent->last_name }}</h3>
                    <div class="status-indicator-text">
                        <span class="status-dot {{ $currentStudent->status && strtolower($currentStudent->status->name) == 'online' ? 'online' : 'offline' }}"></span>
                        {{ $currentStudent->status ? $currentStudent->status->name : 'Unknown' }}
                    </div>
                </div>
            </div>
            @endif
        </div>
        @endif
    </div>

</x-layout>
