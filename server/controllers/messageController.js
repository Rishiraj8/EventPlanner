import Message from '../models/Message.js';
import Event from '../models/Event.js';
import MessageInsight from '../models/MessageInsight.js'; // New model for storing insights

// Send a message
export const sendMessage = async (req, res) => {
  const { eventId, message } = req.body;

  try {
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const newMessage = await Message.create({
      eventId,
      sender: req.user.id,
      message
    });

    res.status(201).json(newMessage);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get messages for an event
export const getMessages = async (req, res) => {
  try {
    const messages = await Message.find({ eventId: req.params.eventId })
      .populate('sender', 'name email')
      .sort({ timestamp: 1 });

    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Analyze messages for an event
export const analyzeMessages = async (req, res) => {
  const { eventId } = req.params;
  console.log('Analyzing messages for event:', eventId);

  try {
    if (!eventId) return res.status(400).json({ message: 'Event ID is required' });
    console.log('Analyzing messages for event:', eventId);
    
    // Get event details
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    
    // Check if user is host (only host can analyze messages)
    if (event.host.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only the event host can analyze messages' });
    }
    
    // Get all messages for the event
    const messages = await Message.find({ eventId })
      .populate('sender', 'name email')
      .sort({ timestamp: 1 });
    
    if (messages.length === 0) {
      return res.status(200).json({ 
        insights: [],
        summary: "No messages to analyze yet."
      });
    }
    
    // Format the messages for AI processing
    const messageTexts = messages.map(msg => ({
      sender: msg.sender.name,
      text: msg.message,
      timestamp: msg.timestamp
    }));
    
    // Process the messages with our AI analysis function
    const analysis = analyzeEventMessages(messageTexts, event);
    
    // Save the insights to the database
    const existingInsight = await MessageInsight.findOne({ eventId });
    
    if (existingInsight) {
      existingInsight.insights = analysis.insights;
      existingInsight.summary = analysis.summary;
      existingInsight.lastUpdated = Date.now();
      await existingInsight.save();
      
      res.status(200).json(existingInsight);
    } else {
      const newInsight = await MessageInsight.create({
        eventId,
        insights: analysis.insights,
        summary: analysis.summary
      });
      
      res.status(201).json(newInsight);
    }
  } catch (err) {
    console.error('Error analyzing messages:', err);
    res.status(500).json({ message: err.message });
  }
};

// Get saved insights for an event
export const getInsights = async (req, res) => {
  try {
    const insights = await MessageInsight.findOne({ eventId: req.params.eventId });
    
    if (!insights) {
      return res.status(200).json({ 
        insights: [],
        summary: "No analysis has been performed yet."
      });
    }
    
    res.status(200).json(insights);
  } catch (err) {
    console.error('Error fetching insights:', err);
    res.status(500).json({ message: err.message });
  }
};

// AI analysis function (local implementation for demo)
function analyzeEventMessages(messages, event) {
  // Extract key topics from messages
  const topics = extractTopics(messages);
  
  // Generate insights based on message content
  const insights = generateInsights(messages, topics, event);
  
  // Create a summary of the conversation
  const summary = generateSummary(messages, topics, insights);
  
  return { insights, summary };
}

function extractTopics(messages) {
  // Keywords to look for in messages
  const topicKeywords = {
    food: ['food', 'eat', 'dinner', 'lunch', 'breakfast', 'meal', 'snack', 'drink', 'catering'],
    timing: ['time', 'schedule', 'when', 'early', 'late', 'hour', 'morning', 'afternoon', 'evening'],
    activities: ['activity', 'game', 'play', 'music', 'dance', 'entertainment', 'performance'],
    logistics: ['bring', 'location', 'parking', 'directions', 'address', 'transport', 'car', 'bus'],
    attendees: ['coming', 'attend', 'join', 'rsvp', 'guest', 'invite', 'people', 'friends']
  };
  
  // Count mentions of each topic
  const topicCounts = {};
  Object.keys(topicKeywords).forEach(topic => {
    topicCounts[topic] = 0;
  });
  
  // Process each message
  messages.forEach(message => {
    const text = message.text.toLowerCase();
    
    Object.keys(topicKeywords).forEach(topic => {
      topicKeywords[topic].forEach(keyword => {
        if (text.includes(keyword)) {
          topicCounts[topic]++;
        }
      });
    });
  });
  
  // Sort topics by frequency
  const sortedTopics = Object.keys(topicCounts)
    .sort((a, b) => topicCounts[b] - topicCounts[a])
    .filter(topic => topicCounts[topic] > 0);
  
  return sortedTopics;
}

function generateInsights(messages, topics, event) {
  const insights = [];
  
  // Food preferences
  if (topics.includes('food')) {
    const foodMessages = messages.filter(msg => 
      msg.text.toLowerCase().match(/food|eat|dinner|lunch|breakfast|meal|snack|drink|catering/));
    
    if (foodMessages.length > 0) {
      insights.push({
        category: 'Food & Drinks',
        title: 'Food Preferences',
        description: 'Guests are discussing food preferences and dietary requirements.',
        details: extractSpecifics(foodMessages, ['vegetarian', 'vegan', 'gluten', 'allergy', 'prefer', 'like', 'dislike']),
        priority: 'high'
      });
    }
  }
  
  // Timing discussions
  if (topics.includes('timing')) {
    const timingMessages = messages.filter(msg => 
      msg.text.toLowerCase().match(/time|schedule|when|early|late|hour|morning|afternoon|evening/));
    
    if (timingMessages.length > 0) {
      insights.push({
        category: 'Schedule',
        title: 'Timing Concerns',
        description: 'There are discussions about the event timing or schedule.',
        details: extractSpecifics(timingMessages, ['arrive', 'leave', 'start', 'end', 'duration', 'long', 'short']),
        priority: 'high'
      });
    }
  }
  
  // Activity interests
  if (topics.includes('activities')) {
    const activityMessages = messages.filter(msg => 
      msg.text.toLowerCase().match(/activity|game|play|music|dance|entertainment|performance/));
    
    if (activityMessages.length > 0) {
      insights.push({
        category: 'Entertainment',
        title: 'Activity Preferences',
        description: 'Guests have mentioned preferences for activities and entertainment.',
        details: extractSpecifics(activityMessages, ['music', 'game', 'dance', 'play', 'enjoy', 'fun', 'boring']),
        priority: 'medium'
      });
    }
  }
  
  // Logistics questions
  if (topics.includes('logistics')) {
    const logisticsMessages = messages.filter(msg => 
      msg.text.toLowerCase().match(/bring|location|parking|directions|address|transport|car|bus/));
    
    if (logisticsMessages.length > 0) {
      insights.push({
        category: 'Logistics',
        title: 'Logistical Questions',
        description: 'Guests are asking about logistics like location and transportation.',
        details: extractSpecifics(logisticsMessages, ['where', 'how', 'find', 'get', 'bring', 'need']),
        priority: 'high'
      });
    }
  }
  
  // Attendance confirmations
  if (topics.includes('attendees')) {
    const attendanceMessages = messages.filter(msg => 
      msg.text.toLowerCase().match(/coming|attend|join|rsvp|guest|invite|people|friends/));
    
    if (attendanceMessages.length > 0) {
      insights.push({
        category: 'Attendance',
        title: 'Attendance Updates',
        description: 'Guests are discussing who is attending or bringing additional people.',
        details: extractSpecifics(attendanceMessages, ['coming', 'going', 'attend', 'can\'t', 'unable', 'friend', 'plus']),
        priority: 'medium'
      });
    }
  }
  
  // Add general sentiment analysis
  const sentiment = analyzeSentiment(messages);
  insights.push({
    category: 'General',
    title: 'Event Excitement Level',
    description: `Overall, guests seem ${sentiment.label} about the event.`,
    details: sentiment.details,
    priority: 'low'
  });
  
  return insights;
}

function extractSpecifics(messages, keywords) {
  // Find relevant snippets from messages containing keywords
  const snippets = [];
  
  messages.forEach(message => {
    const text = message.text;
    keywords.forEach(keyword => {
      if (text.toLowerCase().includes(keyword)) {
        // Get the surrounding context (simplified version)
        const start = Math.max(0, text.toLowerCase().indexOf(keyword) - 20);
        const end = Math.min(text.length, text.toLowerCase().indexOf(keyword) + keyword.length + 20);
        const snippet = text.substring(start, end).trim();
        
        snippets.push({
          from: message.sender,
          text: `"...${snippet}..."`
        });
      }
    });
  });
  
  // Remove duplicates
  const uniqueSnippets = snippets.filter((snippet, index, self) =>
    index === self.findIndex(s => s.text === snippet.text)
  );
  
  return uniqueSnippets.slice(0, 3); // Limit to 3 examples
}

function analyzeSentiment(messages) {
  // Simple sentiment analysis based on keyword matching
  const positiveWords = ['excited', 'happy', 'looking forward', 'great', 'awesome', 'can\'t wait', 'good', 'nice', 'love', 'enjoy'];
  const negativeWords = ['worried', 'concerned', 'problem', 'issue', 'can\'t', 'unable', 'difficult', 'bad', 'dislike', 'hate'];
  
  let positiveCount = 0;
  let negativeCount = 0;
  
  messages.forEach(message => {
    const text = message.text.toLowerCase();
    
    positiveWords.forEach(word => {
      if (text.includes(word)) positiveCount++;
    });
    
    negativeWords.forEach(word => {
      if (text.includes(word)) negativeCount++;
    });
  });
  
  // Determine overall sentiment
  let label = 'neutral';
  if (positiveCount > negativeCount * 2) {
    label = 'very excited';
  } else if (positiveCount > negativeCount) {
    label = 'generally positive';
  } else if (negativeCount > positiveCount * 2) {
    label = 'concerned';
  } else if (negativeCount > positiveCount) {
    label = 'somewhat hesitant';
  }
  
  // Return details as an array of objects to match the expected schema
  return {
    label,
    details: [{
      from: 'System',
      text: `Found ${positiveCount} positive and ${negativeCount} negative expressions in the conversation.`
    }]
  };
}
function generateSummary(messages, topics, insights) {
  // Create an overall summary based on the analysis
  let summary = `Based on the analysis of ${messages.length} messages, `;
  
  if (topics.length === 0) {
    summary += "no specific topics of interest were identified.";
    return summary;
  }
  
  summary += `the main topics discussed were: ${topics.slice(0, 3).join(', ')}.`;
  
  // Add high priority insights to summary
  const highPriorityInsights = insights.filter(insight => insight.priority === 'high');
  if (highPriorityInsights.length > 0) {
    summary += " Key points that need attention: ";
    summary += highPriorityInsights.map(insight => insight.title).join(', ');
    summary += ".";
  }
  
  return summary;
}