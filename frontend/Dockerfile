# Build stage
FROM oven/bun:1 as build
WORKDIR /app

# Copy package files
COPY package.json bun.lock* ./
RUN bun install

# Copy frontend source
COPY . .

# Build the app
RUN bun run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
