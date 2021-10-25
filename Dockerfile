FROM node:alpine3.12

RUN mkdir -p /usr/src/app


# Create work directory
WORKDIR /usr/src/app

COPY package*.json ./


# Install app dependencies 
RUN npm install 

# Copy app source to work directory
COPY . /usr/src/app

LABEL name="food-delivery" version="1.0"


CMD [ "npm", "start" ]

EXPOSE 8000