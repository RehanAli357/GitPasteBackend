const { validationResult } = require('express-validator');
const path = require('path');
const FileFolder = require('../../Cluster/Schema/allDataSchema');
const uploadFile = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array(), status: false });
        }

        const userName = req.body.userName;
        const folderName = req.body.folderName;

        let data = await FileFolder.findOne({ userName: userName });
        if (!data) {
            return res.status(400).json({ message: "No Such User name found", status: false })
        } else {
            const foundItem = data.folders.findIndex((item) => item.folderName === req.body.folderName);
            if (foundItem === -1) {
                return res.status(400).json({ message: "This folder does not present, please create this folder", status: false })
            } else {
                const zipFile = req.file;
                const newFile = {
                    fileName: zipFile.originalname,
                    fileSize: zipFile.size,
                    fileData: zipFile.buffer,
                    fileKey: ''
                }
                data.folders[foundItem].files.push(newFile)
            }
            data.save().then(() => {
                return res.status(200).json({ message: "Uploaded Successfully", status: true })
            }).catch((err) => {
                return res.status(400).json({ message: "Upload unsuccessfull", error: err.message, status: false })
            })
        }
    } catch (error) {
        return res.status(500).json({
            message: "Internal server error",
            status: false,
            error: error.message || "An error occurred during file processing",
        });
    }
}

const createFolder = async (req, res) => {
    const err = validationResult(req);
    try {
        if (!err.isEmpty()) {
            return res.status(400).json({ errors: err.array(), status: false });
        } else {
            let data = await FileFolder.findOne({ userName: req.body.userName });
            if (!data) {
                const newFileFolder = new FileFolder({
                    userName: req.body.userName,
                    folders: [{
                        folderName: req.body.folderName,
                        files: []
                    }]
                });

                await newFileFolder.save();
            } else {
                const foundItem = data.folders.find((item) => item.folderName === req.body.folderName);
                if (foundItem) {
                    return res.status(400).json({ message: "This folder already present", status: false })
                } else {
                    const newProject = {
                        folderName: req.body.folderName,
                        files: []
                    };
                    data.folders.push(newProject);
                    await data.save().then(() => {
                        return res.status(200).json({ message: "Created Successfully", status: true })
                    }).catch((err) => {
                        return res.status(400).json({ message: "Create unsuccessfull", error: err.message, status: false })
                    })
                }
            }
        }
    } catch (error) {
        return res.status(500).json({ message: "Internal server error", status: false });
    }
}

const getFileFolder = async (req, res) => {
    const err = validationResult(req);
    try {
        if (!err.isEmpty()) {
            return res.status(400).json({ errors: err.array(), status: false });
        } else {
            let data = await FileFolder.findOne({ userName: req.body.userName });
            if (!data) {
                return res.status(400).json({ message: "No Such UserName Found", status: false });
            }
            return res.status(200).json({ message: "Success", status: true, data });
        }
    } catch (error) {
        return res.status(500).json({ message: "Internal server error", status: false });
    }
}

const deleteFolder = async (req, res) => {
    const err = validationResult(req);
    try {
        if (!err.isEmpty()) {
            return res.status(400).json({ errors: err.array(), status: false });
        } else {
            let data = await FileFolder.findOne({ userName: req.body.userName });
            if (data) {
                let folderIndex = data.folders.findIndex(folder => folder.folderName === req.body.folderName);
                if (folderIndex !== -1) {
                    data.folders.splice(folderIndex, 1);
                    await data.save().then(() => {
                        return res.status(200).json({ message: "Folder deleted successfully", status: true });
                    }).catch((error) => {
                        return res.status(400).json({ message: "Folder not deleted", status: false, error: error.message });
                    })
                } else {
                    return res.status(400).json({ message: "No Such Folder Found", status: false });
                }
            } else {
                return res.status(400).json({ message: "No Such UserName Found", status: false });
            }
        }
    } catch (error) {
        return res.status(500).json({ message: "Internal server error", status: false });
    }
}

