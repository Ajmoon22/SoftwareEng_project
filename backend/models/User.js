const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone:    { type: String, required: true }, 

  totalRating: { type: Number, default: 0 },
  numRatings:  { type: Number, default: 0 },

  isAdmin:  { type: Boolean, default: false },
  isBlocked:{ type: Boolean, default: false }
});

userSchema.pre("save", async function(next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = function(password) {
  return bcrypt.compare(password, this.password);
};

userSchema.virtual("averageRating").get(function() {
  if (this.numRatings === 0) return 0;
  return (this.totalRating / this.numRatings).toFixed(1);
});

module.exports = mongoose.model("User", userSchema);
