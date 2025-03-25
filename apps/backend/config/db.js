import { Mongoose} from "mongoose";
import 'dotenv/config';

const uri=process.env.MONGODB_URI

const db=new Mongoose()
db.connect(uri).then(()=>console.log("🛢️ Connected to db"))

export default db