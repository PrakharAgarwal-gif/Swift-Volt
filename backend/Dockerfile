FROM node:20-alpine
WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Expose API port
EXPOSE 3001

# Start the server
CMD ["npm", "start"]
