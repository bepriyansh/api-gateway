import rateLimit from "express-rate-limit";

export const limiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 min window
    max: 100 // 100 request 
})