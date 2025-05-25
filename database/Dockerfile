FROM mysql:latest

WORKDIR /database

ENV MYSQL_USER=appuser
ENV MYSQL_ROOT_PASSWORD=123456
ENV MYSQL_PASSWORD=123456
ENV MYSQL_DATABASE=deepface_database

COPY ./data/init.sql /docker-entrypoint-initdb.d/
COPY ./cnf/my.cnf /etc/mysql/conf.d/

# COPY . .

EXPOSE 3306

CMD ["mysqld"]