import mongoose, { Document, Schema } from "mongoose";

export interface IPost extends Document {
    user: mongoose.Types.ObjectId;
    date: Date;
    content: string;
    likes: mongoose.Types.ObjectId[];
}

const postSchema = new Schema<IPost>({
    user: {
        type: Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    content: { type: String, required: true },
    likes: [
        {
            type: Schema.Types.ObjectId,
            ref: "users"
        }
    ]
});

export default mongoose.model<IPost>("posts", postSchema);
