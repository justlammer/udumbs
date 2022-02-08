FROM node:14

# When running as a GitHub Action, the WORKDIR is controlled by GitHub.
# Furthermore, they recommend NOT setting it in the Dockerfile, which makes running locally difficult.
# Thus we copy files to another directory and cd into it before running (regardless of the environment).
COPY . /app/
# RUN ls -al /github/workspace

# ENTRYPOINT ["sh", "-c", "ls -al /github/workspace && ls -al /github/workflow && ls -al /github/home && ls -al /app && cd /app && npm install --production && npm start"]
ENTRYPOINT ["sh", "-c", "cd /app && npm install --production && npm start"]