FROM node:18-alpine

WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci --only=production

COPY . .

# Expose the port and run the app
EXPOSE 3000
CMD ["npm", "start"]
