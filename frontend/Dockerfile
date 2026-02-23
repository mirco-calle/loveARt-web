# Dockerfile
# Development stage
FROM node:20-alpine as development
WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./

# Install dependencies with frozen lockfile
RUN yarn install --frozen-lockfile

# Copy source code
COPY . .

EXPOSE 5173
CMD ["yarn", "dev", "--host"]

# Build stage
FROM node:20-alpine as builder
WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy source code
COPY . .

# Build con variables de entorno
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN yarn build

# Production stage
FROM caddy:2.7-alpine AS production

# Copy built assets
COPY --from=builder /app/dist /usr/share/caddy

# Copy Caddyfile
COPY Caddyfile /etc/caddy/Caddyfile

# Expose port (Railway uses PORT env var)
EXPOSE 80

# Caddy runs automatically, no need for CMD