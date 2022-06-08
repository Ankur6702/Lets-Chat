import Message from "../message/Message";
import { io } from "socket.io-client";
import { useEffect, useRef, useState } from "react";
import ReactQuill from 'react-quill';
import Picker from 'emoji-picker-react';
import { BsEmojiSmile } from "react-icons/bs";
import { FaPlay } from "react-icons/fa";
import { AiOutlinePlusCircle } from "react-icons/ai";
import { HiOutlineAtSymbol } from "react-icons/hi";
import "quill-mention";
import 'react-quill/dist/quill.snow.css';
import "./chat.css";

const socket = io("https://chat-serve.herokuapp.com/");

export default function Chat() {

  let allUsers = [];

  const socketId = useRef(null);
  const messagesEndRef = useRef(null);

  const [messages, setMessages] = useState([]);
  let [value, setValue] = useState("");
  const [chosenEmoji, setChosenEmoji] = useState(null);

// ======================================= Quills editor Modules =========================================
  const modules = {
    toolbar: [
      ['bold', 'italic', 'strike'],
      ['link'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['blockquote'],
      ['code-block']
    ],
    mention: {
      allowedChars: /^[A-Za-z\sÅÄÖåäö]*$/,
      mentionDenotationChars: ["@"],
      source: function (searchTerm, renderList, mentionChar) {
        let values;
        if (mentionChar === "@") {
          handleMentionClick();
          values = allUsers.map(user => {
            return {
              id: user,
              value: user,
            }
          });
        }
        if (searchTerm.length === 0) {
          renderList(values, searchTerm);
        } else {
          const matches = [];
          for (let i = 0; i < values.length; i++)
            if (
              ~values[i].value.toLowerCase().indexOf(searchTerm.toLowerCase())
            )
              matches.push(values[i]);
          renderList(matches, searchTerm);
        }
      }
    }
  }

  // ======================================================================================================


  // ========================================= Quills editor Text =====================================
  const handleValue = (value) => {

    value = value.replace(/<p>/g, "");
    value = value.replace(/<\/p>/g, "").trim();

    if (value.includes("<br>") && !value.includes("<ol") && !value.includes("<ul") && !value.includes("<blockquote")) {
      value = value.replace(/<br>/g, "");
      if (value !== "") {
        socket.emit("send", value);
        setValue("");
      }
    } else {
      setValue(value);
    }

    if (value === "<br>") {
      setValue("");
    }
  };

  const handleMessages = (e) => {
    e.preventDefault();
    value = value.replace(/<p>/g, "");
    value = value.replace(/<\/p>/g, "").trim();
    if (value !== "") {
      let message = value;
      socket.emit("send", message);
      setValue("");
    }
    let emojiPicker = document.querySelector("aside.emoji-picker-react");
    emojiPicker.style.display = "none";
  };

  // ============================================================================================


  // ========================================= Extra Features ===================================

  const handleAtClick = () => {
    setValue(value.concat(" @"));
  }

  const handleMentionClick = () => {
    if (messages.length > 0) {
      messages.forEach(message => { allUsers.push(message.user) });
      allUsers = [...new Set(allUsers)];
    }
  }

  const handleEmojiShow = () => {
    let emojiPicker = document.querySelector("aside.emoji-picker-react");
    if (emojiPicker.style.display === "none") {
      emojiPicker.style.display = "block";
    } else {
      emojiPicker.style.display = "none";
    }
  }

  const closeEmojiBox = () => {
    let emojiPicker = document.querySelector("aside.emoji-picker-react");
    emojiPicker.style.display = "none";
  }

  const onEmojiClick = (event, emojiObject) => {
    setChosenEmoji(emojiObject);
    value = value + emojiObject.emoji;
    value = value.replace(/<br>/g, "").trim();
    setValue(value);
  };

  const handleFileUploadButtonClick = () => {
    let fileInput = document.querySelector("input#file");
    fileInput.click();
  }

  const handleFileUpload = (event) => {
    let emojiPicker = document.querySelector("aside.emoji-picker-react");
    emojiPicker.style.display = "none";
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const fileUrl = reader.result;
      let image = `<img src="${fileUrl}" alt="${file.name}" style="width:100%; height: 100%;">`;

      value = value + image;
      value = value.replace(/<br>/g, "").trim();
      setValue(value);
    };
  };

  // ============================================================================================


  // ============= To scroll till bottom whenever a new message is added ========================

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages]);

  // ============================================================================================


  // =================================== socket.io ==============================================

  useEffect(() => {
    let name = null;
    do {
      name = prompt("What is your name? (Required)");
    } while (!name);

    socket.on('connect', () => {
      socketId.current = socket.id;
    });

    socket.emit("new-user", name);

    socket.on("joined", (message) => {
      setMessages((messages) => [
        ...messages,
        {
          message: `${message.user} joined the chat`,
          user: message.user,
          own: false,
          id: message.id,
          date: new Date().toLocaleTimeString(),
        },
      ]);
    });

    socket.on("recieved", (message) => {
      setMessages((messages) => [
        ...messages,
        {
          message: message.message,
          user: message.user,
          own: socketId.current === message.id,
          id: message.id,
          date: new Date().toLocaleTimeString(),
        },
      ]);
    });
  }, []);
  
  // ============================================================================================


  return (
    <div className="messenger">
      <div className="box" onClick={closeEmojiBox} />
      <div className="chatBox">
        <div className="chatWrapper">
          <div className="chatHeader" onClick={closeEmojiBox}>
            <div className="chatHeaderTitle">
              <p>Lets Chat</p>
            </div>
          </div>
          <div className="chatBoxTop" onClick={closeEmojiBox}>
            {messages.map((message, index) => (
              <Message key={index} message={message.message} own={message.own} name={message.user} date={message.date} />
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="chatBoxBottom">
            <div className="formatter" onClick={closeEmojiBox}>
              <ReactQuill
                value={value}
                onChange={handleValue}
                placeholder="Chat comes here..."
                modules={modules}
              >
                <div className="my-editing-area" onClick={closeEmojiBox} />
              </ReactQuill>
            </div>
            <Picker onEmojiClick={onEmojiClick} />
            <div className="send">
              <div className="emogiFileWrapper">
                <div className="fileWrapper">
                  <input type="file" id="file" accept="image/*" onChange={handleFileUpload} />
                  <AiOutlinePlusCircle onClick={handleFileUploadButtonClick} />
                </div>
                <div className="emojiWrapper" onClick={handleEmojiShow}>
                  <BsEmojiSmile />
                </div>
                <div className="mentionIcon" onClick={handleAtClick}>
                  <HiOutlineAtSymbol />
                </div>
              </div>
              <div className="formWrapper">
                <form action="#" className="chatForm" onSubmit={handleMessages}>
                  <button className="chatSendButton" type="submit"><FaPlay /></button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="box" onClick={closeEmojiBox} />
    </div>
  )
}
