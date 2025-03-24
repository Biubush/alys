FROM node:18-alpine as build

WORKDIR /app

# 安装依赖
COPY package.json package-lock.json* ./
RUN npm ci --quiet

# 复制源代码
COPY . .

# 构建应用
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
RUN npm run build

# 生产环境阶段
FROM nginx:alpine

# 添加健康检查
RUN apk add --no-cache curl

# 复制构建产物到nginx目录
COPY --from=build /app/dist /usr/share/nginx/html

# 复制nginx配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/ || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"] 