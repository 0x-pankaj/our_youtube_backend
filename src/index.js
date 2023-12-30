import "dotenv/config";

import connectDB from "./db/index.js";
import { app } from "./app.js";

connectDB()
  .then(() => {
    app.on("error: ", (error) => {
      console.log("error: ", error);
      process.exit(1);
    });
    app.listen(process.env.PORT || 7000, () => {
      console.log(`App is listening on Port : `, process.env.PORT || 7000);
    });
  })
  .catch((error) => {
    console.log("MONGO_DB connection failed : ", error);
    process.exit(1);
  });

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
