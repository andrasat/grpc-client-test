FROM node:16.14-alpine3.15
WORKDIR /source

ADD build src
ADD node_modules node_modules
ADD package.json package.json

ENV PORT 50011
EXPOSE 50011

ENV GRPC_VERBOSITY=DEBUG
ENV GRPC_TRACE=connectivity_state,dns_resolver,round_robin

ENTRYPOINT [ "node", "./src/main/index.js" ]