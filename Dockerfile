FROM node:8.11-stretch as builder

# Copy the Dynamic Form source and install required node modules
WORKDIR /app
COPY . /app
RUN npm install && \
    npm run package && \
    mkdir /release && \
    cp -r /app/dist/graph-modeler/* /release/ && \
    mv /release/graph-modeler-*.tgz /release/graph-modeler.tgz

# Copy the compiled site into an Nginx web server container
FROM nginx:alpine
COPY --from=builder /release/ /usr/share/nginx/html/
