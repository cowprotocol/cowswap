import User from "./model/user.js";

const generateReferralCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};
const controller = {
  async create(req, res) {
    try {
      const values = { ...req.body, reffer_code: generateReferralCode() };
      const found = await User.findOne({ wallet_address: values.wallet_address });
      if (found) {
        return res.status(200).json({ message: "Already have an account", status: true });
      }
      const user = await User.create(values);
      res.status(200).json(user);
    } catch (error) {
        console.log(error);
      res
        .status(500)
        .json({ message: "Error in creating user", status: false });
    }
  },
  async getUser(req, res) {
    try {
      const id = req.params.id;
      const user = await User.findById(id).populate("referrals");
      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ message: "Error in getting user", status: false });
    }
  },
};


export default controller;