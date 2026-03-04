import mongoose, { Document, Schema } from "mongoose";

export interface IPost extends Document {
    user: mongoose.Types.ObjectId;
    date: Date;
    title: string;
    content: string;
    image?: string;
    likes: mongoose.Types.ObjectId[];
    favorites: mongoose.Types.ObjectId[];
    comments: {
        user: mongoose.Types.ObjectId;
        text: string;
        date: Date;
    }[];
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
    title: {
        type: String,
        required: true,
        default: "Untitled"
    },
    content: { type: String, required: true },
    image: { type: String, default: "" },
    likes: [
        {
            type: Schema.Types.ObjectId,
            ref: "users"
        }
    ],
    favorites: [
        {
            type: Schema.Types.ObjectId,
            ref: "users"
        }
    ],
    comments: [
        {
            user: {
                type: Schema.Types.ObjectId,
                ref: "users",
                required: true
            },
            text: {
                type: String,
                required: true,
                trim: true
            },
            date: {
                type: Date,
                default: Date.now
            }
        }
    ]
});

export default mongoose.model<IPost>("posts", postSchema);
