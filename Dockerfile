# Stage 1: Build student frontend
FROM node:22-alpine AS client-builder
WORKDIR /build/client
COPY client/package.json ./
RUN npm install --legacy-peer-deps
COPY client/ ./
RUN npm run build

# Stage 2: Build admin frontend
FROM node:22-alpine AS admin-builder
WORKDIR /build/admin
COPY admin/package.json ./
RUN npm install --legacy-peer-deps
COPY admin/ ./
RUN npm run build

# Stage 3: Production server
FROM node:22-alpine AS production
WORKDIR /app
COPY server/package.json ./
RUN npm install --omit=dev
COPY server/ ./
COPY --from=client-builder /build/client/dist ./public/client
COPY --from=admin-builder /build/admin/dist ./public/admin
EXPOSE 5000
CMD ["node", "index.js"]
