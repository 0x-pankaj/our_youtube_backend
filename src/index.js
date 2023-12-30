
import 'dotenv/config';

import connectDB from './db/index.js';



connectDB();


















/* console.log(process.env);
import express from 'express';
const app = express();

;( async()=> {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("Error: ", (error) => {
            console.log("Error: ", error);
            throw error
        })

        app.listen(process.env.PORT, ()=> {
            console.log(`App is listening on port ${process.env.PORT}`);
        })
    } catch (error) {
        console.log("Error: ", error);
        throw error;
    }
})()

*/
