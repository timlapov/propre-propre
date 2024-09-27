# Stage 1: build
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm install -g @angular/cli@18
RUN npm ci
COPY . .
RUN ng build

# Stage 2: nginx
FROM nginx:alpine

COPY nginx.conf /etc/nginx/nginx.conf

# Copy the built application from the previous step to the nginx working directory
COPY --from=build /app/dist/dashboard-user-nowa/browser /usr/share/nginx/html
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
