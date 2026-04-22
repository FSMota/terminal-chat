import mongoose, { Schema, Document } from 'mongoose';

export interface ISession extends Document {
    socketId?: string;
    userId?: string;
    token: string;
    displayName: string;
    createdAt: Date;
    expiresAt: Date;
    isAnonymous: boolean;
}

const SessionSchema: Schema = new Schema({
    socketId: { type: String, unique: true, sparse: true },
    userId: { type: String },
    token: { type: String, required: true, unique: true },
    displayName: { type: String, required: true, trim: true },
    createdAt: { type: Date, default: Date.now },
    expiresAt: {
        type: Date,
        required: true,
        default: () => new Date(Date.now() + 60 * 60 * 1000),
    },
    isAnonymous: { type: Boolean, default: true },
});

SessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Session = mongoose.model<ISession>('Session', SessionSchema);