import db from "../config/db.js";

const schema = new db.Schema(
  {
    wallet_address: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    name: {
      type: String,
      trim: true,
    },
    password: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      trim: true,
      enum:['admin', 'user', 'super admin']
    },
    reffer_code: {
      type: String,
      // required: true,
      trim: true,
    },
    reffer_by: {
      type: String,
      trim: true,
      ref: "User",
    },
  },
  {
    timestamps: true,
    collection: "users",
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
schema.virtual("referrals", {
  ref: "User",
  localField: "reffer_code",
  foreignField: "reffer_by",
  options: {
    sort: { order: 1 },
    lean: true,
  },

});

const User = db.model("User", schema);
User.syncIndexes().catch((e) => console.log(e));

export default User;