# Use Node 20 base image
FROM node:20

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the app
COPY . .

# Build the app using Nest CLI + SWC
RUN npm run build

# Expose NestJS port
EXPOSE 3000

# Start the app
CMD ["node", "dist/main.js"]
