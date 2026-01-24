import mongoose from 'mongoose';

const FileSchema = new mongoose.Schema({
    path: {
        type: String, 
        required: true,
    },

    name: {
        type: String, 
        required: true,
    },

    originalName: {
        type: String,
        required: true,
    },

    size: {
        type: Number,
        required: true,
    },

    mimetype: {
        type: String,
        required: true,
    },

    downloadCount: {
        type: Number,
        required: true,
        default: 0,
    },

    password: {
        type: String,
        default: null,
    },

    expiresAt: {
        type: Date,
        default: null,
    },

    uploadedAt: {
        type: Date,
        default: Date.now,
    }
});

// Index for automatic cleanup of expired files
FileSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const File = mongoose.model("File", FileSchema);

export default File;