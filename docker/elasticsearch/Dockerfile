FROM docker.elastic.co/elasticsearch/elasticsearch:5.6.11
ENV APP_NAME=elastic
COPY config/elasticsearch.yml /usr/share/elasticsearch/config/elasticsearch.yml
#USER root
#COPY data /usr/share/elasticsearch/data
#RUN chown -R ${APP_USER} /usr/share/elasticsearch/data

#USER elastic
RUN bin/elasticsearch-plugin remove x-pack --purge

# Add your elasticsearch plugins setup here
# Example: RUN elasticsearch-plugin install analysis-icu
