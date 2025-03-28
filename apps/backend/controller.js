import User from "./model/user.js";

function generateReferralCode(length = 6) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"; // Uppercase letters & numbers
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};
// (async()=>{
//   await User.deleteMany();
//   console.log("delete many")
// })()
const controller = {
  async connect_wallet(req, res) {
    try {
      const values = {...req.body, reffer_code:generateReferralCode()};
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

  async generate_refferal_code (req, res) {
    try {
      const {wallet_address}=req.body;
      let user =await User.findOne({ wallet_address: wallet_address });
      const reffer_code=generateReferralCode()
      if(!user){
        user=await User.create({
          wallet_address,
          reffer_code
        })
      }
      res.status(200).json({message:"success",code:user.reffer_code,status:true})
    } catch (error) {
      console.log(error.message)
      res.status(500).json({ message: "Error in getting user", status: false });
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