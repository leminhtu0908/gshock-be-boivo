const jwt = require("jsonwebtoken");
const passport = require("passport");
const ErrorCodes = require("../constants/errorCodes");
const ErrorMessages = require("../constants/errorMessages");
const EmailRegex = require("../constants/regex");
const bcrypt = require("bcrypt");
const {
  getUserByEmail,
  deleteUser,
  createUser,
  getAuthUser,
  updateUserResetPasswordToken,
  updatePassword,
} = require("../db/user");
const { checkEmailVerification } = require("../utils/checkEmailVerification");
const { getEmailTemplate } = require("../utils/emailTemplate");
const { sendEmail } = require("../utils/email");

const AuthController = {
  // authUser: async (req, res) => {
  //   passport.authenticate("jwt", { session: false }, async (err, user) => {
  //     if (!user) {
  //       return res.send(null);
  //     }

  //     try {
  //       const authUser = await getAuthUser(user._id);
  //       return res.send(authUser);
  //     } catch (error) {
  //       return res.send(ErrorCodes.Internal).send(ErrorMessages.Generic);
  //     }
  //   })(req, res);
  // },
  signUp: async (req, res, next) => {
    //body truyền xuống
    const { fullName, email, password } = req.body;
    if (!fullName || !email || !password) {
      return res
        .status(ErrorCodes.Bad_Request)
        .send("Vui lòng nhập đầy đủ các trường");
    }

    if (!email.match(EmailRegex)) {
      return res
        .status(ErrorCodes.Bad_Request)
        .send("Địa chỉ email không hợp lệ.");
    }
    //check email verification
    const isEmailVerificationRequired = await checkEmailVerification();
    //check email exist
    const existingUser = await getUserByEmail(email);

    if (
      (existingUser && !isEmailVerificationRequired) ||
      (existingUser && existingUser.emailVerified)
    ) {
      return res
        .status(ErrorCodes.Bad_Request)
        .send("Địa chỉ email đã được sử dụng");
    }
    if (
      existingUser &&
      isEmailVerificationRequired &&
      !existingUser.emailVerified
    ) {
      await deleteUser(existingUser._id);
    }
    const passwordHash = await bcrypt.hash(password, 10);
    //create user
    const user = await createUser(fullName, email, passwordHash);
    const token = jwt.sign(
      { user: { userId: user._id, email } },
      process.env.SECRET,
      { expiresIn: "1h" }
    );

    if (isEmailVerificationRequired) {
      try {
        const template = await getEmailTemplate({
          greeting: `Hey ${fullName}`,
          description: `Thank you for signing up. To complete your registration, please confirm your email.`,
          ctaLink: `${req.headers.origin}/email-verify?email=${email}&token=${token}`,
          ctaText: "Confirm email",
        });
        await sendEmail({
          to: email,
          subject: "Email verification",
          html: template,
        });
        return res.send("success");
      } catch (error) {
        return res.status(ErrorCodes.Internal).send(ErrorMessages.Generic);
      }
    }

    try {
      passport.authenticate("signup", { session: false }, async (err) => {
        if (err) {
          return res.status(ErrorCodes.Bad_Request).send(ErrorMessages.Generic);
        }

        const handler = await passport.authenticate("signup", {
          session: false,
        });
        req.login(
          { email, password: user.password },
          { session: false },
          async () => {
            const body = { _id: user._id, email: user.email };
            const token = jwt.sign({ user: body }, process.env.SECRET);
            res
              .cookie("token", token)
              .send({ user, token, message: "Đăng kí thành công" });
            handler(req, res, next);
          }
        );
      })(req, res, next);
    } catch (error) {
      res.send(ErrorCodes.Un_Authorized).send(ErrorMessages.Generic);
    }
  },
  login: async (req, res, next) => {
    passport.authenticate("login", async (err, user) => {
      try {
        const isEmailVerificationRequired = await checkEmailVerification();
        if (
          err ||
          !user ||
          (user && isEmailVerificationRequired && !user.emailVerified)
        ) {
          return res
            .status(ErrorCodes.Bad_Request)
            .send("Email hoặc mật khẩu không chính xác");
        }
        if (user.banned) {
          return res
            .status(ErrorCodes.Bad_Request)
            .send(
              "The account is banned. Please get in touch with support for help."
            );
        }
        req.login(user, { session: false }, async (error) => {
          if (error) return next(error);
          const body = { _id: user._id, email: user.email };
          const token = jwt.sign({ user: body }, process.env.SECRET);
          const authUser = await getAuthUser(user._id);
          return res
            .cookie("token", token)
            .send({ user: authUser, token, message: "Đăng nhập thành công" });
        });
      } catch (error) {
        return next(error);
      }
    })(req, res, next);
  },
  logout: async (req, res) => {
    if (req.cookies["token"]) {
      return res.clearCookie("token").send("Đăng xuất thành công");
    } else {
      return res.send("Đăng xuất thất bại");
    }
  },
  forgotPassword: async (req, res) => {
    const { email } = req.body; // lấy email từ body
    const user = await getUserByEmail(email); //tìm email của user
    const isEmailVerificationRequired = await checkEmailVerification(); //check email đã tồn tại hay chưa
    if (!user || (user && isEmailVerificationRequired && !user.emailVerified)) {
      return res
        .status(ErrorCodes.Bad_Request)
        .send("Địa chỉ email không tồn tại, vui lòng kiểm tra lại");
    }

    const token = jwt.sign({ user: { email } }, process.env.SECRET, {
      expiresIn: "1h",
    });
    await updateUserResetPasswordToken(user._id, token);

    const template = await getEmailTemplate({
      greeting: `Chào ${user.fullName}`,
      description: `Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu của bạn. Bạn có thể nhấp vào nút bên dưới để chọn mật khẩu mới của mình. Nếu bạn không thực hiện yêu cầu này, bạn có thể yên tâm bỏ qua thông báo này.`,
      ctaLink: `${req.headers.origin}/reset-password?email=${email}&token=${token}`,
      ctaText: "Tạo lại mật khẩu",
    });
    try {
      await sendEmail({
        to: email,
        subject: "Reset Password Request",
        html: template,
      });
      return res.send(
        `Hướng dẫn đặt lại mật khẩu đã được gửi đến địa chỉ email : ${email}`
      );
    } catch (error) {
      return res.status(ErrorCodes.Internal).send(ErrorMessages.Generic);
    }
  },
  resetPassword: async (req, res) => {
    const { password, token, email } = req.body;
    let decoded = null;

    try {
      decoded = await jwt.verify(token, process.env.SECRET);
    } catch (error) {
      return res.status(ErrorCodes.Bad_Request).send("Liên kết đã hết hạn");
    }

    const user = await getUserByEmail(decoded.user.email);
    if (!user) {
      return res
        .status(ErrorCodes.Bad_Request)
        .send("Đặt lại mật khẩu không thành công do đối số không hợp lệ.");
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await updatePassword(user._id, passwordHash);

    req.login({ email, password }, { session: false }, async () => {
      const body = { _id: user._id, email: user.email };
      const token = jwt.sign({ user: body }, process.env.SECRET);
      return res
        .cookie("token", token)
        .send({ user, token, message: "Đặt lại mật khẩu thành công" });
    });
  },
};

module.exports = AuthController;
