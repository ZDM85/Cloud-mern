const ApiError = require("../exceptions/api-error");
const tokenService = require("../service/token-service");


module.exports = function(req, res, next) {
    try {
        const authorizationHeader = req.headers.authorization;
        
        if (!authorizationHeader) {
            return next(ApiError.UnauthtorizedError());
        }
        const accessToken = authorizationHeader.split(" ")[1];
        if (!accessToken) {
            return next(ApiError.UnauthtorizedError());
        }
        const userData = tokenService.validationAccessToken(accessToken);
        if (!userData) {
            return next(ApiError.UnauthtorizedError());
        }
        req.user = userData;
        next();
    } catch (e) {
        return next(ApiError.UnauthtorizedError());
    }
}