# Use an official Node.js runtime as a parent image
FROM node:24-alpine AS builder

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and yarn.lock
COPY package.json yarn.lock ./

# Install dependencies (including devDependencies for build)
RUN yarn install

# Copy the rest of the application source code
# Ensure .dockerignore is in place to avoid copying node_modules, .git, etc.
COPY . .

# Build the TypeScript code
RUN yarn build

# --- Production Stage ---
FROM node:24-alpine

WORKDIR /usr/src/app

# Copy package.json and yarn.lock for production dependencies
COPY package.json yarn.lock ./

# Install only production dependencies
# This ensures a smaller image by not including devDependencies
RUN yarn install --production

# Copy built artifacts from the builder stage
COPY --from=builder /usr/src/app/build ./build

# The application listens on port 3000 by default for HTTP mode
EXPOSE 3000

# Environment variables that are needed at runtime
ENV NODE_ENV=production
ENV MODE=HTTP

# Command to run the application
CMD ["node", "build/index.js"]