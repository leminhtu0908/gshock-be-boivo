const multer = require("multer");
const AuthController = require("./controllers/AuthController");
const { checkIfAdmin, checkIfUser } = require("./utils/projectedRoute");
const { DanhMucController } = require("./controllers/danhmuc.controller");
const { UserController } = require("./controllers/user.controller");
const { BannerController } = require("./controllers/banner.controller");
const { ColorController } = require("./controllers/color.controller");
const { OrdersController } = require("./controllers/order.controller");
const { ProductController } = require("./controllers/product.controller");
const router = require("express").Router();
//Khi sử dụng bộ nhớ lưu trữ, thông tin tệp sẽ chứa một trường được gọi là bộ đệm chứa toàn bộ tệp.
const storage = multer.memoryStorage();
const multerUpload = multer({ storage });

router.get("/", (req, res) => res.send("Hello API Ecommerce"));
/**
 * Authentication
 */
router.post("/auth/register", AuthController.signUp);
router.post("/auth/login", AuthController.login);
router.post("/logout", AuthController.logout);
router.post("/forgot-password", AuthController.forgotPassword);
router.post("/reset-password", AuthController.resetPassword);
/*
 *User
 */
router.put(
  "/users1/:id",
  multerUpload.single("image"),
  UserController.updateUser
);
router.get("/users1/search", checkIfAdmin, UserController.listPaginate);
router.get("/users1/find-user-by-id", UserController.getUserById);
/*
 * Danh mục
 */

router.post("/danhmuc", checkIfAdmin, DanhMucController.create);
router.delete("/danhmuc/:id", checkIfAdmin, DanhMucController.delete);
router.put("/danhmuc/:id", checkIfAdmin, DanhMucController.update);
router.get("/danhmuc/search", DanhMucController.listPaginate);
router.get("/danhmuc/all", DanhMucController.getAllCategories);

/*
 * Banner
 */

router.post(
  "/banner",
  [checkIfAdmin, multerUpload.single("image")],
  BannerController.uploadBanner
);
router.delete("/banner/:id", checkIfAdmin, BannerController.deleteBanner);
router.get("/banner/search", BannerController.listPaginate);
router.get("/banner/all", BannerController.getAllBanner);

/*
 * Color
 */

router.post("/color", checkIfAdmin, ColorController.create);
router.delete("/color/:id", checkIfAdmin, ColorController.delete);
router.put("/color/:id", checkIfAdmin, ColorController.update);
router.get("/color/search", ColorController.listPaginate);
router.get("/color/all", ColorController.getAllColor);

/*
 * Order
 */

router.post("/order", checkIfUser, OrdersController.create);
router.put("/order/deleteorder/:id", OrdersController.xoaDonHangUser);
router.put(
  "/order/duyetDonHang/:id",
  checkIfAdmin,
  OrdersController.duyetDonHang
);
router.get("/order/search", OrdersController.listPaginate);
router.get("/order/orderhistory", OrdersController.getAllOrderByUser);

/*
 * Product
 */

router.post(
  "/product",
  [checkIfAdmin, multerUpload.single("image")],
  ProductController.create
);
router.delete("/product/:id", checkIfAdmin, ProductController.delete);
router.put(
  "/product/:id",
  [checkIfAdmin, multerUpload.single("image")],
  ProductController.update
);
router.put(
  "/product/updateStatus/:id",
  checkIfAdmin,
  ProductController.updateStatus
);
router.get("/product/search", ProductController.listPaginate);
router.get("/product/all", ProductController.getAllProduct);
router.get("/product/detail-product/:id", ProductController.getDetailProduct);
/* Dashboard */
module.exports = router;
