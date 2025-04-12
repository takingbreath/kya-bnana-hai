import React, { useState, useEffect } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase/config';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface BhayiaAIProps {
  recipe: {
    title: string;
    ingredients: string[];
    steps: string[];
    nutritionalBenefits: string;
  };
  onChatStarted: () => void;
}

interface Message {
  content: string;
  isUser: boolean;
  id: string;
}

const BhayiaAI: React.FC<BhayiaAIProps> = ({ recipe, onChatStarted }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentResponse, setCurrentResponse] = useState('');
  const [chatStarted, setChatStarted] = useState(false);

  const suggestedQuestions = [
    "How many calories in this?",
    "Portion for 3 people?",
    `Any substitute for ${recipe.ingredients[0]?.split(' ').pop() || 'main ingredient'}?`,
    "Is this good for weight loss?",
    "How long does it take to cook?"
  ];

  // Notify parent component when chat starts
  useEffect(() => {
    if (messages.length > 0 && !chatStarted) {
      setChatStarted(true);
      onChatStarted();
    }
  }, [messages, chatStarted, onChatStarted]);

  // Auto-scroll to the bottom of the page when new messages come in
  useEffect(() => {
    if (messages.length > 0 || currentResponse) {
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, currentResponse]);

  const handleSetInputValue = (value: string) => {
    setInputValue(value);
    if (!chatStarted) {
      setChatStarted(true);
      onChatStarted();
    }
  };

  const askQuestion = async (question: string) => {
    if (!question.trim()) return;
    
    // Add user message
    const userMessageId = Date.now().toString();
    setMessages(prevMessages => [
      ...prevMessages, 
      { content: question, isUser: true, id: userMessageId }
    ]);
    
    setInputValue('');
    setIsLoading(true);
    setCurrentResponse('');

    try {
      const askBhayiaAI = httpsCallable(functions, 'askBhayiaAI');
      
      // Call the Cloud Function and get the response
      const result = await askBhayiaAI({ 
        recipe: {
          title: recipe.title,
          ingredients: recipe.ingredients,
          steps: recipe.steps,
          nutritionalBenefits: recipe.nutritionalBenefits
        },
        question
      });
      
      // Once we get a response, add it as a message
      const aiResponse = result.data as string;
      const aiMessageId = Date.now().toString();
      
      // Simulate typing effect
      let displayedResponse = '';
      const typingSpeed = 15; // ms per character
      const responseChars = aiResponse.split('');
      
      for (let i = 0; i < responseChars.length; i++) {
        // eslint-disable-next-line no-loop-func
        await new Promise(resolve => setTimeout(resolve, typingSpeed));
        displayedResponse += responseChars[i];
        setCurrentResponse(displayedResponse);
      }
      
      // Add the complete message once typing is done
      setMessages(prevMessages => [
        ...prevMessages, 
        { content: aiResponse, isUser: false, id: aiMessageId }
      ]);
      setCurrentResponse('');
    } catch (error) {
      console.error('Error asking Bhayia AI:', error);
      // Add error message
      setMessages(prevMessages => [
        ...prevMessages, 
        { 
          content: "Sorry, I couldn't process that request. Please try again later.",
          isUser: false,
          id: Date.now().toString() 
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    askQuestion(inputValue);
  };

  return (
    <div className="mt-6">
      {/* Horizontal divider */}
      <div className="border-t border-gray-200 my-6"></div>
      
      <h3 className="text-xl font-semibold mb-4 text-gray-800">
        Still curious? Ask Bhayia AI 👇
      </h3>
      
      {/* Suggested Questions */}
      <div className="flex overflow-x-auto pb-2 mb-4 gap-2">
        {suggestedQuestions.map((question, index) => (
          <button
            key={index}
            className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm whitespace-nowrap hover:bg-gray-50 transition-colors"
            onClick={() => handleSetInputValue(question)}
            disabled={isLoading}
          >
            {question}
          </button>
        ))}
      </div>
      
      {/* Chat Messages */}
      <div className="mb-4">
        {messages.length === 0 && !currentResponse ? (
          <div className="text-center text-gray-500 py-8">
            Ask Bhayia AI anything about this recipe!
          </div>
        ) : (
          <>
            {messages.map(message => (
              <div
                key={message.id}
                className={`mb-3 ${message.isUser ? 'text-right' : 'text-left'}`}
              >
                <div
                  className={`inline-block px-4 py-2 rounded-2xl max-w-[80%] ${
                    message.isUser
                      ? 'bg-blue-500 text-white'
                      : 'bg-pastel-orange bg-opacity-10 text-gray-800'
                  }`}
                >
                  {message.isUser ? (
                    message.content
                  ) : (
                    <div className="markdown-content prose">
                      {/* @ts-ignore */}
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {/* Current typing response */}
            {currentResponse && (
              <div className="mb-3 text-left">
                <div className="inline-block px-4 py-2 rounded-2xl max-w-[80%] bg-pastel-orange bg-opacity-10 text-gray-800">
                  <div className="markdown-content prose">
                    {/* @ts-ignore */}
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {currentResponse}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        
        {/* Typing Indicator */}
        {isLoading && !currentResponse && (
          <div className="flex items-center mb-3 text-left">
            <div className="bg-pastel-orange bg-opacity-10 text-gray-800 px-4 py-2 rounded-2xl">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Input Field */}
      <form onSubmit={handleSubmit} className="flex mt-2 mb-12">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => handleSetInputValue(e.target.value)}
          placeholder="Ask about this recipe..."
          className="flex-1 px-4 py-2 border border-gray-200 rounded-l-full focus:outline-none focus:ring-1 focus:ring-pastel-orange"
          disabled={isLoading}
        />
        <button
          type="submit"
          className="px-4 py-2 bg-pastel-orange text-white rounded-r-full hover:bg-opacity-90 focus:outline-none disabled:opacity-50"
          disabled={!inputValue.trim() || isLoading}
        >
          Ask
        </button>
      </form>
    </div>
  );
};

export default BhayiaAI; 