<x-layout>
    @if(count($students) > 0)
    <div class="students-list">
        <h2>Students List</h2>
        <ul>
            @foreach($students as $student)
            <li>
                {{ $student->first_name }} {{ $student->last_name }} - {{ $student->email }}
            </li>
            @endforeach
        </ul>
    </div>
    @else
    <p>No students found</p>
    @endif
</x-layout>