const deleteFile = async (req, res) => {
    const err = validationResult(req)
    try {
        if (!err.isEmpty()) {
            return res.status(400).json({ errors: err.array(), status: false });

        } else {
            let data = await FileFolder.findOne({ userName: req.body.userName });
            if (data) {
                let updatedDataIndex = data.folders.findIndex(folder => folder.folderName === req.body.folderName);

                if (updatedDataIndex !== -1) {
                    let fileIndex = data.folders[updatedDataIndex].files.findIndex(file => file._id.toString() === req.body.fileId);
                    if (fileIndex !== -1) {
                        await FileFolder.updateOne(
                            { userName: req.body.userName, 'folders.folderName': req.body.folderName },
                            { $pull: { 'folders.$.files': { _id: req.body.fileId } } }
                        );
                        return res.status(200).json({ message: "Deleted Successfully", status: true });
                    } else {
                        return res.status(400).json({ message: "No Such File Found", status: false });
                    }
                } else {
                    return res.status(400).json({ message: "No Such Folder Found", status: false });
                }
            } else {
                return res.status(400).json({ message: "No Such UserName Found", status: false });
            }

        }
    } catch (error) {
        return res.status(500).json({ message: "Internal server error", status: false });
    }
}

const updateFile = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array(), status: false });
        }
        else {
            let data = await FileFolder.findOne({ userName: req.body.userName })
            if (data) {
                const folderIndex = data.folders.findIndex((item) => item.folderName === req.body.folderName);
                if (folderIndex != -1) {
                    const fileIndex = data.folders[folderIndex].files.findIndex((data) => data._id.toString() === req.body.fileId)
                    data.folders[folderIndex].files[fileIndex].size = req.file.size
                    data.folders[folderIndex].files[fileIndex].fileName = req.file.originalname
                    data.folders[folderIndex].files[fileIndex].fileData = req.file.buffer
                    await data.save().then(() => {
                        return res.status(200).json({ message: "Updated Successfully", status: true, fileSize: req.file.size, fileName: req.file.originalname, fileData: req.file.buffer })
                    }).catch((err) => {
                        return res.status(400).json({ message: "Update unsuccessfull", error: err.message, status: false })
                    })
                } else {
                    return res.status(403).json({ message: "No Succh file or folder found", status: false })
                }
            } else {
                return res.status(400).json({ message: "No Such userName Found", status: false });
            }
        }
    } catch (error) {
        return res.status(500).json({
            message: "Internal server error",
            status: false,
            error: error.message || "An error occurred during file processing",
        });
    }
}

const updateFolder = async (req, res) => {
    try {
        let data = await FileFolder.findOne({ userName: req.body.userName })
        if (data) {
            const folderIndex = data.folders.findIndex((item) => item.folderName === req.body.folderName);
            if (folderIndex !== -1) {
                data.folders[folderIndex].folderName = req.body.updatedFolderName
                data.save().then(() => {
                    return res.status(200).json({ message: "Updated Successfully", status: true })
                }).catch((err) => {
                    return res.status(400).json({ message: "Update unsuccessfull", status: false })
                })
            } else {
                return res.status(400).json({ message: "No Such Folder Found", status: false });
            }
        } else {
            return res.status(400).json({ message: "No Such userName Found", status: false });
        }
    } catch (error) {
        return res.status(500).json({
            message: "Internal server error",
            status: false,
            error: error.message,
        });
    }
}

const downloadFile = async (req, res) => {
    const error = validationResult(req)
    try {
        if (!error.isEmpty()) {
            return res.status(400).json({ error: error.array(), status: false })
        } else {
            let data = await FileFolder.findOne({ userName: req.body.userName })
            if (data) {
                const folderIndex = data.folders.findIndex((item) => item.folderName === req.body.folderName)
                if (folderIndex === -1) {
                    return res.status(403).json({ error: "No Such Folder found", status: false })
                } else {
                    let fileIndex = data.folders[folderIndex].files.findIndex((data) => data._id.toString() === req.body.fileId)
                    if (fileIndex === -1) {
                        return res.status(403).json({ error: "No Such File Found", status: false })
                    } else {
                        return res.status(200).json({ data: data.folders[folderIndex].files[fileIndex], status: true })
                    }
                }
            } else {
                return res.status(400).json({ error: "No such user found", status: false })
            }
        }
    } catch (error) {
        return res.status(500).json({
            message: "Internal server error",
            status: false,
            error: error || "An error occurred during file processing",
        });
    }
}

