const MODEL = {
  HOME: "Home",
  HOME_TYPE: "HomeType",
  HOME_FEE: "HomeFee",
  USER: "User",
  REFRESH_TOKEN: "RefreshToken",
  PROVINCE: "Province",
  AMENITY: "Amenity",
  AMENITY_TYPE: "AmenityType",
  DANH_MUC: "DanhMuc",
  COLOR: "MauSac",
  PRODUCT: "SanPham",
};
const STATUS = {
  ACTIVE: "active",
  REJECT: "reject",
};
const ROLE = {
  USER: "user",
  ADMIN: "admin",
  HOST: "host",
};
const RULE = {
  ALL_DAYS: 0,
  WEEKDAY: 1,
  WEEKEND: 2,
  CUSTOM_DATE: 3,
};
const orderStatus = {
  cash: "Tiền mặt",
  zalopay: "Zalopay",
};
const ROLES = Object.values(ROLE);
const RULES = Object.values(RULE);
const STATUSES = Object.values(STATUS);
module.exports = {
  MODEL,
  ROLES,
  ROLE,
  RULES,
  RULE,
  STATUSES,
  STATUS,
  orderStatus,
};
