const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const authenticateToken = require('../Middleware/authMiddleware.js');
const multer = require('multer');
const { uploadFile, createFolder, getFileFolder, deleteFolder, deleteFile, updateFile, updateFolder, downloadFile, shareFile, accessFile, easyaccess, createUserInstance } = require('../Controllers/FileControllers/fileControllers.js');

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
});

const validationRules = [
    body('userName').isLength({ min: 3 }).withMessage('Too small username'),
    body('file').isEmpty().withMessage('Please upload a zip file'),
    body('folderName').isLength({ min: 3 }).withMessage('Please enter a folder name'),
    body('fileId').isLength({ min: 4 }).withMessage('FileId is not valid'),
    body('duration').isInt({ min: 5, max: 1440 }).withMessage('Duration must be between 5 to 1440 minutes')
];

//here
router.post('/user-instance', [authenticateToken, validationRules[0]], createUserInstance);

router.post('/upload-file', [authenticateToken, upload.single('file'), validationRules[0], validationRules[1], validationRules[2]], uploadFile);

router.post('/create-folder', [authenticateToken], createFolder);

router.post('/get-files&folder', [authenticateToken, validationRules[0]], getFileFolder);

router.delete('/delete-folder', [authenticateToken, validationRules[0], validationRules[2]], deleteFolder);

router.delete('/delete-file', [authenticateToken, validationRules[0], validationRules[2], validationRules[3]], deleteFile);

router.put('/update-file', [authenticateToken, upload.single('file'), validationRules[0]], updateFile);

router.put('/update-folder', [authenticateToken, validationRules[0], validationRules[2]], updateFolder);

router.post('/download-file', [authenticateToken, validationRules[0], validationRules[2], validationRules[3]], downloadFile);

router.post('/file-share', [authenticateToken, validationRules[0], validationRules[2], validationRules[3], validationRules[4]], shareFile);

router.post('/access-file', [validationRules[0], validationRules[2], validationRules[3]], accessFile);

router.get('/easyaccess', [validationRules[0], validationRules[3], validationRules[4]], easyaccess)

module.exports = router;