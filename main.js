


//------------------------------------------------------------------------page initialization


const page = document.querySelector('.page');
const userPanel = document.getElementById('user-panel');
const footer = document.getElementById('footer');

const toggleButton = document.getElementById('toggle-btn'); 
const sidebar = document.getElementById('sidebar');


//------------------------------------------------------------------------page loading


loadHTML('./src/components/user_panel/user_panel.html', userPanel);
loadHTML('./src/components/footer/footer.html', footer);

loadPage('students_page');

//------------------------------------------------------------------------load code function

function loadHTML(url, element) {
    return fetch(url)
        .then(res => {
            if (!res.ok) {
                throw new Error(`Failed to load ${url}`);
            }
            return res.text();
        })
        .then(htmlSnippet => {
            element.innerHTML = htmlSnippet;
        })
        .catch(err => {
            console.error(err);
        });
}

function loadPage(pageName) {
    loadHTML(`./src/pages/${pageName}/${pageName}.html`, page)
        .then(() => {
            const script = document.createElement('script');
            script.src = `./src/pages/${pageName}/${pageName}.js`;
            script.onload = () => {
                if (typeof initPage === 'function') {
                    initPage();
                }
            };
            document.body.appendChild(script);
        });
}

//------------------------------------------------------------------------helper functions

function selectButton(button) {
    const listItems = document.querySelectorAll('#sidebar ul li');
    listItems.forEach(li => li.classList.remove('active'));
    const parentLi = button.closest('li');
    if (parentLi) {
        parentLi.classList.add('active');
    }
}

function toggleSidebar() {
    sidebar.classList.toggle('close');
    toggleButton.classList.toggle('rotate');
}

function unreadedMessagesAnimation() {
    const messagesIcon = document.getElementById('messages-button');
    const svg = messagesIcon.querySelector('svg');

    const originalSVGContent = svg.innerHTML;

    svg.innerHTML = `
        <path d="M440-440h80v-200h-80v200Zm40 120q17 0 28.5-11.5T520-360q0-17-11.5-28.5T480-400q-17 0-28.5 11.5T440-360q0 17 11.5 28.5T480-320ZM160-200v-80h80v-280q0-83 50-147.5T420-792v-28q0-25 17.5-42.5T480-880q25 0 42.5 17.5T540-820v28q80 20 130 84.5T720-560v280h80v80H160Zm320-300Zm0 420q-33 0-56.5-23.5T400-160h160q0 33-23.5 56.5T480-80ZM320-280h320v-280q0-66-47-113t-113-47q-66 0-113 47t-47 113v280Z"/>
 `;
    messagesIcon.classList.add('double-clicked');

    messagesIcon.addEventListener('animationend', function() {
        messagesIcon.classList.remove('double-clicked');
        svg.innerHTML = originalSVGContent;
    }, { once: true });
}

//------------------------------------------------------------------------dropdown menu

const avatarDropdownContainer = document.getElementById('avatar_dropdown');
const avatarDropdownList = avatarDropdownContainer.querySelector('.dropdown-list');

const messagesDropdownContainer = document.getElementById('messages_dropdown');
const messagesDropdownList = messagesDropdownContainer.querySelector('.dropdown-list');

function showDropdown(dropdownList) {
  dropdownList.classList.remove('closing');
  dropdownList.classList.add('show-dropdown');
}

function hideDropdown(dropdownList) {
  if (dropdownList.classList.contains('show-dropdown')) {
    
    dropdownList.classList.remove('show-dropdown');
    dropdownList.classList.add('close-dropdown');
   
    const handleTransitionEnd = () => {
      dropdownList.classList.remove('close-dropdown');
      dropdownList.removeEventListener('transitionend', handleTransitionEnd);
    };
    dropdownList.addEventListener('transitionend', handleTransitionEnd);
  }
}

avatarDropdownContainer.addEventListener('mouseenter', () => {
  showDropdown(avatarDropdownList);
  hideDropdown(messagesDropdownList);
});

messagesDropdownContainer.addEventListener('mouseenter', () => {
  showDropdown(messagesDropdownList);
  hideDropdown(avatarDropdownList);
});


document.addEventListener('click', (event) => {
  const isAvatarClick = avatarDropdownContainer.contains(event.target);
  const isMessagesClick = messagesDropdownContainer.contains(event.target);

 
  if (!isAvatarClick && !isMessagesClick) {
    hideDropdown(avatarDropdownList);
    hideDropdown(messagesDropdownList);
  }
});

//------------------------------------------------------------------------page navigation event listeners

document.getElementById("dashboard-nav").addEventListener('click', () => {
    loadPage('dashboard_page');
    selectButton(event.target);
});

document.getElementById("students-nav").addEventListener('click', () => {
    loadPage('students_page');
    selectButton(event.target);
});

document.getElementById("tasks-nav").addEventListener('click', () => {
    loadPage('tasks_page');
    selectButton(event.target);
});

document.getElementById("title-up").addEventListener('click', () => {
    loadPage('students_page');
    selectButton(event.target);
});

document.getElementById("messages-button").addEventListener('click', () => {
    loadPage('chat_page');
    selectButton(event.target);
    hideDropdown(messagesDropdownList);
});

document.getElementById("messages-button").addEventListener('dblclick', () => {
    unreadedMessagesAnimation();
});

document.getElementById("profile_btn").addEventListener('click', () => {
    loadPage('profile_page');
    selectButton(event.target);
});