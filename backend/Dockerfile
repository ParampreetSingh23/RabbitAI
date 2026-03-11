# ---- Backend Dockerfile ----
# Uses node:20-alpine for a slim image.
# Runs as non-root user for security.

FROM node:20-alpine AS base

# Create a non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copy package files first (layer caching)
COPY package.json package-lock.json* ./

# Install only production dependencies
RUN npm ci --omit=dev

# Copy source code
COPY . .

# Own files as non-root user
RUN chown -R appuser:appgroup /app

USER appuser

EXPOSE 5001

CMD ["node", "server.js"]
