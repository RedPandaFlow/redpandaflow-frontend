FROM node:26-alpine AS builder
WORKDIR /app
COPY redpandaflow-frontend/package*.json ./
RUN npm ci
COPY redpandaflow-frontend/ .
RUN npm run build

FROM nginxinc/nginx-unprivileged:stable-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY redpandaflow-frontend/nginx.conf.template /etc/nginx/templates/default.conf.template
ARG FRONTEND_PORT
EXPOSE ${FRONTEND_PORT}
CMD ["nginx", "-g", "daemon off;"]