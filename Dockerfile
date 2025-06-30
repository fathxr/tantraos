# Multi-stage build for production
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY server/package*.json ./server/

# Install dependencies
RUN npm ci --only=production
RUN cd server && npm ci --only=production

# Copy source code
COPY . .

# Build the frontend
RUN npm run build

# Production stage
FROM node:18-alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create app user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S tantraos -u 1001

# Set working directory
WORKDIR /app

# Copy built application
COPY --from=builder --chown=tantraos:nodejs /app/dist ./dist
COPY --from=builder --chown=tantraos:nodejs /app/server ./server
COPY --from=builder --chown=tantraos:nodejs /app/server/node_modules ./server/node_modules
COPY --from=builder --chown=tantraos:nodejs /app/package*.json ./

# Create necessary directories
RUN mkdir -p /app/logs && chown tantraos:nodejs /app/logs
RUN mkdir -p /app/uploads && chown tantraos:nodejs /app/uploads

# Switch to non-root user
USER tantraos

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node server/healthcheck.js

# Start application
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server/index.js"]