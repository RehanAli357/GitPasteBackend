const { validationResult } = require('express-validator');
const UserDetails = require("../../Cluster/Schema/userSchema");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createUserInstance } = require('../FileControllers/fileControllers')
const signupUser = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array(), status: false });
    }

    const hashPswd = await bcrypt.hash(req.body.password, 8);
    try {
        let data = await UserDetails.create({
            name: req.body.name,
            password: hashPswd,
            storage: 50,
            left: 50
        });
        if (data) {
        //remove the createinstance to rewart
            createUserInstance(req, res).then(() => {
                return res.status(200).json({ message: "User created successfully", status: true });
            }).catch((error)=>{
                return res.status(500).json({message:"Error in Creating User",status:false})
            })
        } else {
            return res.status(403).json({ message: "USer already exists", status: false });
        }
    } catch (err) {
        return res.status(500).json({ message: "Internal Server Error", status: false });
    }
}

const loginUser = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const user = await UserDetails.findOne({ name: req.body.name });

        if (user) {
            const isMatch = await bcrypt.compare(req.body.password, user.password);
            if (isMatch) {
                const payload = {
                    userId: user._id,
                    username: user.name
                };

                const expiryTime = {
                    expiresIn: '24h'
                };

                const token = jwt.sign(payload, process.env.JWT_SECRET, expiryTime);

                user.token = token;
                await user.save();

                res.status(200).json({ message: "Login successful", token, status: true });
            } else {
                res.status(401).json({ message: "Invalid password", status: false });
            }
        } else {
            res.status(404).json({ message: "User not found", status: false });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error", status: false });
    }
}

const updateUser = async (req, res) => {
    const err = validationResult(req);

    try {
        if (!err.isEmpty()) {
            return res.status(400).json({ error: err.array(), status: false });
        } else {
            const user = await UserDetails.findOne({ name: req.body.name });
            if (user) {
                const isMatch = await bcrypt.compare(req.body.currPassword, user.password);
                if (isMatch) {
                    user.name = req.body.updatedName;
                    user.password = await bcrypt.hash(req.body.newPassword, 8);
                    await user.save();
                    res.status(200).json({ message: "Credentials updated", status: true });
                } else {
                    return res.status(403).json({ message: "Invalid Current Password", status: false });
                }
            } else {
                res.status(404).json({ message: "No such user found", status: false });
            }
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error", status: false });
    }
}

const deleteUser = async (req, res) => {
    const err = validationResult(req)
    try {
        if (!err.isEmpty()) {
            return res.status(400).json({ message: err.array(), status: false })
        } else {
            let user = await UserDetails.findOne({ name: req.body.name })

            if (user) {
                await user.deleteOne({ name: req.body.name }).then(() => {
                    return res.status(200).json({ message: "User deleted successfully", status: true })
                }).catch((err) => {
                    return res.status(500).json({ message: err, status: false })
                })
            } else {
                return res.status(403).json({ message: "No such user found", status: false })
            }
        }

    } catch (error) {
        return res.status(500).json({ message: "Internal server Error", status: false })
    }
}

const getUser = async (req, res) => {
    let err = validationResult(req)
    try {
        if (!err.isEmpty()) {
            return res.status(400).json({ message: err.array(), status: false })
        } else {
            let user = await UserDetails.findOne({ name: req.body.name }).select(['name', 'storage', 'left', 'token'])
            if (user) {
                delete user.password;
                return res.status(200).json({ status: true, user })
            } else {
                return res.status(403).json({ message: "User not found", status: false })
            }
        }
    } catch (error) {
        return res.status(500).json({ message: "Internal server Error", status: false })
    }
}

const logoutUser = async (req, res) => {
    let err = validationResult(req)
    try {
        if (!err.isEmpty()) {
            return res.status(400).json({ message: err.array(), status: false })
        } else {
            let user = await UserDetails.findOne({ name: req.body.name })
            if (user) {
                user.token = ''
                await user.save()
                return res.status(200).json({ message: "Logout Success", status: true })
            } else {
                return res.status(403).json({ message: "User not found", status: false })
            }
        }
    } catch (error) {
        return res.status(500).json({ message: "Internal server Error", status: false })
    }
}
module.exports = { signupUser, loginUser, updateUser, deleteUser, getUser, logoutUser }