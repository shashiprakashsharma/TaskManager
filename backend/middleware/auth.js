import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

export default async function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;

    // Check header exists & starts with Bearer
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            message: "Not Authorized, token missing"
        });
    }

    const token = authHeader.split(' ')[1];

    try {
        // Verify token with .env secret
        const payload = jwt.verify(token, process.env.JWT_SECRET);

        // Attach user without password
        const user = await User.findById(payload.id).select('-password');
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found"
            });
        }

        req.user = user;
        next();
    } catch (err) {
        console.error("JWT verification failed:", err.message);
        return res.status(401).json({
            success: false,
            message: "Token invalid or expired"
        });
    }
}
