import mongoose from 'mongoose';

const messageInsightSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  insights: [
    {
      category: {
        type: String,
        required: true
      },
      title: {
        type: String,
        required: true
      },
      description: {
        type: String,
        required: true
      },
      details: [
        {
          from: String,
          text: String
        }
      ],
      priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
      }
    }
  ],
  summary: {
    type: String,
    required: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

const MessageInsight = mongoose.model('MessageInsight', messageInsightSchema);

export default MessageInsight;