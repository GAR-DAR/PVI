// students_page.js

//------------------- Sample data -------------------------
const students = [
  {
    id: 1,
    group: 'PZ-25',
    name: 'Hrabovenska Iryna',
    gender: 'Female',
    birthday: '13/08/2006',
    status: 'online'
  },
  {
    id: 2,
    group: 'PZ-25',
    name: 'Lytvin Marichka',
    gender: 'Female',
    birthday: '12/02/1950',
    status: 'offline'
  },
  {
    id: 3,
    group: 'PZ-26',
    name: 'Baba Marta Zastrizhna',
    gender: 'Female',
    birthday: '12/02/1750',
    status: 'offline'
  },
];

//------------------- Table generation -------------------------
function generateTableRows(studentsArray) {
  // Updated selector to match the .students-div class and its table
  const tbody = document.querySelector('.students-div table tbody');
  if (!tbody) return;

  tbody.innerHTML = ''; // Clear any existing rows

  studentsArray.forEach(student => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td class="hidden">${student.id}</td>
      <td><input type="checkbox"></td>
      <td>${student.group}</td>
      <td>${student.name}</td>
      <td>${student.gender}</td>
      <td>${student.birthday}</td>
      <td>
        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="var(--green-clr)"><path d="M480-80q-82 0-155-31.5t-127.5-86Q143-252 111.5-325T80-480q0-83 31.5-155.5t86-127Q252-817 325-848.5T480-880q83 0 155.5 31.5t127 86q54.5 54.5 86 127T880-480q0 82-31.5 155t-86 127.5q-54.5 54.5-127 86T480-80Zm0-160q100 0 170-70t70-170q0-100-70-170t-170-70q-100 0-170 70t-70 170q0 100 70 170t170 70Z"/></svg>
      </td>
      <td>
        <div class="options">
          <button class="ico-button">
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="var(--text-clr)"><path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z"/></svg>
          </button>
          <button class="ico-button">
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="var(--alert-clr)"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/></svg>
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(row);
  });
}

//------------------- Initialization -------------------------
function initPage() {
  generateTableRows(students);
}