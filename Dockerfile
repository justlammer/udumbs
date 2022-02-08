FROM node:12

# When running as a GitHub Action, the WORKDIR is controlled by GitHub.
# Furthermore, they recommend NOT setting it in the Dockerfile, which makes running locally difficult.
# Thus we copy files to another directory and cd into it before running (regardless of the environment).
COPY . /app/

ENTRYPOINT ["sh", "-c", "cd /app && npm install --production && npm start"]