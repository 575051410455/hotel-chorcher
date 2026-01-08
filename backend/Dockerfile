FROM oven/bun:1 as base
WORKDIR /app

# Install dependencies
COPY package.json bun.lock* ./
COPY backend ./backend
COPY drizzle ./drizzle
COPY drizzle.config.ts ./
COPY tsconfig.json ./

RUN bun install

# Expose port
EXPOSE 3000

# Run the app
CMD ["bun", "run", "start"]
