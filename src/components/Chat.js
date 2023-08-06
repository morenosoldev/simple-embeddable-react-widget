import React, { useState, useEffect } from "react";
import { useMutation, gql } from "@apollo/client";
import { TypeAnimation } from "react-type-animation";
import { GoPaperAirplane } from "react-icons/go";
import { AiOutlineClose } from "react-icons/ai";

const CHAT_MUTATION = gql`
  mutation Chat(
    $input: String!
    $file: String!
    $conversationId: Int!
    $chatbotId: Int!
  ) {
    chat(
      input: $input
      file: $file
      conversationId: $conversationId
      chatbotId: $chatbotId
    )
  }
`;

const START_CHAT = gql`
  mutation StartChat($chatbotId: Int!) {
    startChat(chatbotId: $chatbotId)
  }
`;

export default function Chat({ chatbot, close }) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [conversationId, setConversationId] = useState("");
  const [chatMutation, { data, loading, error }] = useMutation(CHAT_MUTATION);
  const [startChatMutation] = useMutation(START_CHAT);

  const changeInput = (e) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Prevents the default action to be taken (form submission)
      handleChat();
    }
  };

  const handleStartChat = async () => {
    if (chatbot !== null) {
      const { data: conversation } = await startChatMutation({
        variables: { chatbotId: parseInt(chatbot.id, 10) },
      });

      setConversationId(conversation.startChat);

      return conversation.startChat;
    }
    return null;
  };

  const sendMessage = async (message) => {
    let currentConversationId = conversationId;

    // If it's the first message and there's no conversation id, start a new chat
    if (messages.length === 0 && !conversationId) {
      currentConversationId = await handleStartChat();
    }

    // Add the user's message
    setMessages((prevMessages) => [
      ...prevMessages,
      { role: "user", message: message },
    ]);
    setInput("");
    try {
      if (chatbot !== null) {
        setIsCreating(true);
        const result = await chatMutation({
          variables: {
            input: message,
            file: chatbot.file,
            conversationId: parseInt(currentConversationId, 10),
            chatbotId: parseInt(chatbot.id, 10),
          },
        });

        // Add the bot's message
        setMessages((prevMessages) => [
          ...prevMessages,
          { role: "bot", message: result.data.chat, fresh: true },
        ]);
        setIsCreating(false);
      }
    } catch (err) {
      setInput("");
      console.error(err);
      setIsCreating(false);
    }
  };

  const handleChat = async () => {
    let currentConversationId = conversationId;

    // If it's the first message and there's no conversation id, start a new chat
    if (messages.length === 0 && !conversationId) {
      currentConversationId = await handleStartChat();
    }

    // Add the user's message
    setMessages((prevMessages) => [
      ...prevMessages,
      { role: "user", message: input },
    ]);
    setInput("");
    try {
      if (chatbot !== null) {
        setIsCreating(true);
        const result = await chatMutation({
          variables: {
            input,
            file: chatbot.file,
            conversationId: parseInt(currentConversationId, 10),
            chatbotId: parseInt(chatbot.id, 10),
          },
        });

        // Add the bot's message
        setMessages((prevMessages) => [
          ...prevMessages,
          { role: "bot", message: result.data.chat, fresh: true },
        ]);
        setIsCreating(false);
      }
    } catch (err) {
      setInput("");
      console.error(err);
      setIsCreating(false);
    }
  };

  return (
    <>
      <div className="h-full">
        <div className="flex-1 p:2 relative h-full h-screen flex flex-col">
          <div className="flex sm:items-center justify-between py-3  border-gray-200">
            <div className="relative flex items-center space-x-4">
              <div className="relative">
                <img
                  src={chatbot.chatbotProfilePicture}
                  alt=""
                  className="w-10 sm:w-16 h-10 sm:h-16 rounded-full"
                />
              </div>
              <div className="flex flex-col leading-tight">
                <div className="text-2xl flex items-center">
                  <span className="text-gray-700 mr-3">{chatbot.name}</span>
                </div>
              </div>
            </div>
            <div>
              <a href="#" onClick={close}>
                <AiOutlineClose size={25} className="mr-2" />
              </a>
            </div>
          </div>
          <div
            id="messages"
            className="flex flex-col space-y-4 p-3 overflow-y-auto scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch"
          >
            <div className="chat-message">
              <div className="flex items-end">
                <div className="flex flex-col space-y-2 text-xs max-w-xs mx-2 order-2 items-start">
                  <div>
                    <span
                      style={{ backgroundColor: "#F3F4F6" }}
                      className="px-4 py-2 rounded-lg inline-block text-base rounded-bl-none text-gray-600"
                    >
                      {chatbot.message}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {messages.map((message, index) => (
              <div
                key={message.role + message.message}
                className="chat-message"
              >
                <div
                  className={`flex items-end ${
                    message.role === "user" ? "justify-end" : ""
                  }`}
                >
                  <div className="flex flex-col space-y-2 text-xs max-w-xs mx-2 order-1 items-end">
                    <div>
                      <span
                        style={{
                          backgroundColor:
                            message.role === "user"
                              ? chatbot.userMessageColor
                              : "#F3F4F6",
                        }}
                        className={`px-4 py-2 rounded-lg text-base inline-block rounded-br-none ${
                          message.role === "user" ? "text-white" : "text-black"
                        } `}
                      >
                        {message.role === "bot" && message?.fresh ? (
                          <TypeAnimation
                            cursor={false}
                            sequence={[message.message]}
                            speed={80}
                          />
                        ) : (
                          message.message
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {isCreating && (
              <div className="chat-message">
                <div className="flex items-end">
                  <div className="flex flex-col space-y-2 text-xs max-w-xs mx-2 order-1 items-end">
                    <div>
                      <span className="px-4 py-2 rounded-lg inline-block rounded-br-none text-gray-600">
                        <div id="loading-bubble">
                          <div className="spinner">
                            <div className="bounce1"></div>
                            <div className="bounce2"></div>
                            <div className="bounce3"></div>
                          </div>
                        </div>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="border-gray-200 px-4 w-full absolute bottom-0 pt-4 mb-2 sm:mb-0">
            <div className="suggested mb-3">
              {chatbot.suggestedMessages?.length > 0 &&
                chatbot.suggestedMessages.map((suggestedMessage) => (
                  <>
                    {suggestedMessage ? (
                      <button
                        onClick={() => sendMessage(suggestedMessage)}
                        className="rounded-xl whitespace-nowrap  mr-1 mt-1 py-2 px-3 text-sm   bg-gray-200 hover:bg-gray-200"
                      >
                        {suggestedMessage}
                      </button>
                    ) : null}
                  </>
                ))}
            </div>
            <div className="relative flex">
              <span className="absolute inset-y-0 flex items-center"></span>
              <input
                type="text"
                aria-label="Skriv din besked!"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={changeInput}
                placeholder="Skriv din besked!"
                className="flex w-full border rounded-xl focus:outline-none focus:border-indigo-300 pl-4 h-10"
              />
              <button
                onClick={handleChat}
                className="absolute flex items-center justify-center h-full w-12 right-0 top-0 text-gray-400 hover:text-gray-600"
              >
                <GoPaperAirplane />
              </button>
            </div>
            <div className="mt-2">
              <p className="text-center text-gray-500 text-xs">
                Drevet af{" "}
                <a
                  href="https://chatbotai.dk"
                  className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                >
                  Chatbotai.dk
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
