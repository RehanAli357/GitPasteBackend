const express = require('express');
const { body, validationResult } = require('express-validator');
const authenticateToken = require("../Middleware/authMiddleware.js");
const { signupUser, loginUser, updateUser, deleteUser, getUser, logoutUser } = require('../Controllers/UserControllers/userControllers.js');
const router = express.Router();

const validationRules = {
    username: body('name').isLength({ min: 3 }).withMessage('Too small username'),
    password: body('password').isLength({ min: 4 }).withMessage('Password is too short')
};

router.post('/signup', [validationRules.username, validationRules.password], signupUser);

router.post('/login', [validationRules.username, validationRules.password], loginUser);

router.put('/update-user-credential', [authenticateToken, validationRules.username, body('currPassword').isLength({ min: 4 }).withMessage('Password is too short')], updateUser);

router.delete('/delete-user', [authenticateToken, validationRules.username], deleteUser);

router.post('/get-user', [authenticateToken, validationRules.username], getUser)

router.post('/logout', [authenticateToken, validationRules.username], logoutUser);


module.exports = router;
