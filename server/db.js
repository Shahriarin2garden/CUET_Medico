const mongoose= require('mongoose');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const connectDB= async () =>{
    try {
        const uri = `mongodb+srv://${process.env.DB_USER_S}:${process.env.DB_PASSWORD_S}@cluster0.vsegh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
        const conn= await mongoose.connect(uri)
            console.log(`MongoDB Connected: ${conn.connection.host}`);

        
    }
    catch(error){
        console.error(error);
        process.exit(1)
    }
}
module.exports=connectDB