import { useRef, useState } from "react";
import {
  Phone,
  Video,
  UserRound,
  MoreVertical,
  FileText,
  Image,
  Camera,
  Music,
  Search,
  Paperclip,
  Send,
  X,
  FolderOpen,
  BellOff,
  Ban,
  Check,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import "./Messages.css";

function Messages() {
  // =============================
  // CHAT DATA
  // =============================

  const [currentChat] = useState({
    name: "Arun Kumar",
    initials: "A",
    teach: "Python",
    learn: "UI/UX Design",
    online: true,
  });

  const navigate = useNavigate();

  // =============================
  // MESSAGES
  // =============================

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "other",
      text: "Hi! I saw that you want to learn UI/UX Design.",
      time: "10:30 AM",
    },
    {
      id: 2,
      sender: "me",
      text: "Yes! I can teach you Python in exchange.",
      time: "10:32 AM",
    },
    {
      id: 3,
      sender: "other",
      text: "That sounds great!",
      time: "10:35 AM",
    },
    {
      id: 4,
      sender: "me",
      text: "Perfect. We can schedule the session.",
      time: "10:42 AM",
    },
  ]);

  // =============================
  // BASIC STATES
  // =============================

  const [message, setMessage] = useState("");

  const [showAttachmentMenu, setShowAttachmentMenu] =
    useState(false);

  const [showProfile, setShowProfile] =
    useState(false);

  const [showMoreMenu, setShowMoreMenu] =
    useState(false);

  const [selectedFile, setSelectedFile] =
    useState(null);

  

  // =============================
  // NEW MENU STATES
  // =============================

  const [showChatSearch, setShowChatSearch] =
    useState(false);

  const [searchQuery, setSearchQuery] =
    useState("");

  const [showSharedFiles, setShowSharedFiles] =
    useState(false);

  const [isMuted, setIsMuted] =
    useState(false);

  const [isBlocked, setIsBlocked] =
    useState(false);

  // =============================
  // FILE INPUT REFERENCES
  // =============================

  const documentInputRef = useRef(null);
  const mediaInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const audioInputRef = useRef(null);

  // =============================
  // SEND MESSAGE
  // =============================

  const handleSendMessage = (e) => {
    e.preventDefault();

    // Do not allow message if user is blocked
    if (isBlocked) {
      alert(`You have blocked ${currentChat.name}.`);
      return;
    }

    if (!message.trim() && !selectedFile) {
      return;
    }

    const newMessage = {
      id: Date.now(),
      sender: "me",
      text: message.trim(),

      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),

      file: selectedFile
        ? {
            name: selectedFile.name,
            type: selectedFile.type,
            size: selectedFile.size,
          }
        : null,
    };

    setMessages((prev) => [
      ...prev,
      newMessage,
    ]);

    setMessage("");
    setSelectedFile(null);
  };

  // =============================
  // FILE SELECT
  // =============================

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setSelectedFile(file);

    setShowAttachmentMenu(false);

    // Reset input
    e.target.value = "";
  };

  // =============================
  // FILE PICKERS
  // =============================

  const openDocumentPicker = () => {
    documentInputRef.current?.click();
  };

  const openMediaPicker = () => {
    mediaInputRef.current?.click();
  };

  const openCamera = () => {
    cameraInputRef.current?.click();
  };

  const openAudioPicker = () => {
    audioInputRef.current?.click();
  };

  // =============================
  // ATTACHMENT MENU
  // =============================

  const toggleAttachmentMenu = () => {
    setShowAttachmentMenu((prev) => !prev);

    setShowMoreMenu(false);
    setShowProfile(false);
    setShowChatSearch(false);
    setShowSharedFiles(false);
  };

  // =============================
  // PROFILE
  // =============================

  const toggleProfile = () => {
    setShowProfile((prev) => !prev);

    setShowMoreMenu(false);
    setShowAttachmentMenu(false);
    setShowChatSearch(false);
    setShowSharedFiles(false);
  };

  // =============================
  // MORE MENU
  // =============================

  const toggleMoreMenu = () => {
    setShowMoreMenu((prev) => !prev);

    setShowProfile(false);
    setShowAttachmentMenu(false);
  };
  // -----------------------------
