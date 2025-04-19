<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>keepUP</title>

    @vite('resources/css/app.css')
</head>


<body>
    <header>
        <div id="user-panel" class="user-panel">
            <div class="user-panel-title">
                <h3 id="title-up" style="margin-left: 10px; cursor: pointer;">KeepUP</h3>
            </div>

            <div class="user-panel-buttons">
                <div class="dropdown" id="messages_dropdown">
                    <button id="messages-button" class="ico-button">
                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3">
                            <path d="M160-200v-80h80v-280q0-83 50-147.5T420-792v-28q0-25 17.5-42.5T480-880q25 0 42.5 17.5T540-820v28q80 20 130 84.5T720-560v280h80v80H160Zm320-300Zm0 420q-33 0-56.5-23.5T400-160h160q0 33-23.5 56.5T480-80ZM320-280h320v-280q0-66-47-113t-113-47q-66 0-113 47t-47 113v280Z" />
                        </svg>
                    </button>

                    <div class="dropdown-list" id="messages-list">
                        <div class="message-item">
                            <div class="avatar-container">
                                <img src="{{ asset('images/user-sample.png') }}" alt="User Icon" class="avatar">

                                <div class="status-indicator online"></div>
                            </div>
                            <div class="message-div">
                                <div class="author-name">Iryna Hrabovenska</div>
                                <div class="message-row">
                                    <div class="message-text">Can't hide it, I love your new design!</div>
                                    <div class="message-time">13:30</div>
                                </div>
                            </div>
                        </div>

                        <div class="message-item">
                            <div class="avatar-container">
                                <img src="{{ asset('images/user-sample.png') }}" alt="User Icon" class="avatar">

                                <div class="status-indicator offline"></div>
                            </div>
                            <div class="message-div unread">
                                <div class="author-name">Marichka Lytvin</div>
                                <div class="message-row">
                                    <div class="message-text">What's up?</div>
                                    <div class="message-time">12:15</div>
                                </div>
                            </div>
                        </div>

                        <div class="message-item">
                            <div class="avatar-container">
                                <img src="{{ asset('images/user-sample.png') }}" alt="User Icon" class="avatar">

                                <div class="status-indicator online"></div>
                            </div>
                            <div class="message-div">
                                <div class="author-name">Marta Zastrizhna</div>
                                <div class="message-row">
                                    <div class="message-text">He know everything, RUN!</div>
                                    <div class="message-time">10:45</div>
                                </div>
                            </div>
                        </div>


                    </div>

                </div>

                <p class="user-panel-title">GARDAR</p>

                <div class="dropdown" id="avatar_dropdown">

                    <button id="profile_btn" class="avatar-button">
                        <img src="{{ asset('images/user-sample.png') }}" alt="User Icon" class="avatar">
                    </button>

                    <div class="dropdown-list">
                        <a href="#" class="dropdown-link" onclick="selectButton(this);">
                            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3">
                                <path d="M480-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47ZM160-160v-112q0-34 17.5-62.5T224-378q62-31 126-46.5T480-440q66 0 130 15.5T736-378q29 15 46.5 43.5T800-272v112H160Zm80-80h480v-32q0-11-5.5-20T700-306q-54-27-109-40.5T480-360q-56 0-111 13.5T260-306q-9 5-14.5 14t-5.5 20v32Zm240-320q33 0 56.5-23.5T560-640q0-33-23.5-56.5T480-720q-33 0-56.5 23.5T400-640q0 33 23.5 56.5T480-560Zm0-80Zm0 400Z" />
                            </svg>
                            <span>Profile</span>
                        </a>
                        <a href="#" class="dropdown-link">

                            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3">
                                <path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h280v80H200v560h280v80H200Zm440-160-55-58 102-102H360v-80h327L585-622l55-58 200 200-200 200Z" />
                            </svg>
                            <span>Logout</span>
                        </a>
                    </div>

                </div>


            </div>

        </div>
    </header>

    <nav id="sidebar" class="close">
        <ul>
            <li>
                <button id="toggle-btn" aria-label="Toggle sidebar" aria-expanded="true">
                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="var(--text-clr)">
                        <path d="M383-480 200-664l56-56 240 240-240 240-56-56 183-184Zm264 0L464-664l56-56 240 240-240 240-56-56 183-184Z" />
                    </svg>
                </button>
            </li>
            <li>
                <a id="dashboard-nav">
                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="var(--text-clr)">
                        <path d="M520-600v-240h320v240H520ZM120-440v-400h320v400H120Zm400 320v-400h320v400H520Zm-400 0v-240h320v240H120Zm80-400h160v-240H200v240Zm400 320h160v-240H600v240Zm0-480h160v-80H600v80ZM200-200h160v-80H200v80Zm160-320Zm240-160Zm0 240ZM360-280Z" />
                    </svg>
                    <span>Dashboard</span>
                </a>
            </li>
            <li class="active">
                <a id="students-nav">
                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="var(--text-clr)">
                        <path d="M40-160v-112q0-34 17.5-62.5T104-378q62-31 126-46.5T360-440q66 0 130 15.5T616-378q29 15 46.5 43.5T680-272v112H40Zm720 0v-120q0-44-24.5-84.5T666-434q51 6 96 20.5t84 35.5q36 20 55 44.5t19 53.5v120H760ZM360-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47Zm400-160q0 66-47 113t-113 47q-11 0-28-2.5t-28-5.5q27-32 41.5-71t14.5-81q0-42-14.5-81T544-792q14-5 28-6.5t28-1.5q66 0 113 47t47 113ZM120-240h480v-32q0-11-5.5-20T580-306q-54-27-109-40.5T360-360q-56 0-111 13.5T140-306q-9 5-14.5 14t-5.5 20v32Zm240-320q33 0 56.5-23.5T440-640q0-33-23.5-56.5T360-720q-33 0-56.5 23.5T280-640q0 33 23.5 56.5T360-560Zm0 320Zm0-400Z" />
                    </svg>
                    <span>Students</span>
                </a>
            </li>
            <li>
                <a id="tasks-nav">
                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="var(--text-clr)">
                        <path d="M480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q65 0 123 19t107 53l-58 59q-38-24-81-37.5T480-800q-133 0-226.5 93.5T160-480q0 133 93.5 226.5T480-160q133 0 226.5-93.5T800-480q0-18-2-36t-6-35l65-65q11 32 17 66t6 70q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm-56-216L254-466l56-56 114 114 400-401 56 56-456 457Z" />
                    </svg>
                    <span>Tasks</span>
                </a>
            </li>
        </ul>
    </nav>

    <main class="main-content">
        {{ $slot }}
    </main>

    <footer>
        <div id="footer" class="footer">
            <p>
                &copy; 2025 LabApp. All rights reserved. Created by Ira Hrabovenska. Stealing is a bad idea—accidents happen.
            </p>
        </div>
    </footer>

    <div class="decorative-bottom"></div>



    @vite([

    'resources/js/main.js',
    'resources/js/students/students.js',
    'resources/js/students/validation.js'
    
    ])


</body>

</html>

