<x-layout :login-name="$loginName">

    
    <!--<x-header :login-name="$loginName"></x-header>

    <x-side-panel :login-name="$loginName"> </x-side-panel>-->


    <div class="main-content">
        <div class="chat-container">
            <div class="chat-list">
                <h3>Your Chats</h3>
                <button id="create-new-chat-btn">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">
                        <path d="M12 4a1 1 0 0 1 1 1v6h6a1 1 0 1 1 0 2h-6v6a1 1 0 1 1-2 0v-6H5a1 1 0 1 1 0-2h6V5a1 1 0 0 1 1-1z" />
                    </svg>
                    Create New Chat
                </button>
                <div id="chats-list">
                    <!-- Chat list will be populated by JavaScript -->
                </div>
            </div>

            <div class="chat-window">
                <div class="chat-header">
                    <div class="chat-title">
                        <h3 id="current-chat-name">Select a Chat</h3>
                        <div id="chat-participants" class="chat-participants"></div>
                    </div>
                    <button id="add-participant-btn" class="ico-button">
                        <svg class="w-6 h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                            <path fill-rule="evenodd" d="M9 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm-2 9a4 4 0 0 0-4 4v1a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-1a4 4 0 0 0-4-4H7Zm8-1a1 1 0 0 1 1-1h1v-1a1 1 0 1 1 2 0v1h1a1 1 0 1 1 0 2h-1v1a1 1 0 1 1-2 0v-1h-1a1 1 0 0 1-1-1Z" clip-rule="evenodd" />
                        </svg>
                    </button>
                </div>

                <div class="messages-history" id="messages-history">
                    <!-- Messages will be populated by JavaScript -->
                </div>

               <div class="message-input">
                   <button id="attachment-btn" class="attachment-button">
                       <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                           <path d="M21.586 10.461l-10.05 10.075c-1.95 1.949-5.122 1.949-7.071 0s-1.95-5.122 0-7.072l10.628-10.585a3.976 3.976 0 0 1 5.657 0 4.01 4.01 0 0 1 0 5.657l-8.484 8.505a1.99 1.99 0 0 1-2.828 0 1.99 1.99 0 0 1 0-2.829l7.778-7.778a1 1 0 0 0-1.414-1.414l-7.778 7.778a3.99 3.99 0 0 0 0 5.657 3.99 3.99 0 0 0 5.657 0l8.484-8.505a6.01 6.01 0 0 0 0-8.485 5.976 5.976 0 0 0-8.485 0L3.515 17.015a8.025 8.025 0 0 0 11.314 11.314L24.929 18.2a1 1 0 0 0-1.414-1.414l-10.05 10.075a6.026 6.026 0 0 1-8.486 0 6.026 6.026 0 0 1 0-8.486l10.05-10.075a4.025 4.025 0 0 1 5.657 0 4.025 4.025 0 0 1 0 5.657L7.343 17.343a2.025 2.025 0 0 1-2.829 0 2.025 2.025 0 0 1 0-2.829l1.768-1.768a1 1 0 0 0-1.414-1.414l-1.768 1.768a4.025 4.025 0 0 0 0 5.657 4.025 4.025 0 0 0 5.657 0l9.9-9.9a6.025 6.025 0 0 0 0-8.486 6.025 6.025 0 0 0-8.486 0l-9.9 9.9a8.025 8.025 0 0 0 0 11.314a8.025 8.025 0 0 0 11.314 0l9.9-9.9a1 1 0 0 0-1.414-1.414l-9.9 9.9a6.025 6.025 0 0 1-8.486 0 6.025 6.025 0 0 1 0-8.486l9.9-9.9a4.025 4.025 0 0 1 5.657 0 4.025 4.025 0 0 1 0 5.657l-9.9 9.9a2.025 2.025 0 0 1-2.829 0 2.025 2.025 0 0 1 0-2.829l8.486-8.485a1 1 0 0 0-1.414-1.414l-8.486 8.485a4.025 4.025 0 0 0 0 5.657a4.025 4.025 0 0 0 5.657 0l9.9-9.9a6.025 6.025 0 0 0 0-8.486z" />
                       </svg>
                   </button>
                   <input type="file" id="file-input" style="display:none">
                   <input type="text" id="message-input" placeholder="Type your message...">
                   <button id="send-message-btn">
                       Send
                       <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                           <line x1="22" y1="2" x2="11" y2="13"></line>
                           <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                       </svg>
                   </button>
               </div>

            </div>
        </div>
    </div>

    <!-- Create Chat Modal -->
    <div id="create-chat-modal" class="modal-overlay" style="display: none;">
        <div class="modal-container">
            <div class="modal-header">
                <h2>Create New Chat</h2>
            </div>
            <div class="modal-body">
                <div id="available-students">
                    <p>Loading students...</p>
                </div>
                <div class="form-group">
                    <label for="new-chat-name-input">Group Chat Name (optional):</label>
                    <input type="text" id="new-chat-name-input" placeholder="Enter a name for the group chat">
                </div>
                <div class="form-actions">
                    <button id="cancel-create-chat-btn" class="btn btn-secondary">Cancel</button>
                    <button id="confirm-create-chat-btn" class="btn btn-primary">Create Chat</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Add Participant Modal -->
    <div id="add-participant-modal" class="modal-overlay" style="display: none;">
        <div class="modal-container">
            <div class="modal-header">
                <h2>Add Participants to Chat</h2>
            </div>
            <div class="modal-body">
                <div id="available-participants-for-add">
                    <p>Loading participants...</p>
                </div>
                <div class="form-actions">
                    <button id="cancel-add-participants-btn" class="btn btn-secondary">Cancel</button>
                    <button id="confirm-add-participants-btn" class="btn btn-primary">Add Participants</button>
                </div>
            </div>
        </div>
    </div>

  


    @vite(['resources/js/app.js', 'resources/css/chat.css'])
</x-layout>
