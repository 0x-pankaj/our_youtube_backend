


# YouTube-like App Backend

Welcome to the backend repository of our YouTube-like app. This backend is responsible for managing video uploads, fetching videos, and more. Below, you'll find detailed information about the technologies used and how to get started.

## Technologies Used

- **Language:** JavaScript
- **Backend Framework:** Express.js
- **Database:** MongoDB
- **ORM:** Mongoose
- **Storage:** Cloudinary

## Key Features

- ** Video Management **
- ** Playlist Managmet **
- ** User Interaction **
    - *** Likes on videos ***
    - *** Comment on Videos **
- ** Tweet Segment ** 
    - *** user tweet like on tweeter ***
    - *** like on Tweet ***

## Prerequisites

Make sure you have the following installed on your machine:

- [Node.js](https://nodejs.org/)
- [npm](https://www.npmjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [A Cloudinary account](https://cloudinary.com/)

## Getting Started

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/0x-pankaj/our_youtube_backend.git
   cd our_youtube_backend
   ```


## Install Dependencies 
```bash
    npm install
```
## Set Up Environment Variables
 
- **PORT**=8000
- **MONGODB_URI**=mongodb+srv://<username>:<password>@cluster0.vznzlsd.mongodb.net
- **CORS_ORIGIN**= *
- **ACCESS_TOKEN_SECRET**=d7vm4vBCvetpCbJENpUpvojqp50iGPYDm7yM
- **ACCESS_TOKEN_EXPIRY**=1d
- **REFRESH_TOKEN_SECRET**=o7JeWjtQxroLtbHSHtoFt1cecpMvCtsRB4E=
- **REFRESH_TOKEN_EXPIRY**=10d

- **CLOUDINARY_CLOUD_NAME**=cloudname
- **CLOUDINARY_API_KEY**=api_key
- **CLOUDINARY_API_SECRET**=api_secret


## Run The Server
** From Root
```bash
    npm run dev
```
   

## Api Structure
-  [API-REFERENCRE](https://documenter.getpostman.com/view/25927324/2s9YsMBXPn) 

## MongoDB Aggregation Pipeline
** We leverage MongoDB's aggregation pipeline for efficient data processing and retrieval. **


