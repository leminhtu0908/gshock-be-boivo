const ErrorCodes = require("../constants/errorCodes");
const passport = require("passport");
const { UserRole } = require("../constants/type");

const checkIfUser = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (err, user) => {
    if (err) {
      return next(err);
    }

    if (!user) {
      return res.status(ErrorCodes.Un_Authorized).send("Not authorized.");
    }

    req.user = user;
    return next();
  })(req, res, next);
};

const checkIfAdmin = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (err, user) => {
    if (err) {
      return next(err);
    }

    if (!user) {
      return res.status(ErrorCodes.Un_Authorized).send("Not authorized.");
    }
    const isAdmin = user.role === UserRole.Admin;

    if (!isAdmin) {
      return res
        .status(ErrorCodes.Un_Authorized)
        .send({ message: "Admin resources access denied" });
    }

    req.user = user;
    return next();
  })(req, res, next);
};
module.exports = { checkIfUser, checkIfAdmin };
