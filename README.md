# Rule-Based Chatbot

A simple yet effective conversational AI chatbot built using rule-based pattern matching and predefined responses.

## 📋 Overview

This chatbot uses a rule-based approach to understand user queries and provide appropriate responses. It matches user input against predefined patterns and rules to generate relevant replies, making it ideal for FAQs, customer support, and domain-specific conversations.

## ✨ Features

- **Pattern Matching**: Recognizes user input using keywords and patterns
- **Predefined Responses**: Quick and accurate responses based on rules
- **Context Awareness**: Maintains conversation context for better interactions
- **Fallback Handling**: Graceful handling of unknown queries
- **Easy to Extend**: Simple rule addition for new conversation topics
- **Fast Response Time**: Instant replies without API calls or model inference

## 🛠️ Technologies Used

- **Language**: Python 3.x / JavaScript
- **Libraries**: 
  - [Specify libraries used, e.g., NLTK, regex, etc.]
- **Interface**: Command Line / Web-based
- **Storage**: JSON / Dictionary-based rules



## 🧠 How It Works

The chatbot uses a **rule-based architecture**:

1. **Input Processing**: User input is cleaned and normalized
2. **Pattern Matching**: Input is matched against predefined patterns using:
   - Keyword matching
   - Regular expressions
   - Similarity scoring
3. **Rule Execution**: Matching rules trigger corresponding responses
4. **Response Generation**: Appropriate response is selected and returned
5. **Context Management**: Conversation state is maintained for follow-up queries

### Rule Structure

```python
rules = {
    "greeting": {
        "patterns": ["hello", "hi", "hey", "good morning"],
        "responses": [
            "Hello! How can I help you?",
            "Hi there! What can I do for you?",
            "Hey! How may I assist you today?"
        ]
    },
    "hours": {
        "patterns": ["hours", "timings", "when open", "schedule"],
        "responses": [
            "We're open Monday to Friday, 9 AM to 5 PM."
        ]
    }
}
```

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👤 Author

- Gaurav Bhandare
- GitHub: [gaurav-b23](https://github.com/gaurav-b23)
- Email: bhandaregaurav5@gmail.com
