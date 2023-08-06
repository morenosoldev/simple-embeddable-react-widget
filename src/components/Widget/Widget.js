import { gql, useQuery } from "@apollo/client";
import React, { useEffect, useState } from "react";
import { BsFillChatDotsFill } from "react-icons/bs";
import { AiOutlineClose } from "react-icons/ai";
import Chat from "../Chat";
import "./widget.css";

const GET_CHATBOT = gql`
  query GetChatbotDetail($id: Int!) {
    getChatbotDetail(id: $id) {
      id
      name
      message
      userId
      temperature
      visibility
      rateLimiting
      tooManyRequestsMessage
      collectUserMessage
      file
      collectUserEmail
      collectUserPhone
      collectUserName
      initialMessage
      suggestedMessages
      theme
      chatbotProfilePicture
      removeProfilePicture
      displayName
      userMessageColor
      createdBy
      createdAt
      updatedAt
      deletedAt
    }
  }
`;

function Widget({ config }) {
  const [isVisible, setIsVisible] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  const { loading, error, data } = useQuery(GET_CHATBOT, {
    variables: { id: config.chatbotId },
  });

  useEffect(() => {
    console.log("widget props", config);
  }, [config]);

  const toggleChat = () => {
    setIsOpen((prevIsOpen) => !prevIsOpen);
  };

  useEffect(() => {
    // Function to handle update on resize
    const handleResize = () => {
      if (window.innerWidth < 700 && isOpen) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
    };

    // Initial check
    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Cleanup on unmount
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [isOpen]); // Empty array means this effect runs once on mount and cleanup on unmount

  // Make sure you handle the loading and error states correctly
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error!</p>;

  return (
    <>
      <div className={`chatbot ${isOpen ? "visible-mobile" : ""}`}>
        <button
          className={`chat-bubble ${data.getChatbotDetail.theme} ${
            isVisible ? "visible" : "hidden"
          }`}
          onClick={toggleChat}
        >
          {isOpen ? (
            <AiOutlineClose size={20} className="text-center m-auto" />
          ) : (
            <BsFillChatDotsFill size={20} className="text-center m-auto" />
          )}
        </button>
        {isOpen && (
          <div className="chat-box px-4 mb-3 flex flex-col">
            <Chat close={toggleChat} chatbot={data.getChatbotDetail} />
          </div>
        )}
      </div>
    </>
  );
}

export default Widget;
