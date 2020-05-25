FROM node:12.9.1-alpine as builder

# Copy the source and install required node modules
WORKDIR /app
COPY package.json /app
COPY npm-shrinkwrap.json /app
RUN npm install

# Build the site
COPY . /app
RUN npm run build

# Copy the compiled site into an Nginx web server container
FROM nginx:alpine
COPY --from=builder /app/dist/graph-modeler-app/ /usr/share/nginx/html/
