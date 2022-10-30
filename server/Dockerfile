FROM python:3.8.15-bullseye
RUN apt update
RUN apt install -y vim 
RUN pip install --upgrade pip

COPY requirements.txt /tmp/
RUN pip install --no-cache-dir -r /tmp/requirements.txt

RUN mkdir -p /opt/app
COPY . /opt/app/
RUN chmod +x /opt/app/run.sh

WORKDIR /opt/app
CMD ["./run.sh"]
