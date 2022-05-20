FROM node:16 as build
WORKDIR /app
COPY . .
RUN yarn
RUN yarn build
# production environment
FROM nginx:stable-alpine
WORKDIR /usr/share/nginx/html
# Remove default nginx static resources
RUN rm -rf ./*
EXPOSE 80
# Copies static resources from builder stage
COPY --from=build /app/build .
# Containers run nginx with global directives and daemon off
ENTRYPOINT ["nginx", "-g", "daemon off;"]

