const mongoose = require('mongoose');

const filesSchema = new mongoose.Schema({
    fileName: {
        type: String,
        required: [true, "File name cant be NULL"],
    },
    fileSize: {
        type: Number,
        required: [true, "File size cant be NULL"],
    },
    fileData: {
        type: Buffer,
        required: [true, "File data cant be NULL"],
    },
    fileKey: {
        type: String,
        unique: true,
    },
    fileDuration:{
        type:Number,
        require:[true,"File duration can't be NULL"],
        min:5,
        max:1440
    }
})

const foldersSchema = new mongoose.Schema({
    folderName: {
        type: String,
        required: [true, "Folder name cant be NULL"],
    },
    files: [filesSchema]
})

const allDataSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: [true, "Username can't be NULL"],
        unique: true
    },
    folders: [foldersSchema]
})

const FileFolder = mongoose.model('fileFolder', allDataSchema);
module.exports = FileFolder;
