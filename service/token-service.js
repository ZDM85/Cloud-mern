const jwt = require("jsonwebtoken");
const tokenModel = require("../models/token-model");

class TokenService {
    generateTokens(payload) {
        const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {expiresIn: "30m"});
        const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {expiresIn: "30d"});
        return {
            accessToken,
            refreshToken
        }
    }

    async saveToken(userId, refreshToken) {
        const tokenData = await tokenModel.findOne({user: userId});
        if (tokenData) {
            tokenData.refreshToken = refreshToken;
            await tokenData.save();
        }
        const token = await tokenModel.create({user: userId, refreshToken});
        return token;
    }

    async removeToken(refreshToken) {
        const tokenData = await tokenModel.deleteOne({refreshToken});
        return tokenData; 
    }

    validationAccessToken(token) {
        try {
            const accessToken = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
            return accessToken;
        } catch (e) {
            return null;
        }
        
    }

    validationRefreshToken(token) {
        try {
            const refreshToken = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
            return refreshToken;
        } catch (e) {
            return null;
        }
    }

    async findToken(refreshToken) {
        const token = await tokenModel.findOne({refreshToken});
        return token;
    }
}


module.exports = new TokenService();