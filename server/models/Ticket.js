import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
  {
    author: { type: String, required: true },
    text: { type: String, required: true },
    internal: { type: Boolean, default: false },
    time: { type: Date, default: Date.now },
  },
  { _id: false }
);

const ticketSchema = new mongoose.Schema(
  {
    business: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    subject: { type: String, required: true },
    requester: { type: String, required: true },
    priority: { type: String, enum: ['Low', 'Medium', 'High', 'Urgent'], default: 'Medium' },
    status: { type: String, enum: ['Open', 'In Progress', 'Resolved', 'Closed'], default: 'Open' },
    assignedTo: { type: String, default: 'Unassigned' },
    comments: { type: [commentSchema], default: [] },
  },
  { timestamps: true }
);

ticketSchema.index({ business: 1, updatedAt: -1 });

export default mongoose.model('Ticket', ticketSchema);
