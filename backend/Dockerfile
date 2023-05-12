# -slim 代表使用較為精簡的版本
FROM node:19.0.0-bullseye-slim

# 在 contaianer 中創建 backend directory
WORKDIR /backend

# Copy the package.json and package-lock.json files to the container
COPY package*.json ./

# Install the dependencies
RUN npm ci --only=production

# Bundle app source
COPY . .

# 開啟 container 的 port 3000 for node app
EXPOSE 3000

CMD ["npm", "start"]
