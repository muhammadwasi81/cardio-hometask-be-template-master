# Use an official Node runtime as the parent image
FROM node:14

# Set the working directory in the container to /app
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install any needed packages specified in package.json
RUN npm install

# Bundle app source inside the docker image
COPY . .

# Build the app
RUN npm run build

# Make port 3001 available to the world outside this container
EXPOSE 3001

# Define the command to run your app using CMD which defines your runtime
CMD [ "node", "dist/server.js" ]