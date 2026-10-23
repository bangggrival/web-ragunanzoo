FROM node:20-alpine

# Install build dependencies for native modules (bcrypt)
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy package files first for better Docker layer caching
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy source code
COPY . .

# Remove dev files
RUN rm -f .env.example

# Create uploads directory and enforce unprivileged user ownership
RUN mkdir -p /app/uploads && chown -R node:node /app

# Switch to unprivileged non-root user
USER node

ENV PORT=5005
ENV NODE_ENV=production
EXPOSE 5005

# Healthcheck
HEALTHCHECK --interval=15s --timeout=5s --retries=3 --start-period=10s \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5005/api/health || exit 1

CMD ["npm", "start"]
