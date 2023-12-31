import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs';
          

/*
cloudinary.config({ 
  cloud_name: `${process.env.CLOUDINARY_CLOUD_NAME}`, 
  api_key: `${process.env.CLOUDINARY_API_KEY}`, 
  api_secret: `${process.env.CLOUDINARY_API_SECRET}` 
});

*/

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
  });


  const uploadOnCloudinary = async (localFilePath) => {
    try {
        // console.log("init in cloudinary");
        if(!localFilePath) return null
        // console.log("passed if case not localfilepath");
        //upload the file on cloudinary

        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        //file has been uploaded successfully 
        // console.log(" file uploaded on cloudinary : ", response.url)
        fs.unlinkSync(localFilePath);
        return response;
        
    } catch (error) {
        fs.unlinkSync(localFilePath); //remove the locally saved temp file as upload operation got failed
        return null;
    }
  }

  export { uploadOnCloudinary}

  /*
  cloudinary.v2.uploader.upload("https://upload.wikimedia.org/wikipedia/commons/a/ae/Olympic_flag.jpg",
  { public_id: "olympic_flag" }, 
  function(error, result) {console.log(result); });
  */