
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files first 
COPY package*.json ./
RUN npm ci --only=production --legacy-peer-deps


COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production --legacy-peer-deps && npm cache clean --force


COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Set environment
ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

CMD ["npm", "start"]


