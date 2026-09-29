require("dotenv").config();
const db = require("../config/db"),
  User = require("../models/User"),
  RP = require("../constants/rolePermissions");
(async () => {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Không được chạy tài khoản seed mặc định trong production");
  }
  await db();
  for (const [email, role, name] of [
    ["admin@gmail.com", "admin", "Admin"],
    ["manager@gmail.com", "manager", "Manager"],
    ["staff@gmail.com", "staff", "Staff"],
  ]) {
    let u = await User.findOne({ email });
    if (!u)
      u = await User.create({
        name,
        email,
        password: "12345678",
        role,
        permissions: RP[role],
      });
    else {
      u.role = role;
      u.permissions = RP[role];
      await u.save();
    }
  }
  console.log("Seed OK");
  process.exit(0);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
