import mongoose, { Document, Schema } from 'mongoose';

export type RoomStatus = 'active' | 'host_left_pending_close';

export interface IRoom extends Document {
    name: string;
    topic?: string;
    isAnonymous: boolean;
    participants: string[];
    createdBySessionId: string;
    hostSessionId: string;
    status: RoomStatus;
    hostLeftAt?: Date;
    pendingExpirationAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const RoomSchema: Schema = new Schema({
    name: { type: String, required: true, unique: true, trim: true },
    topic: { type: String, trim: true },
    isAnonymous: { type: Boolean, default: true },
    participants: { type: [String], default: [] },
    createdBySessionId: { type: String, required: true },
    hostSessionId: { type: String, required: true },
    status: {
        type: String,
        enum: ['active', 'host_left_pending_close'],
        default: 'active',
    },
    hostLeftAt: { type: Date },
    pendingExpirationAt: { type: Date },
}, { timestamps: true });

RoomSchema.index({ pendingExpirationAt: 1 });

export const Room = mongoose.model<IRoom>('Room', RoomSchema);