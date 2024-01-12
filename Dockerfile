
FROM node:18

WORKDIR /app

COPY . /app/

RUN npm install

EXPOSE ${PORT}

CMD [ "nodemon", "src/index" ]