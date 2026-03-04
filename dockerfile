# -------- Stage 1: Build Angular App --------
FROM node:20 AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# -------- Stage 2: Serve with Nginx --------
FROM nginx:alpine

COPY --from=build /app/dist/newstge /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]