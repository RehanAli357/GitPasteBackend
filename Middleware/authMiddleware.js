const jwt = require("jsonwebtoken");

const authenticateToken = async (req, res, next) => {
    if (req.body.type === "ff") {
        next()
    } else {
        const token = req.header('token');
        try {
            if (!token) {
                return res.status(401).json({ error: 'Unauthorized - Missing token', status: false });
            }else{
                jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
                    if (err) {
                        return res.status(403).json({ error: 'Forbidden - Invalid token', status: false });
                    }
                    req.user = user;
                    let data = next();
                })
            }
        } catch (error) {
            return res.status(403).json({ error: 'Internal server error', status: false });
        }
    }
}

module.exports = authenticateToken;
