FROM node:18-alpine

WORKDIR /app

# Install global dependencies
RUN npm install -g serve

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY . .

# Build for web
RUN npx expo export -p web

# Expose port
EXPOSE 3000

# Serve the build
CMD ["serve", "-s", "dist", "-l", "3000"]
