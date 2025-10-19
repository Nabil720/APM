# Elastic APM Server Setup and Application Integration

This repository provides instructions for setting up an Elastic APM (Application Performance Monitoring) stack on an EC2 instance and integrating it with your application hosted on another EC2 instance. This guide covers setting up Docker, Elasticsearch, Kibana, APM Server, and configuring your Node.js application with Elastic APM.

## Prerequisites

- Two EC2 instances running Ubuntu (one for the APM server and another for the application).
- Docker and Docker Compose installed on both EC2 instances.

## Part 1: Setting up the APM Server on EC2

### Step 1: Update and Install Required Packages
On your APM server EC2 instance, run the following commands to update the system and install the necessary packages:

```bash
sudo apt update
sudo apt install -y ca-certificates curl gnupg lsb-release
```
### Step 2: Add Docker’s Official GPG Key and Repo

```bash
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
```

### Step 3: Install Docker and Docker Compose

```bash
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo usermod -aG docker $USER
newgrp docker
```
### Step 4: Enable and Test Docker

```bash
sudo systemctl enable docker
sudo systemctl start docker
docker --version
docker compose version
```

### Step 5: Create the Docker Compose Configuration

```bash
mkdir -p ~/elastic-apm
cd ~/elastic-apm
nano docker-compose.yml

# docker-compose.yml
services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:9.1.5-amd64
    container_name: elasticsearch
    environment:
      - discovery.type=single-node
      - ES_JAVA_OPTS=-Xms256m -Xmx256m
      - xpack.security.enabled=false
      - bootstrap.memory_lock=true
      - cluster.routing.allocation.disk.threshold_enabled=false
      - cluster.routing.allocation.disk.watermark.low=95%
      - cluster.routing.allocation.disk.watermark.high=99%
      - cluster.routing.allocation.disk.watermark.flood_stage=99%
    ulimits:
      memlock:
        soft: -1
        hard: -1
    volumes:
      - es_data:/usr/share/elasticsearch/data
    ports:
      - "9200:9200"

  kibana:
    image: docker.elastic.co/kibana/kibana:9.1.5-amd64
    container_name: kibana
    environment:
      - ELASTICSEARCH_HOSTS=http://elasticsearch:9200
    depends_on:
      - elasticsearch
    ports:
      - "5601:5601"

  apm-server:
    image: docker.elastic.co/apm/apm-server:9.1.5-amd64
    container_name: apm-server
    depends_on:
      - elasticsearch
      - kibana
    ports:
      - "8200:8200"
    environment:
      - output.elasticsearch.hosts=["http://elasticsearch:9200"]
      - apm-server.kibana.enabled=true
      - apm-server.kibana.host=kibana:5601

volumes:
  es_data:
    driver: local
```
### Step 6: Start the Docker Containers

```bash
sudo docker compose up -d
```

### Step 7: Verify the Containers

```bash
sudo docker compose ps
sudo docker compose logs -f elasticsearch
sudo docker compose logs -f kibana
sudo docker compose logs -f apm-server
```

### Step 8: Access the Services

Once the containers are running, you can access the services using your EC2 public IP:

* Elasticsearch: http://<EC2_PUBLIC_IP>:9200

* Kibana: http://<EC2_PUBLIC_IP>:5601

* APM Server: http://<EC2_PUBLIC_IP>:8200




## Part 2: Setting up the Application EC2

## Step 1: Update and Install Required Packages
On your APM server EC2 instance, run the following commands to update the system and install the necessary packages:

```bash
sudo apt update
sudo apt install -y ca-certificates curl gnupg lsb-release
```
### Step 2: Add Docker’s Official GPG Key and Repo

```bash
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
```

### Step 3: Install Docker and Docker Compose

```bash
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo usermod -aG docker $USER
newgrp docker
```
### Step 4: Enable and Test Docker

```bash
sudo systemctl enable docker
sudo systemctl start docker
docker --version
docker compose version
```

### Step 5: Clone the Application Repository

```bash
git clone https://github.com/Nabil720/K8s_project_1.git
cd ~/K8s_project_1
```

### Step 6: Install Elastic APM Node.js Agent
```bash
npm install elastic-apm-node --save
```

### Step 7: Initialize the APM Agent in server.js

```bsah
// Add at the very top of server.js
const apm = require('elastic-apm-node').start({
  serviceName: process.env.ELASTIC_APM_SERVICE_NAME || 'portfolio-app',
  serverUrl: process.env.ELASTIC_APM_SERVER_URL || 'http://<APM_SERVER_HOST>:8200',
  environment: process.env.NODE_ENV || 'production',
  captureHeaders: true,
  captureBody: 'off', // 'off' for privacy, change as needed
});
```

### Step 8: Configure Filebeat

* Create Filebeat.yaml
* Update docker-compose

### Step 9: Restart Docker Compose

```bash
docker-compose up -d
```

![View](./Image/Screenshot%20from%202025-10-19%2013-21-58.png)
![View](./Image/Screenshot%20from%202025-10-19%2013-22-37.png)
![View](./Image/Screenshot%20from%202025-10-19%2017-12-03.png)