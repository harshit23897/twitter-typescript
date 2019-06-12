FROM node:8

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json /usr/src/app/
RUN npm install

# Copy app source
COPY src /usr/src/app/src
COPY populate_database.js /usr/src/app
COPY tsconfig.json /usr/src/app
COPY tslint.json /usr/src/app

# Compile app sources
RUN npm run build

# Expose port and CMD
EXPOSE 8080
CMD [ "npm", "start" ]