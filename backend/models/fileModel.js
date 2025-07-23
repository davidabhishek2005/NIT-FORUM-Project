
const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
    classId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Classroom',
        required: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    filename: String,
    filetype: String,
    filedata: Buffer,
    note: String,
    uploadedAt: {
        type: Date,
        default: Date.now
    }
});

const fileModel = mongoose.model('File', fileSchema);


module.exports = mongoose.model('File', fileSchema);
