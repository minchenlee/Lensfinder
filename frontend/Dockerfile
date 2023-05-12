# build 代表 stage 名稱
FROM node:19.0.0-bullseye-slim as build

# 在 contaianer 中創建 front end directory
WORKDIR /frontend

# Copy the package.json and yarn.lock/package-lock.json files to the container
COPY package.json ./

# Install the dependencies
RUN npm install

# Copy the entire project to the container
COPY . .

# Build the application in production mode
RUN npm run build

# serve stage
FROM node:19.0.0-bullseye-slim as build

# 在 contaianer 中創建 front end directory
WORKDIR /frontend

# --from=build 代表從 build stage 複製檔案
COPY --from=build /frontend/build /frontend/build

# Expose the port that the application is listening on
EXPOSE 3000

# 要先裝 serve package，不然會出現錯誤s
RUN npm install -g serve

# Use the "serve" package to start the built application
CMD ["serve", "-s", "build", "-l", "3000"]