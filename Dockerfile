FROM php:5.6-apache
# Ensure apt works cleanly only for this dockerfile build
ARG DEBIAN_FRONTEND=noninteractive
RUN apt-get update && \
    apt-get -y install git && \
    git clone https://github.com/JimTim/zeropaste.git /var/www/html && \
    apt-get -y purge --auto-remove git && \
    apt-get clean && \
    rm -rf \
    /var/lib/apt/lists/* \
    /tmp/* \
    /var/tmp/* \
    /usr/share/locale/* \
    /var/cache/debconf/*-old \
    /var/lib/apt/lists/* \
    /usr/share/doc/* && \
    chown -R www-data:www-data /var/www/html
WORKDIR /var/www/html
EXPOSE 80
EXPOSE 443
# Set the default command to execute when creating a new container
CMD ["apache2-foreground"]