// TOGGLE SHARED FILES
// -----------------------------
const toggleSharedFiles = () => {
  setShowSharedFiles((prev) => !prev);

  setShowMoreMenu(false);
  setShowProfile(false);
  setShowAttachmentMenu(false);
};

  // =============================
  // SEARCH IN CHAT
  // =============================

  const handleSearchChat = () => {
    setShowMoreMenu(false);

    setShowSharedFiles(false);

    setShowChatSearch(true);

    setSearchQuery("");
  };

  // =============================
  // CLOSE SEARCH
  // =============================

  const closeChatSearch = () => {
    setSearchQuery("");

    setShowChatSearch(false);
  };

  // =============================
  // SHARED FILES
  // =============================

  const sharedFiles = messages.filter(
    (msg) => msg.file
  );

  // =============================
  // CLOSE SHARED FILES
  // =============================

  const closeSharedFiles = () => {
    setShowSharedFiles(false);
  };

  // =============================
  // MUTE NOTIFICATIONS
  // =============================

  const handleMuteNotifications = () => {
    setIsMuted((previous) => !previous);

    setShowMoreMenu(false);
  };

  // =============================
  // BLOCK USER
  // =============================

  const handleBlockUser = () => {
    const confirmed = window.confirm(
      `Are you sure you want to block ${currentChat.name}?`
    );

    if (!confirmed) return;

    setIsBlocked(true);

    setShowMoreMenu(false);
  };

  // =============================
  // FORMAT FILE SIZE
  // =============================

  const formatFileSize = (bytes) => {
    if (!bytes) return "";

    if (bytes < 1024) {
      return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // =============================
  // FILE ICON
  // =============================

  const getFileIcon = (type) => {
    if (type?.startsWith("image/")) {
      return <Image size={20} />;
    }

    if (type?.startsWith("audio/")) {
      return <Music size={20} />;
    }

    if (type?.startsWith("video/")) {
      return <Video size={20} />;
    }

    return <FileText size={20} />;
  };

  // =============================
  // FILTER SEARCH RESULTS
  // =============================

  const filteredMessages = messages.filter(
    (msg) => {
      if (!searchQuery.trim()) {
        return true;
      }

      return msg.text
        ?.toLowerCase()
        .includes(
          searchQuery.toLowerCase()
        );
    }
  );

  // =============================
  // RETURN
  // =============================

  return (
    <div className="messages-page">
      <div className="messages-back-button">
  <button
    type="button"
    onClick={() => navigate("/dashboard")}
    title="Back to Dashboard"
  >
    ← Back to Dashboard
  </button>
</div>

      <div className="messages-container">

        {/* =====================================
            CHAT HEADER
        ===================================== */}

        <div className="chat-header">

          {/* USER INFORMATION */}

          <div className="chat-user-info">

            <div className="chat-avatar">
              {currentChat.initials}
            </div>

            <div className="chat-user-details">

              <h2>
                {currentChat.name}
              </h2>

              <p>
                {currentChat.teach}
                {" ↔ "}
                {currentChat.learn}
              </p>

              <span
                className={
                  currentChat.online
                    ? "online-status"
                    : "offline-status"
                }
              >

                <span className="status-dot"></span>

                {currentChat.online
                  ? "Online"
                  : "Offline"}

              </span>

            </div>

          </div>

          {/* HEADER ACTIONS */}

          <div className="chat-actions">

            {/* VOICE CALL */}

            <button
              type="button"
              title="Voice call"
              onClick={() =>
                navigate("/voice-call")
              }
            >
              <Phone
                size={19}
                strokeWidth={1.8}
              />
            </button>

            {/* VIDEO CALL */}

            <button
              type="button"
              title="Video call"
              onClick={() =>
                navigate("/video-call")
              }
            >
              <Video
                size={19}
                strokeWidth={1.8}
              />
            </button>

            {/* PROFILE */}

            <button
              type="button"
              title="View profile"
              onClick={toggleProfile}
            >
              <UserRound
                size={19}
                strokeWidth={1.8}
              />
            </button>

            {/* MORE */}

            <button
              type="button"
              title="More options"
              onClick={toggleMoreMenu}
            >
              <MoreVertical
                size={20}
                strokeWidth={1.8}
              />
            </button>

          </div>

        </div>

        {/* =====================================
            BLOCKED MESSAGE
        ===================================== */}

        {isBlocked && (
          <div className="blocked-user-banner">

            <Ban size={16} />

            <span>
              You have blocked {currentChat.name}.
            </span>

          </div>
        )}

        {/* =====================================
            PROFILE POPUP
        ===================================== */}

        {showProfile && (
          <div className="profile-popup">

            <div className="profile-popup-header">

              <div className="profile-popup-avatar">
                {currentChat.initials}
              </div>

              <div className="profile-popup-user">

                <h3>
                  {currentChat.name}
                </h3>

                <p>
                  Skill Exchange Partner
                </p>

              </div>

              <button
                type="button"
                onClick={() =>
                  setShowProfile(false)
                }
              >
                <X size={17} />
              </button>

            </div>

            <div className="profile-popup-section">

              <span>
                TEACHES
              </span>

              <strong>
                {currentChat.teach}
              </strong>

            </div>

            <div className="profile-popup-section">

              <span>
                WANTS TO LEARN
              </span>

              <strong>
                {currentChat.learn}
              </strong>

            </div>

            <div className="profile-popup-section">

              <span>
                SKILL EXCHANGE
              </span>

              <strong>
                {currentChat.teach}
                {" ↔ "}
                {currentChat.learn}
              </strong>

            </div>

            <button
              className="view-full-profile"
              type="button"
              onClick={() =>
                alert(
                  "Profile page will open here."
                )
              }
            >
              View Full Profile
            </button>

          </div>
        )}

        {/* =====================================
            MORE MENU
        ===================================== */}

        {showMoreMenu && (
          <div className="more-menu">

            {/* SEARCH */}

            <button
              type="button"
              onClick={handleSearchChat}
            >
              <Search size={17} />

              <span>
                Search in Chat
              </span>

            </button>

            {/* SHARED FILES */}

            <button
  type="button"
  onClick={toggleSharedFiles}
>
  <FolderOpen size={17} />
  <span>Shared Files</span>
</button>

            {/* MUTE */}

            <button
              type="button"
              onClick={
                handleMuteNotifications
              }
            >
              <BellOff size={17} />

              <span>
                {isMuted
                  ? "Unmute Notifications"
                  : "Mute Notifications"}
              </span>

            </button>

            <div className="menu-divider"></div>

            {/* BLOCK */}

            <button
              type="button"
              className="danger-menu-item"
              onClick={handleBlockUser}
            >
              <Ban size={17} />

              <span>
                {isBlocked
                  ? "User Blocked"
                  : "Block User"}
              </span>

            </button>

          </div>
        )}

        {/* =====================================
            SEARCH BAR
        ===================================== */}

        {showChatSearch && (
          <div className="chat-search-bar">

            <Search size={18} />

            <input
              type="text"
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) =>
                setSearchQuery(
                  e.target.value
                )
              }
              autoFocus
            />

            <button
              type="button"
              onClick={closeChatSearch}
              title="Close search"
            >
              <X size={17} />
            </button>

          </div>
        )}

        {/* =====================================
            SHARED FILES PANEL
        ===================================== */}

        {showSharedFiles && (
          <div className="shared-files-panel">

            <div className="shared-files-header">

              <div>

                <span className="shared-files-label">
                  SHARED FILES
                </span>

                <h3>
                  Files shared with{" "}
                  {currentChat.name}
                </h3>

              </div>

              <button
                type="button"
                onClick={closeSharedFiles}
                title="Close"
              >
                <X size={18} />
              </button>

            </div>

            {sharedFiles.length > 0 ? (

              <div className="shared-files-list">

                {sharedFiles.map((msg) => (

                  <div
                    className="shared-file-item"
                    key={msg.id}
                  >

                    <div className="shared-file-icon">
                      {getFileIcon(
                        msg.file.type
                      )}
                    </div>

                    <div className="shared-file-info">

                      <strong>
                        {msg.file.name}
                      </strong>

                      <span>
                        {formatFileSize(
                          msg.file.size
                        )}
                      </span>

                    </div>

                    <span className="shared-file-time">
                      {msg.time}
                    </span>

                  </div>

                ))}

              </div>

            ) : (

              <div className="no-shared-files">

                <FolderOpen size={30} />

                <h4>
                  No shared files
                </h4>

                <p>
                  Files shared in this chat
                  will appear here.
                </p>

              </div>

            )}

          </div>
        )}
        {/* =====================================
    SHARED FILES POPUP
===================================== */}

{showSharedFiles && (
  <div className="shared-files-popup">

    <div className="shared-files-header">

      <div>
        <p className="shared-files-label">
          SHARED FILES
        </p>

        <h3>
          Files shared with {currentChat.name}
        </h3>
      </div>

      <button
        type="button"
        onClick={() => setShowSharedFiles(false)}
        className="shared-files-close"
        title="Close"
      >
        <X size={18} />
      </button>

    </div>

    <div className="shared-files-list">

      {messages.filter((msg) => msg.file).length > 0 ? (

        messages
          .filter((msg) => msg.file)
          .map((msg) => (

            <div
              className="shared-file-item"
              key={msg.id}
            >

              <div className="shared-file-icon">
                {getFileIcon(msg.file.type)}
              </div>

              <div className="shared-file-info">

                <strong>
                  {msg.file.name}
                </strong>

                <span>
                  {formatFileSize(msg.file.size)}
                </span>

                <small>
                  {msg.time}
                </small>

              </div>

            </div>

          ))

      ) : (

        <div className="no-shared-files">

          <FolderOpen size={32} />

          <h4>
            No shared files
          </h4>

          <p>
            Files shared in this chat will appear here.
          </p>

        </div>

      )}

    </div>

  </div>
)}
        {/* =====================================
            CHAT BODY
        ===================================== */}

        <div className="chat-body">

          {/* DATE */}

          <div className="date-divider">
            <span>
              Today
            </span>
          </div>

          {/* NO SEARCH RESULTS */}

          {showChatSearch &&
            searchQuery.trim() &&
            filteredMessages.length === 0 && (
              <div className="no-search-results">

                <Search size={30} />

                <h3>
                  No messages found
                </h3>

                <p>
                  No messages match "
                  {searchQuery}"
                </p>

              </div>
            )}

          {/* MESSAGES */}

          {filteredMessages.map(
            (msg) => (

              <div
                key={msg.id}
                className={`message-row ${
                  msg.sender === "me"
                    ? "message-row-me"
                    : "message-row-other"
                }`}
              >

                {/* OTHER USER AVATAR */}

                {msg.sender === "other" && (
                  <div className="message-avatar">
                    {currentChat.initials}
                  </div>
                )}

                <div className="message-content">

                  {/* TEXT MESSAGE */}

                  {msg.text && (
                    <div
                      className={`message-bubble ${
                        msg.sender === "me"
                          ? "message-bubble-me"
                          : "message-bubble-other"
                      }`}
                    >
                      {msg.text}
                    </div>
                  )}

                  {/* ATTACHED FILE */}

                  {msg.file && (
                    <div
                      className={`message-file ${
                        msg.sender === "me"
                          ? "message-file-me"
                          : "message-file-other"
                      }`}
                    >

                      <div className="message-file-icon">
                        {getFileIcon(
                          msg.file.type
                        )}
                      </div>

                      <div className="message-file-info">

                        <strong>
                          {msg.file.name}
                        </strong>

                        <span>
                          {formatFileSize(
                            msg.file.size
                          )}
                        </span>

                      </div>

                      <Check
                        size={15}
                        className="file-check"
                      />

                    </div>
                  )}

                  {/* MESSAGE TIME */}

                  <div
                    className={`message-meta ${
                      msg.sender === "me"
                        ? "message-meta-me"
                        : ""
                    }`}
                  >

                    {msg.time}

                    {msg.sender === "me" && (
                      <Check
                        size={13}
                        strokeWidth={2}
                      />
                    )}

                  </div>

                </div>

              </div>

            )
          )}

        </div>

        {/* =====================================
            SELECTED FILE PREVIEW
        ===================================== */}

        {selectedFile && (
          <div className="selected-file-container">

            <div className="selected-file-icon">
              {getFileIcon(
                selectedFile.type
              )}
            </div>

            <div className="selected-file-info">

              <strong>
                {selectedFile.name}
              </strong>

              <span>
                {formatFileSize(
                  selectedFile.size
                )}
              </span>

            </div>

            <button
              type="button"
              onClick={() =>
                setSelectedFile(null)
              }
              title="Remove attachment"
            >
              <X size={17} />
            </button>

          </div>
        )}

        {/* =====================================
            ATTACHMENT MENU
        ===================================== */}

        {showAttachmentMenu && (
          <div className="attachment-menu">

            {/* DOCUMENT */}

            <button
              type="button"
              onClick={
                openDocumentPicker
              }
            >

              <span className="attachment-menu-icon document-icon">

                <FileText
                  size={21}
                  strokeWidth={1.8}
                />

              </span>

              <span className="attachment-menu-text">

                <strong>
                  Document
                </strong>

                <small>
                  PDF, DOC, TXT...
                </small>

              </span>

            </button>

            {/* PHOTOS & VIDEOS */}

            <button
              type="button"
              onClick={
                openMediaPicker
              }
            >

              <span className="attachment-menu-icon photo-icon">

                <Image
                  size={21}
                  strokeWidth={1.8}
                />

              </span>

              <span className="attachment-menu-text">

                <strong>
                  Photos & videos
                </strong>

                <small>
                  Images and videos
                </small>

              </span>

            </button>

            {/* CAMERA */}

            <button
              type="button"
              onClick={openCamera}
            >

              <span className="attachment-menu-icon camera-icon">

                <Camera
                  size={21}
                  strokeWidth={1.8}
                />

              </span>

              <span className="attachment-menu-text">

                <strong>
                  Camera
                </strong>

                <small>
                  Take a photo
                </small>

              </span>

            </button>

            {/* AUDIO */}

            <button
              type="button"
              onClick={openAudioPicker}
            >

              <span className="attachment-menu-icon audio-icon">

                <Music
                  size={21}
                  strokeWidth={1.8}
                />

              </span>

              <span className="attachment-menu-text">

                <strong>
                  Audio
                </strong>

                <small>
                  Audio files
                </small>

              </span>

            </button>

          </div>
        )}

        {/* =====================================
            MESSAGE INPUT
        ===================================== */}

        <form
          className="message-input-area"
          onSubmit={handleSendMessage}
        >

          {/* ATTACH */}

          <button
            type="button"
            className="attachment-button"
            title="Attach file"
            onClick={toggleAttachmentMenu}
            disabled={isBlocked}
          >

            {showAttachmentMenu ? (
              <X
                size={19}
                strokeWidth={1.8}
              />
            ) : (
              <Paperclip
                size={19}
                strokeWidth={1.8}
              />
            )}

          </button>

          {/* INPUT */}

          <input
            type="text"
            placeholder={
              isBlocked
                ? "User is blocked"
                : "Type a message..."
            }
            value={message}
            onChange={(e) =>
              setMessage(
                e.target.value
              )
            }
            disabled={isBlocked}
          />

          {/* SEND */}

          <button
            type="submit"
            className="send-button"
            disabled={
              isBlocked ||
              (!message.trim() &&
                !selectedFile)
            }
            title="Send message"
          >

            <Send
              size={17}
              strokeWidth={2}
            />

          </button>

        </form>

        {/* =====================================
            HIDDEN FILE INPUTS
        ===================================== */}

        {/* DOCUMENT */}

        <input
          ref={documentInputRef}
          type="file"
          className="hidden-file-input"
          accept=".pdf,.doc,.docx,.txt,.ppt,.pptx,.xls,.xlsx"
          onChange={handleFileSelect}
        />

        {/* PHOTOS & VIDEOS */}

        <input
          ref={mediaInputRef}
          type="file"
          className="hidden-file-input"
          accept="image/*,video/*"
          onChange={handleFileSelect}
        />

        {/* CAMERA */}

        <input
          ref={cameraInputRef}
          type="file"
          className="hidden-file-input"
          accept="image/*"
          capture="environment"
          onChange={handleFileSelect}
        />

        {/* AUDIO */}

        <input
          ref={audioInputRef}
          type="file"
          className="hidden-file-input"
          accept="audio/*"
          onChange={handleFileSelect}
        />

      </div>

    </div>
  );
}

export default Messages;