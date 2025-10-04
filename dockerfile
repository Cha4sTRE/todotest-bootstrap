FROM nginx:alpine

RUN rm -rf /usr/share/nginx/html/*

# Copia los archivos del proyecto al directorio público de Nginx
COPY . /usr/share/nginx/html

EXPOSE 80

# Iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]
