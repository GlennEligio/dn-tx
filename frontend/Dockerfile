# pull official base image
FROM node:16.13.2

# set working directory
WORKDIR /app

# add `/app/node_modules/.bin` to $PATH
ENV PATH /app/node_modules/.bin:$PATH

# install app dependencies
COPY package.json /app
COPY package-lock.json /app
RUN npm install react-scripts@5.0.1 -g --silent
RUN npm install --silent

# add app
COPY . ./

# expose port
EXPOSE 3000

# start app
CMD ["npm", "run", "dev"]