const shareFile = async (req, res) => {
    const error = validationResult(req)
    try {
        if (!error.isEmpty()) {
            return res.status(403).json({ error: error.array(), status: false })
        } else {
            let data = await FileFolder.findOne({ userName: req.body.userName })
            if (data) {
                let folderIndex = data.folders.findIndex(item => item.folderName === req.body.folderName)
                if (folderIndex !== -1) {
                    const fileIndex = data.folders[folderIndex].files.findIndex((data) => data._id.toString() === req.body.fileId)
                    if (fileIndex !== -1) {

                        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+[]{}|;:,.<>?/';
                        let result = '';
                        for (let i = 0; i < 22; i++) {
                            const randomIndex = Math.floor(Math.random() * characters.length);
                            result += characters.charAt(randomIndex);
                        }
                        const encodedString = btoa(result);
                        data.folders[folderIndex].files[fileIndex].fileKey = encodedString
                        data.folders[folderIndex].files[fileIndex].fileDuration = req.body.duration
                        await data.save().then(() => {
                            if (req.body.type !== "ff") {
                                return res.status(200).json({ message: "Link Created", status: true, linkKey: encodedString, duration: req.body.duration })
                            }
                        }).catch((error) => res.status(400).json({ message: error.message, status: false }))
                    } else {
                        return res.status(403).json({ message: "Inavid File name", status: false })
                    }
                } else {
                    return res.status(403).json({ message: "Inavid Folder name", status: false })
                }
            } else {
                return res.status(403).json({ message: "Invalid user name", status: false });
            }
        }
    } catch (error) {
        return res.status(500).json({
            message: "Internal server error",
            status: false,
            error: error,
        });
    }
}

const accessFile = async (req, res) => {
    const err = validationResult(req);
    try {
        if (!err.isEmpty()) {
            return res.status(403).json({ error: err.array(), status: false });
        } else {
            let data = await FileFolder.findOne({ userName: req.body.userName });
            if (data) {
                const folderIndex = data.folders.findIndex((item) => item.folderName === req.body.folderName);
                if (folderIndex === -1) {
                    return res.status(403).json({ error: "No Such Folder found", status: false });
                } else {
                    let fileIndex = data.folders[folderIndex].files.findIndex((data) => data._id.toString() === req.body.fileId);
                    if (fileIndex === -1) {
                        return res.status(403).json({ error: "No Such File Found", status: false });
                    } else {
                        if (data.folders[folderIndex].files[fileIndex].fileKey === req.body.linkKey
                            && data.folders[folderIndex].files[fileIndex].fileDuration === req.body.duration) {
                            shareFile(req, res)
                            return res.status(200).json({ fileData: data.folders[folderIndex].files[fileIndex].fileData, fileName: data.folders[folderIndex].files[fileIndex].fileName })
                        } else {
                            return res.status(400).json({ message: "Data didn't match", status: false })
                        }
                    }
                }
            } else {
                return res.status(403).json({ message: "Invalid user name", status: false });
            }
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal server error",
            status: false,
            error: error.message
        });
    }
}



const easyaccess = async (req, res) => {
    const { name, folder, id, token, duration } = req.query;

    if (!name || !folder || !id || !token || !duration) {
        return res.status(400).json({ error: 'Missing parameters' });
    }

    const filePath = path.join(__dirname, '..','..', 'Views', 'fileaccess.html');

    return res.sendFile(filePath);
}

module.exports = { uploadFile, createFolder, getFileFolder, deleteFolder, deleteFile, updateFile, updateFolder, downloadFile, shareFile, accessFile, easyaccess }