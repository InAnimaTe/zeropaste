FROM php:5.6-apache
RUN apt-get update && apt-get install -y git && git clone https://github.com/JimTim/zeropaste.git /var/www/html && apt-get remove -y git && apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/* && chown -R www-data:www-data /var/www/html 
WORKDIR /var/www/html
VOLUME ["/var/www/html/data"]
EXPOSE 80
EXPOSE 443
# Set the default command to execute when creating a new container
CMD ["apache2-foreground"]
