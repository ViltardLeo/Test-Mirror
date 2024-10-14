FROM node:20.17-alpine AS develop-stage
LABEL authors="Rhainas"

WORKDIR /app
COPY package*.json ./
RUN yarn global add @quasar/cli
COPY . .

FROM develop-stage AS build-stage
RUN yarn
RUN quasar build

FROM nginx:1.27.2-alpine AS production-stage
COPY --from=build-stage /app/dist/spa /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]


