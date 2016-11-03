FROM debian:jessie
MAINTAINER Patrick Lightbody <patrick@lightbody.net>

##################################################
# Set environment variables                      #
##################################################

ENV DEBIAN_FRONTEND noninteractive
ENV TERM xterm

##################################################
# Install tools                                  #
##################################################

RUN apt-get update
RUN apt-get install -y apt-utils apt-transport-https curl
RUN curl -sL https://deb.nodesource.com/setup_6.x | bash -
RUN apt-get install -y nodejs
RUN npm install express body-parser

##################################################
# Start                                          #
##################################################

USER root

ADD index.js /root/index.js
ADD run.sh /root/run.sh

EXPOSE 2096
CMD ["/root/run.sh"]
