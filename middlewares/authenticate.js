const jwt = require('jsonwebtoken');

const authenticate = (request , response , next ) => {
    let token = request.header('x-auth-token');
    if(!token){
        return response.status(401).json({msg : 'No Token , Authentication Denied'});
    }
    try {
        let decoded = jwt.verify(token , process.env.JWT_SECRET_KEY);
        request.user = decoded.user;
        next();
    }
    catch (error) {
        return response.status(401).json({msg : 'Invalid Token'});
    }
};
module.exports = authenticate;