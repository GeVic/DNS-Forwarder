FROM node:16

# working directory
WORKDIR /usr/src/app

# copy package.json and package-lock.json
COPY package.json ./

# install dependencies
RUN npm install

# copy source code
COPY . .

# expose port 5051
EXPOSE 5055

# Run the application
CMD ["npx","ts-node", "dnsForwarder.ts"]

