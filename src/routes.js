const multer = require("multer");
const AuthController = require("./controllers/AuthController");
const { checkIfAdmin } = require("./utils/projectedRoute");
const { DanhMucController } = require("./controllers/danhmuc.controller");
const router = require("express").Router();
//Khi sử dụng bộ nhớ lưu trữ, thông tin tệp sẽ chứa một trường được gọi là bộ đệm chứa toàn bộ tệp.
const storage = multer.memoryStorage();
const multerUpload = multer({ storage });

router.get("/", (req, res) => res.send("Hello API Ecommerce"));
/**
 * Authentication
 */
router.post("/signup", AuthController.signUp);
router.post("/auth/login", AuthController.login);
router.post("/logout", AuthController.logout);
router.post("/forgot-password", AuthController.forgotPassword);
router.post("/reset-password", AuthController.resetPassword);
/*
 *User
 */

/*
 * Danh mục
 */

router.post("/danhmuc", checkIfAdmin, DanhMucController.create);
router.delete("/danhmuc/:id", checkIfAdmin, DanhMucController.delete);
router.put("/danhmuc/:id", checkIfAdmin, DanhMucController.update);
router.get("/danhmuc/search", DanhMucController.listPaginate);
router.get("/danhmuc/all", DanhMucController.getAllCategories);

/* Dashboard */
module.exports = router;
