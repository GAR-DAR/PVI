<div class="header">
  
    <div class="user-data">

        <div class="profile">


            @if (!empty($loginName))
            <div class="notifications">
                <div class="notificationsIcon">
                    <div class="plane-icon">
                        <svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="-6 -6 40 40">
                            <g transform="translate(12 12) rotate(-45) scale(1.7) translate(-12 -12)">
                                <path fill-rule="evenodd" d="M12 2a1 1 0 0 1 .932.638l7 18a1 1 0 0 1-1.326 1.281L13 19.517V13a1 1 0 1 0-2 0v6.517l-5.606 2.402a1 1 0 0 1-1.326-1.281l7-18A1 1 0 0 1 12 2Z" clip-rule="evenodd" />
                            </g>
                        </svg>
                    </div>

                    <div id="notification-circle" class="notification-circle"></div>
                </div>
                <div class="dropdown">

                </div>
            </div>
           
            @else
           
        </div>

        @if (request()->path() !== '/')
        <script>
            window.location.href = "/";

        </script>
        @endif

        @endif
    </div>
</div>
</div>
