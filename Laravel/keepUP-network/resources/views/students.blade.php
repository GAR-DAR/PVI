<x-layout>
        <div class="students-div">
            <div style="display: flex; justify-content: space-between;">
                <h2>Students</h2>
                <button class="ico-button-on-light">
                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3">
                        <path d="M440-280h80v-160h160v-80H520v-160h-80v160H280v80h160v160Zm40 200q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z" />
                    </svg>
                </button>
            </div>


            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th class="hidden">ID</th>

                            <th scope="col">
                                <div class="custom-checkbox-container">
                                    <input type="checkbox" id="select-all-students" class="header-checkbox">
                                    <label for="select-all-students" class="custom-checkbox">
                                        <span class="visually-hidden">Select all students</span>
                                    </label>
                                </div>
                            </th>

                            <th scope="col">Group</th>
                            <th scope="col">Name</th>
                            <th scope="col">Gender</th>
                            <th scope="col">Birthday</th>
                            <th scope="col">Status</th>
                            <th scope="col">Options</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse($students as $student)
                        <tr>
                            <td class="hidden">{{ $student->id }}</td>
                            <td>
                                <div class="custom-checkbox-container">
                                    <input type="checkbox" id="student-{{ $student->id }}" class="student-checkbox">
                                    <label for="student-{{ $student->id }}" class="custom-checkbox">
                                        <span class="visually-hidden">Select student</span>
                                    </label>
                                </div>
                            </td>
                            <td>{{ $student->group_name }}</td>
                            <td>{{ $student->first_name }} {{ $student->last_name }}</td>
                            <td>{{ $student->gender ? $student->gender->name : 'Unknown' }}</td>
                            <td>{{ $student->birthday }}</td>
                             <td>
                                 <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="{{ $student->status && strtolower($student->status->name) == 'online' ? 'var(--green-clr)' : 'var(--grey-clr)' }}" role="img" aria-label="{{ $student->status ? $student->status->name : 'Unknown' }} status">
                                     <path d="M480-80q-82 0-155-31.5t-127.5-86Q143-252 111.5-325T80-480q0-83 31.5-155.5t86-127Q252-817 325-848.5T480-880q83 0 155.5 31.5t127 86q54.5 54.5 86 127T880-480q0 82-31.5 155t-86 127.5q-54.5 54.5-127 86T480-80Zm0-160q100 0 170-70t70-170q0-100-70-170t-170-70q-100 0-170 70t-70 170q0 100 70 170t170 70Z" />
                                 </svg>
                             </td>


                             <td>
                                 <div class="options">
                                     <button class="ico-button edit-btn" data-student-id="{{ $student->id }}" aria-label="Edit {{ $student->first_name }} {{ $student->last_name }}">
                                         <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="var(--text-clr)">
                                             <path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z" /></svg>
                                     </button>
                                     <button class="ico-button delete-btn" data-student-id="{{ $student->id }}" aria-label="Delete {{ $student->first_name }} {{ $student->last_name }}">
                                         <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="var(--alert-clr)">
                                             <path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z" /></svg>
                                     </button>
                                 </div>
                             </td>

                        </tr>
                        @empty
                        <tr>
                            <td colspan="8" class="text-center">No students found</td>
                        </tr>
                        @endforelse
                    </tbody>

                </table>
            </div>

            <div class="pagination">


                <button class="pagination-btn active">1</button>
                <button class="pagination-btn">2</button>
                <button class="pagination-btn">3</button>
                <div class="page-dots">...</div>
                <button class="pagination-btn">10</button>


            </div>

        </div>

        @include('modals.student-modal')
        @include('modals.delete-student-modal')

</x-layout>