import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Download } from 'lucide-react';

export default function IntegratedChatbot() {
  const [messages, setMessages] = useState([
    { text: "Hello! I'm your assistant bot. I can help you with time, math, jokes, and take food orders! Type 'order food' to start ordering or just chat with me!", sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const [orderMode, setOrderMode] = useState(false);
  const [orderState, setOrderState] = useState({
    stage: 'name',
    name: '',
    address: '',
    phone: '',
    foodType: '',
    orders: []
  });
  const [allOrders, setAllOrders] = useState([]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const vegMenu = [
    { id: 1, name: "Veg Burger", price: 120 },
    { id: 2, name: "Paneer Pizza", price: 250 },
    { id: 3, name: "Veg Biryani", price: 180 },
    { id: 4, name: "Pasta Alfredo", price: 200 },
    { id: 5, name: "Veg Sandwich", price: 100 }
  ];

  const nonVegMenu = [
    { id: 6, name: "Chicken Burger", price: 150 },
    { id: 7, name: "Pepperoni Pizza", price: 300 },
    { id: 8, name: "Chicken Biryani", price: 220 },
    { id: 9, name: "Grilled Chicken", price: 280 },
    { id: 10, name: "Fish Fry", price: 250 }
  ];

  const fetchWeather = async () => {
    try {
      // Try to get IP-based location first (no permission needed)
      const ipResponse = await fetch('https://ipapi.co/json/');
      const ipData = await ipResponse.json();
      
      if (ipData.latitude && ipData.longitude) {
        const lat = ipData.latitude;
        const lon = ipData.longitude;
        const city = ipData.city || 'your location';
        const country = ipData.country_name || '';
        
        // Fetch weather using IP-based location
        const weatherResponse = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weathercode,windspeed_10m,relativehumidity_2m&timezone=auto`
        );
        
        const weatherData = await weatherResponse.json();
        
        if (weatherData.current) {
          const temp = weatherData.current.temperature_2m;
          const windSpeed = weatherData.current.windspeed_10m;
          const humidity = weatherData.current.relativehumidity_2m;
          const weatherCode = weatherData.current.weathercode;
          
          const weatherDescriptions = {
            0: "Clear sky", 1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
            45: "Foggy", 48: "Foggy", 51: "Light drizzle", 53: "Moderate drizzle",
            55: "Dense drizzle", 61: "Slight rain", 63: "Moderate rain", 65: "Heavy rain",
            71: "Slight snow", 73: "Moderate snow", 75: "Heavy snow",
            80: "Slight rain showers", 81: "Moderate rain showers", 82: "Violent rain showers",
            95: "Thunderstorm", 96: "Thunderstorm with hail", 99: "Thunderstorm with hail"
          };
          
          const condition = weatherDescriptions[weatherCode] || "Unknown conditions";
          
          return `Current weather in ${city}, ${country}:\n📍 Location: ${city}\n🌡️ Temperature: ${temp}°C\n☁️ Condition: ${condition}\n💨 Wind Speed: ${windSpeed} km/h\n💧 Humidity: ${humidity}%\n\n(Location detected via IP address)`;
        }
      }
    } catch (error) {
      console.error('Weather fetch error:', error);
    }
    
    // Fallback if IP-based location fails
    return "I couldn't fetch the weather data. This might be due to:\n• Network issues\n• Location service unavailable\n\nPlease try again or check weather.com for your location.";
  };

  const handleFoodOrder = (userInput) => {
    const input = userInput.trim();

    switch (orderState.stage) {
      case 'name':
        if (input.length > 0) {
          setOrderState(prev => ({ ...prev, name: input, stage: 'address' }));
          return `Nice to meet you, ${input}! 😊 Now, please provide your delivery address.`;
        }
        return "Please enter a valid name.";

      case 'address':
        if (input.length > 5) {
          setOrderState(prev => ({ ...prev, address: input, stage: 'phone' }));
          return "Great! Now, please provide your phone number (10 digits).";
        }
        return "Please enter a valid address (at least 5 characters).";

      case 'phone':
        const phonePattern = /^\d{10}$/;
        if (phonePattern.test(input.replace(/\s/g, ''))) {
          setOrderState(prev => ({ ...prev, phone: input, stage: 'foodType' }));
          return "Perfect! 📱 Now, let's choose your food preference:\n\nType 1 for Vegetarian 🥗\nType 2 for Non-Vegetarian 🍗";
        }
        return "Please enter a valid 10-digit phone number.";

      case 'foodType':
        if (input === '1') {
          setOrderState(prev => ({ ...prev, foodType: 'Vegetarian', stage: 'menu' }));
          let menuText = "🥗 Vegetarian Menu:\n\n";
          vegMenu.forEach(item => {
            menuText += `${item.id}. ${item.name} - ₹${item.price}\n`;
          });
          menuText += "\nEnter the item number to add to your order.\nType 'done' when finished ordering.\nType 'cancel' to exit ordering.";
          return menuText;
        } else if (input === '2') {
          setOrderState(prev => ({ ...prev, foodType: 'Non-Vegetarian', stage: 'menu' }));
          let menuText = "🍗 Non-Vegetarian Menu:\n\n";
          nonVegMenu.forEach(item => {
            menuText += `${item.id}. ${item.name} - ₹${item.price}\n`;
          });
          menuText += "\nEnter the item number to add to your order.\nType 'done' when finished ordering.\nType 'cancel' to exit ordering.";
          return menuText;
        }
        return "Please type 1 for Vegetarian or 2 for Non-Vegetarian.";

      case 'menu':
        if (input.toLowerCase() === 'cancel') {
          setOrderMode(false);
          setOrderState({
            stage: 'name',
            name: '',
            address: '',
            phone: '',
            foodType: '',
            orders: []
          });
          return "Order cancelled. I'm back to normal chat mode! How can I help you?";
        }

        if (input.toLowerCase() === 'done') {
          if (orderState.orders.length === 0) {
            return "You haven't ordered anything yet! Please select at least one item or type 'cancel' to exit.";
          }
          setOrderState(prev => ({ ...prev, stage: 'confirm' }));
          
          let summary = "📋 Order Summary:\n\n";
          summary += `Name: ${orderState.name}\n`;
          summary += `Address: ${orderState.address}\n`;
          summary += `Phone: ${orderState.phone}\n`;
          summary += `Type: ${orderState.foodType}\n\n`;
          summary += "Items:\n";
          
          let total = 0;
          orderState.orders.forEach(order => {
            summary += `- ${order.name} - ₹${order.price}\n`;
            total += order.price;
          });
          
          summary += `\nTotal: ₹${total}\n\n`;
          summary += "Type 'confirm' to place your order or 'cancel' to exit.";
          return summary;
        }

        const itemId = parseInt(input);
        const menu = orderState.foodType === 'Vegetarian' ? vegMenu : nonVegMenu;
        const selectedItem = menu.find(item => item.id === itemId);

        if (selectedItem) {
          setOrderState(prev => ({
            ...prev,
            orders: [...prev.orders, selectedItem]
          }));
          return `✅ ${selectedItem.name} added to your order!\n\nAdd more items, type 'done' to finish, or 'cancel' to exit.`;
        }
        return "Invalid item number. Please select from the menu above or type 'cancel' to exit.";

      case 'confirm':
        if (input.toLowerCase() === 'confirm') {
          const orderData = {
            name: orderState.name,
            address: orderState.address,
            phone: orderState.phone,
            foodType: orderState.foodType,
            items: orderState.orders.map(o => o.name).join('; '),
            total: orderState.orders.reduce((sum, o) => sum + o.price, 0),
            timestamp: new Date().toLocaleString()
          };
          
          setAllOrders(prev => [...prev, orderData]);
          setOrderMode(false);
          setOrderState({
            stage: 'name',
            name: '',
            address: '',
            phone: '',
            foodType: '',
            orders: []
          });
          
          return "🎉 Order placed successfully! Your food will be delivered soon.\n\nI'm back to normal chat mode. Type 'order food' to order again or ask me anything else!";
        } else if (input.toLowerCase() === 'cancel') {
          setOrderMode(false);
          setOrderState({
            stage: 'name',
            name: '',
            address: '',
            phone: '',
            foodType: '',
            orders: []
          });
          return "Order cancelled. I'm back to normal chat mode! How can I help you?";
        }
        return "Please type 'confirm' to place your order or 'cancel' to exit.";

      default:
        return "Something went wrong. Type 'cancel' to exit ordering mode.";
    }
  };

  const getBotResponse = async (userInput) => {
    const input = userInput.toLowerCase().trim();

    // Check if user wants to order food
    if (/order food|food order|order|place order|buy food/.test(input) && !orderMode) {
      setOrderMode(true);
      setOrderState({
        stage: 'name',
        name: '',
        address: '',
        phone: '',
        foodType: '',
        orders: []
      });
      return "Great! Let's take your food order. 🍽️ First, what's your name?";
    }

    // If in order mode, handle food ordering
    if (orderMode) {
      return handleFoodOrder(userInput);
    }

    // Regular chatbot responses
    if (/good morning|morning/i.test(input)) {
      return "Good morning! How can I help you today?";
    }

    if (/good afternoon|afternoon/i.test(input)) {
      return "Good afternoon! What can I do for you?";
    }

    if (/good evening|evening/i.test(input)) {
      return "Good evening! How may I assist you?";
    }

    if (/good night|night/i.test(input)) {
      return "Good night! Sleep well!";
    }

    if (/^(hi|hello|hey|greetings|howdy)$/i.test(input)) {
      return "Hello! How can I help you today?";
    }

    if (/^(hi there|hello there|hey there)$/i.test(input)) {
      return "Hi there! What can I do for you?";
    }

    if (/how are you|how're you|how r u/.test(input)) {
      return "I'm doing great, thank you for asking! I'm here to help you. How are you?";
    }

    // Response to user saying they're good/fine/well
    if (/i am good|i'm good|i am fine|i'm fine|i am well|i'm well|doing good|doing fine|doing well|good too|fine too|well too|am good|am fine|am well/.test(input)) {
      return "That's wonderful to hear! 😊 How can I assist you today? I can help with math, tell jokes, show the time, or take your food order!";
    }

    // Response to user saying they're not good
    if (/not good|not well|not fine|bad|terrible|sad|upset/.test(input)) {
      return "I'm sorry to hear that. I hope I can help brighten your day! Would you like to hear a joke, or is there something I can help you with?";
    }

    if (/how old are you|what is your age|your age/.test(input)) {
      return "I'm a chatbot, so I don't have an age in the traditional sense. But I was created just for this conversation, so you could say I'm brand new!";
    }

    if (/where are you from|where do you live|your location/.test(input)) {
      return "I exist in the digital world! I don't have a physical location, but I'm running right here in your browser.";
    }

    if (/what do you like|your favorite|do you have hobbies/.test(input)) {
      return "I enjoy helping people and having interesting conversations! If chatbots could have hobbies, mine would be learning new patterns and improving my responses.";
    }

    if (/are you real|are you human|are you a bot/.test(input)) {
      return "I'm a chatbot - a computer program designed to simulate conversation. I use pattern matching to understand and respond to your messages!";
    }

    if (/do you have feelings|can you feel|do you get sad|do you get happy/.test(input)) {
      return "I don't have feelings in the way humans do. I'm a program that follows rules and patterns. But I'm designed to be helpful and friendly!";
    }

    if (/what languages do you speak|can you speak/.test(input)) {
      return "I'm currently programmed to understand and respond in English. My responses are based on pattern matching in English text.";
    }

    if (/who created you|who made you|who built you/.test(input)) {
      return "I was created as a demonstration of rule-based chatbot technology using pattern matching and if-else logic!";
    }

    if (/what are you|tell me about yourself|describe yourself/.test(input)) {
      return "I'm a rule-based chatbot! I use pattern matching to understand your questions and provide responses. I can tell you the time, do simple math, tell jokes, take food orders, and chat with you!";
    }

    if (/what time|current time|what's the time/.test(input)) {
      const now = new Date();
      return `The current time is ${now.toLocaleTimeString()}.`;
    }

    if (/what date|today's date|what day/.test(input)) {
      const now = new Date();
      return `Today is ${now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.`;
    }

    if (/what can you do|your capabilities|help me|how do you work/.test(input)) {
      return "I can:\n• Respond to greetings\n• Tell you the time and date\n• Do math calculations\n• Tell jokes\n• Take food orders (type 'order food')\n• Answer questions about myself\n\nI use pattern matching to understand your input!";
    }

    if (/thank you|thanks|thx|appreciate/.test(input)) {
      return "You're welcome! Is there anything else I can help you with?";
    }

    if (/bye|goodbye|see you|farewell|exit/.test(input)) {
      return "Goodbye! It was nice chatting with you. Come back anytime!";
    }

    if (/tell me a joke|joke|funny|make me laugh/.test(input)) {
      const jokes = [
        "Why don't programmers like nature? It has too many bugs!",
        "Why did the chatbot go to school? To improve its responses!",
        "What do you call a chatbot that sings? A-dell!",
        "Why did the restaurant hire a chatbot? To take orders without taking breaks!"
      ];
      return jokes[Math.floor(Math.random() * jokes.length)];
    }

    // Math patterns - handle expressions with or without "what is", "calculate", etc.
    if (/\d/.test(input)) {
      try {
        // Extract mathematical expression - look for numbers and operators
        let expression = input;
        
        // Replace common math symbols
        expression = expression.replace(/x/gi, '*');
        expression = expression.replace(/×/g, '*');
        expression = expression.replace(/÷/g, '/');
        expression = expression.replace(/\^/g, '**');
        
        // Try to find a valid math expression
        const mathMatch = expression.match(/[\d\+\-\*\/\(\)\.\s\*\*]+/);
        if (mathMatch) {
          let mathExpr = mathMatch[0].trim();
          
          // Remove any leading/trailing operators
          mathExpr = mathExpr.replace(/^[\+\-\*\/]+|[\+\-\*\/]+$/g, '');
          
          // Sanitize - keep only valid math characters
          const sanitized = mathExpr.replace(/[^\d\+\-\*\/\(\)\.\s]/g, '');
          
          if (sanitized && /\d/.test(sanitized)) {
            const result = new Function('return ' + sanitized)();
            
            if (typeof result === 'number' && !isNaN(result)) {
              return `The answer is ${result}.`;
            }
          }
        }
      } catch (e) {
        // If calculation fails, don't return error for non-math queries
        if (/what is|calculate|solve|compute/.test(input)) {
          return "I couldn't calculate that. Try something like '5 * 2 + 2' or 'what is 10 / 2'?";
        }
      }
    }

    if (/^(yes|yeah|yep|yup|sure|ok|okay)$/i.test(input)) {
      return "Awesome! Feel free to ask me anything. I can help with time, dates, simple math, jokes, and food orders!";
    }

    if (/^(no|nope|nah)$/i.test(input)) {
      return "No worries! I'm here whenever you need me.";
    }

    return "I'm not sure how to respond to that. Try asking me about the time, math, jokes, or type 'order food' to place a food order!";
  };

  const handleSend = async () => {
    if (input.trim() === '') return;

    const userMessage = { text: input, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);

    const userInput = input;
    setInput('');

    setTimeout(async () => {
      const botResponse = await getBotResponse(userInput);
      const botMessage = { text: botResponse, sender: 'bot' };
      setMessages(prev => [...prev, botMessage]);
    }, 500);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  const downloadCSV = () => {
    if (allOrders.length === 0) {
      alert("No orders to download yet! Place an order first.");
      return;
    }

    try {
      const headers = ['Name', 'Address', 'Phone', 'Food Type', 'Items', 'Total', 'Timestamp'];
      const csvRows = [headers.join(',')];
      
      allOrders.forEach(order => {
        const row = [
          `"${order.name}"`,
          `"${order.address}"`,
          `"${order.phone}"`,
          `"${order.foodType}"`,
          `"${order.items}"`,
          order.total,
          `"${order.timestamp}"`
        ];
        csvRows.push(row.join(','));
      });

      const csvContent = csvRows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `food_orders_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error downloading CSV:', error);
      alert('Failed to download CSV. Please try again.');
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white shadow-md p-4 border-b-4 border-indigo-500">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-500 p-2 rounded-full">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">RuleBot Plus 🤖</h1>
              <p className="text-sm text-gray-600">
                {orderMode ? `📋 Food Ordering - ${orderState.stage}` : 'Chat Assistant & Food Ordering'}
              </p>
            </div>
          </div>
          {allOrders.length > 0 && (
            <button
              onClick={downloadCSV}
              className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors duration-200"
              title="Download Orders as CSV"
            >
              <Download className="w-4 h-4" />
              <span className="text-sm">Orders ({allOrders.length})</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex items-start gap-3 ${
              message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
            }`}
          >
            <div
              className={`p-2 rounded-full ${
                message.sender === 'user'
                  ? 'bg-indigo-500'
                  : 'bg-gray-300'
              }`}
            >
              {message.sender === 'user' ? (
                <User className="w-5 h-5 text-white" />
              ) : (
                <Bot className="w-5 h-5 text-gray-700" />
              )}
            </div>
            <div
              className={`max-w-xs lg:max-w-md xl:max-w-lg px-4 py-2 rounded-2xl ${
                message.sender === 'user'
                  ? 'bg-indigo-500 text-white rounded-tr-none'
                  : 'bg-white text-gray-800 rounded-tl-none shadow-md'
              }`}
            >
              <p className="text-sm whitespace-pre-line">{message.text}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={orderMode ? "Enter your response..." : "Type your message..."}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <button
            onClick={handleSend}
            className="bg-indigo-500 text-white p-2 rounded-full hover:bg-indigo-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={input.trim() === ''}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">
          {orderMode ? `🍽️ Ordering Mode Active` : `Try: "order food", "tell me a joke", "what time is it?"`}
        </p>
      </div>
    </div>
  );
}