const mongoose = require("mongoose"),
  bcrypt = require("bcryptjs");
const schema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxLength: 100 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    phone: { type: String, trim: true },
    password: { type: String, required: true, minLength: 8, select: false },
    avatar: { type: String, default: "" },
    role: {
      type: String,
      enum: ["customer", "staff", "manager", "admin"],
      default: "customer",
    },
    permissions: { type: [String], default: [] },
    status: {
      type: String,
      enum: ["active", "blocked", "inactive"],
      default: "active",
    },
    lastLoginAt: Date,
    passwordChangedAt: Date,
  },
  { timestamps: true },
);
schema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordChangedAt = new Date();
  next();
});
schema.methods.comparePassword = function (p) {
  return bcrypt.compare(p, this.password);
};
schema.methods.safe = function () {
  const o = this.toObject();
  delete o.password;
  delete o.__v;
  return o;
};
module.exports = mongoose.model("User", schema);
