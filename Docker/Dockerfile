# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
# build args
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
# only during build so not baked into image
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
# Copy package files first for better layer caching
COPY package*.json ./
RUN npm ci --legacy-peer-deps
COPY . .
RUN npm run build


# Production stage
FROM node:20-alpine AS production
WORKDIR /app
# create non-root user
RUN adduser -D appuser
# COPY --from=builder /app/node_modules ./node_modules 
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
# Switch to non-root user
USER appuser
HEALTHCHECK CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1
# Set environment
ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000
CMD ["node", "server.js"]