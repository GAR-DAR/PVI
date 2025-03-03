const page = document.querySelector('.page');
const userPanel = document.getElementById('user-panel');
const footer = document.getElementById('footer');

const toggleButton = document.getElementById('toggle-btn'); 
const sidebar = document.getElementById('sidebar');

const homePage = document.getElementById('home-page');


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
            // Dynamically create and append the script
            const script = document.createElement('script');
            script.src = `./src/pages/${pageName}/${pageName}.js`;
            script.onload = () => {
                // If the loaded script defines initPage(), call it
                if (typeof initPage === 'function') {
                    initPage();
                }
            };
            document.body.appendChild(script);
        });
}

function selectButton(button) {
    const listItems = document.querySelectorAll('#sidebar ul li');
    listItems.forEach(li => li.classList.remove('active'));
    const parentLi = button.closest('li');
    if (parentLi) {
        parentLi.classList.add('active');
    }
}

function redirectToHomePage() {
    loadPage('students_page');
    selectButton(homePage);
}


function toggleSidebar() {
    sidebar.classList.toggle('close');
    toggleButton.classList.toggle('rotate');
}



loadHTML('./src/components/user_panel/user_panel.html', userPanel);
loadHTML('./src/components/footer/footer.html', footer);

loadPage('students_page');



const avatarDropdownContainer = document.getElementById('avatar_dropdown');
const avatarDropdownList = avatarDropdownContainer.querySelector('.dropdown-list');

const messagesDropdownContainer = document.getElementById('messages_dropdown');
const messagesDropdownList = messagesDropdownContainer.querySelector('.dropdown-list');

function showDropdown(dropdownList) {
  // If it's in "closing" state, remove that first
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