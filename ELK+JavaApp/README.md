# ELK Stack Deployment with Java Application Log Monitoring

This project demonstrates how to set up an **ELK Stack (Elasticsearch, Logstash, Kibana)** on one EC2 instance and a **Java application with Filebeat** on another EC2 instance for centralized log monitoring.

---

## Architecture Overview

```bash
+----------------+ +-----------------+ +------------------+
| Application | | ELK Server | | Kibana Dashboard |
| Server (Filebeat) ---> | Logstash + ES | ---> | http://<ELK_IP>:5601 |
| Java App Logs | | Elasticsearch | | Visualize Logs |
+----------------+ +-----------------+ +------------------+
```

---

## Step 1: Setup ELK Server (EC2)

### 1.1 Install Java

```bash
sudo apt update && sudo apt install openjdk-17-jre-headless -y
```

### 1.2 Install Elasticsearch

```bash
wget -qO - https://artifacts.elastic.co/GPG-KEY-elasticsearch | sudo apt-key add -
echo "deb https://artifacts.elastic.co/packages/7.x/apt stable main" | sudo tee /etc/apt/sources.list.d/elastic-7.x.list
sudo apt update
sudo apt install elasticsearch -y
```

### 1.3 Configure Elasticsearch

```bash
sudo vi /etc/elasticsearch/elasticsearch.yml

# Add or modify the following:
network.host: 0.0.0.0
cluster.name: my-cluster
node.name: node-1
discovery.type: single-node
```

### 1.4 Start and Enable Elasticsearch

```bash
sudo systemctl start elasticsearch
sudo systemctl enable elasticsearch
sudo systemctl status elasticsearch

# Verify Installation

curl -X GET "http://<EC2 IP>:9200"
```

## Step 2: Install and Configure Logstash

### 2.1 Install Logstash

```bash
sudo apt install logstash -y

# Configure Logstash
sudo vi /etc/logstash/conf.d/logstash.conf

# Add the following configuration:

input {
  beats {
    port => 5044
  }
}

filter {
  grok {
    match => { "message" => "%{TIMESTAMP_ISO8601:log_timestamp} %{LOGLEVEL:log_level} %{GREEDYDATA:log_message}" }
  }
}

output {
  elasticsearch {
    hosts => ["http://localhost:9200"]
    index => "logs-%{+YYYY.MM.dd}"
  }
  stdout { codec => rubydebug }
}
```

### 2.2 Start and Enable Logstash

```bash
sudo systemctl start logstash
sudo systemctl enable logstash
sudo systemctl status logstash
```

### 2.3 Allow Logstash Port

```bash
sudo ufw allow 5044/tcp # alrady added port in ec2
```

## Step 3: Install and Configure Kibana

### 3.1 Install Kibana

```bash
sudo apt install kibana -y
# Configure Kibana
sudo vi /etc/kibana/kibana.yml
# Modify the following:
server.host: "0.0.0.0"
elasticsearch.hosts: ["http://localhost:9200"]
```

### 3.2 Start and Enable Kibana

```bash
sudo systemctl start kibana
sudo systemctl enable kibana
sudo systemctl status kibana
```

### 3.3 Allow Kibana Port

```bash
sudo ufw allow 5601/tcp # alrady added port in ec2
```

### 3.4 Access Kibana Dashboard

```bash
http://<ELK_Server_Public_IP>:5601
```

## Step 4: Setup Application Server (EC2)

### 4.1 Install Java

```bash
sudo apt update
sudo apt install openjdk-17-jre-headless -y
```

### 4.2 Clone Application

```bash

git clone https://github.com/jaiswaladi246/Boardgame.git

sudo apt install maven

# After install Filebeat
cd Boarfgame
mvn package
cd terget
ls

nohup java -jar **<database_name.jar>** > /home/ubuntu/Boardgame/target/app.log 2>&1 &

# Chack
http://<Application EC2 Ip>:8080
```

## Step 5: Install and Configure Filebeat (on Application Server)

## 5.1 Install Filebeat

```bash
wget -qO - https://artifacts.elastic.co/GPG-KEY-elasticsearch | sudo apt-key add -
echo "deb https://artifacts.elastic.co/packages/7.x/apt stable main" | sudo tee /etc/apt/sources.list.d/elastic-7.x.list
sudo apt update
sudo apt install filebeat -y
```

## 5.2 Configure Filebeat

```bash
# After run the application
sudo vi /etc/filebeat/filebeat.yml

# Modify the following:
###################### Filebeat Configuration #########################

# ============================== Filebeat inputs ===============================

filebeat.inputs:
  - type: log
    enabled: true
    paths:
      - /home/ubuntu/Boardgame/target/app.log

# ============================== Filebeat modules ==============================

filebeat.config.modules:
  path: ${path.config}/modules.d/*.yml
  reload.enabled: false

# ======================= Elasticsearch template setting =======================

setup.template.settings:
  index.number_of_shards: 1

# =================================== Kibana ===================================

# Uncomment and set this if you have Kibana for dashboards (optional)
# setup.kibana:
#   host: "localhost:5601"

# =============================== Elastic Cloud ================================

# Not using Elastic Cloud, so skipping `cloud.id` and `cloud.auth`

# ================================== Outputs ===================================

# Using Logstash as output
output.logstash:
  hosts: ["54.205.25.124:5044"]

# -------------------------------- Processors ----------------------------------

processors:
  - add_host_metadata:
      when.not.contains.tags: forwarded
  - add_cloud_metadata: ~
  - add_docker_metadata: ~
  - add_kubernetes_metadata: ~

# ================================== Logging ===================================

# Uncomment for troubleshooting:
# logging.level: debug
# logging.selectors: ["*"]


```

### 5.3 Start and Enable Filebeat

```bash
sudo systemctl start filebeat
sudo systemctl enable filebeat
sudo systemctl status filebeat
```

### 5.4 Verify Filebeat is Sending Logs

```bash
sudo filebeat test output
```

## Step 6: View Logs in Kibana

1. Go to Kibana → Discover

2. Select the index pattern: logs-\*

3. Search for: log.file.path: "/home/ubuntu/Boardgame/target/app.log"

![View](./Image/Screenshot%202025-10-18%20154559.png)
![View](./Image/Screenshot%202025-10-18%20154635.png)
