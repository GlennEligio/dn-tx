#! /bin/sh
sed -i "s/dnTxBEServiceName/${DNTX_BE_SERVICE_NAME}/" /etc/nginx/conf.d/default.conf
sed -i "s/dnTxBEPort/${DNTX_BE_PORT}/" /etc/nginx/conf.d/default.conf

