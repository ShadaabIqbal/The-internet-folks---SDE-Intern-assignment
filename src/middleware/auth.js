const jwt = require('jsonwebtoken')


const authentication = async function (req, res, next) {
    try {
        let authHeader = req.headers["authorization"];
        if (!authHeader) {
            return res.status(401).send({ status: false, Error: "Enter Token in Bearer Token" });
        }

        const bearer = authHeader.split(" ");
        const bearerToken = bearer[1];

        jwt.verify(bearerToken, 'mysignature', function (error, decodedToken) {
            if (error) {
                return res.status(401).send({ status: false, message: "Invalid token coming from header or token may be expired." })
            } else {
                req.decodedToken = decodedToken;
                return next()
            }
        })
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}


module.exports = { authentication }