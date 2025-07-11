# PHASE 1: LOAD BALANCING & AUTO-SCALING

## CHIEF TECHNICAL ARCHITECT - STARGUIDE IDFS
**Implementation Date:** July 2, 2025
**Status:** IMPLEMENTING
**Priority:** CRITICAL

## 1. NGINX LOAD BALANCER CONFIGURATION

### 1.1 High-Availability Nginx Setup

#### A. Main Load Balancer Config (/etc/nginx/nginx.conf)
```nginx
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 4096;
    use epoll;
    multi_accept on;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Logging format for monitoring
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for" '
                    'rt=$request_time uct="$upstream_connect_time" '
                    'uht="$upstream_header_time" urt="$upstream_response_time"';

    access_log /var/log/nginx/access.log main;

    # Performance optimizations
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 50M;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 10240;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json;

    # Rate limiting zones
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=auth:10m rate=5r/s;
    limit_req_zone $binary_remote_addr zone=ai:10m rate=2r/s;

    # Backend server pool
    upstream starguide_backend {
        least_conn;
        server 127.0.0.1:8001 weight=3 max_fails=3 fail_timeout=30s;
        server 127.0.0.1:8002 weight=3 max_fails=3 fail_timeout=30s backup;
        server 127.0.0.1:8003 weight=2 max_fails=3 fail_timeout=30s backup;
        
        # Health check
        keepalive 32;
    }

    # Frontend server pool
    upstream starguide_frontend {
        least_conn;
        server 127.0.0.1:3000 weight=3 max_fails=3 fail_timeout=30s;
        server 127.0.0.1:3001 weight=3 max_fails=3 fail_timeout=30s backup;
        
        keepalive 16;
    }

    # SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    include /etc/nginx/conf.d/*.conf;
}
```

#### B. StarGuide Virtual Host (/etc/nginx/conf.d/starguide.conf)
```nginx
# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name emergency-stargate.emergent.host starguideai.emergent.host;
    return 301 https://$server_name$request_uri;
}

# Main HTTPS server
server {
    listen 443 ssl http2;
    server_name emergency-stargate.emergent.host starguideai.emergent.host;

    # SSL Configuration
    ssl_certificate /etc/ssl/certs/starguide.crt;
    ssl_certificate_key /etc/ssl/private/starguide.key;
    ssl_trusted_certificate /etc/ssl/certs/starguide-chain.crt;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; media-src 'self'; object-src 'none'; child-src 'none'; worker-src 'self'; frame-ancestors 'none'; upgrade-insecure-requests;" always;

    # API endpoints with enhanced rate limiting
    location /api/ {
        limit_req zone=api burst=20 nodelay;
        
        proxy_pass http://starguide_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # Buffer settings for better performance
        proxy_buffering on;
        proxy_buffer_size 128k;
        proxy_buffers 4 256k;
        proxy_busy_buffers_size 256k;
    }

    # Authentication endpoints with stricter rate limiting
    location /api/auth/ {
        limit_req zone=auth burst=10 nodelay;
        
        proxy_pass http://starguide_backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # AI endpoints with very strict rate limiting
    location /api/ai/ {
        limit_req zone=ai burst=5 nodelay;
        
        proxy_pass http://starguide_backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 120s;  # AI requests can take longer
    }

    # Static assets with caching
    location /static/ {
        expires 1y;
        add_header Cache-Control "public, no-transform";
        proxy_pass http://starguide_frontend;
    }

    # Frontend application
    location / {
        proxy_pass http://starguide_frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # SPA fallback
        try_files $uri $uri/ /index.html;
    }

    # Health check endpoint (bypass rate limiting)
    location = /api/health {
        proxy_pass http://starguide_backend;
        access_log off;
    }

    # Metrics endpoint (bypass rate limiting, restrict access)
    location = /api/metrics {
        allow 127.0.0.1;
        allow 10.0.0.0/8;
        deny all;
        proxy_pass http://starguide_backend;
        access_log off;
    }
}
```

## 2. AUTO-SCALING CONFIGURATION

### 2.1 Systemd Service Templates

#### A. Backend Service Template (/etc/systemd/system/starguide-backend@.service)
```ini
[Unit]
Description=StarGuide Backend Instance %i
After=network.target mongodb.service redis.service
Requires=mongodb.service redis.service

[Service]
Type=simple
User=starguide
WorkingDirectory=/opt/starguide/backend
Environment=PORT=800%i
Environment=INSTANCE_ID=%i
EnvironmentFile=/opt/starguide/backend/.env
ExecStart=/opt/starguide/venv/bin/uvicorn server:app --host 0.0.0.0 --port 800%i --workers 4
Restart=always
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=starguide-backend-%i

# Resource limits
LimitNOFILE=65536
LimitNPROC=32768

# Security settings
NoNewPrivileges=yes
ProtectSystem=strict
ProtectHome=yes
ReadWritePaths=/opt/starguide/backend/logs

[Install]
WantedBy=multi-user.target
```

#### B. Frontend Service Template (/etc/systemd/system/starguide-frontend@.service)
```ini
[Unit]
Description=StarGuide Frontend Instance %i
After=network.target

[Service]
Type=simple
User=starguide
WorkingDirectory=/opt/starguide/frontend
Environment=PORT=300%i
Environment=INSTANCE_ID=%i
ExecStart=/usr/bin/serve -s build -l 300%i
Restart=always
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=starguide-frontend-%i

[Install]
WantedBy=multi-user.target
```

### 2.2 Auto-scaling Script (/opt/starguide/scripts/autoscale.sh)
```bash
#!/bin/bash

# StarGuide Auto-scaling Script
# Monitors load and scales instances automatically

LOG_FILE="/var/log/starguide/autoscale.log"
NGINX_CONFIG="/etc/nginx/conf.d/starguide.conf"
MIN_INSTANCES=1
MAX_INSTANCES=5
SCALE_UP_THRESHOLD=80    # CPU percentage
SCALE_DOWN_THRESHOLD=30  # CPU percentage
CHECK_INTERVAL=60        # seconds

log() {
    echo "$(date): $1" >> $LOG_FILE
}

get_cpu_usage() {
    top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk '{print 100 - $1}'
}

get_active_instances() {
    systemctl list-units --plain --no-legend "starguide-backend@*" | grep -c "active"
}

scale_up() {
    local current_instances=$1
    local new_instance=$((current_instances + 1))
    
    if [ $new_instance -le $MAX_INSTANCES ]; then
        log "Scaling up: Starting instance $new_instance"
        systemctl start starguide-backend@$new_instance
        systemctl start starguide-frontend@$new_instance
        
        # Update nginx upstream
        update_nginx_upstream
        
        log "Scale up completed: Now running $new_instance instances"
    else
        log "Cannot scale up: Maximum instances ($MAX_INSTANCES) reached"
    fi
}

scale_down() {
    local current_instances=$1
    
    if [ $current_instances -gt $MIN_INSTANCES ]; then
        log "Scaling down: Stopping instance $current_instances"
        systemctl stop starguide-backend@$current_instances
        systemctl stop starguide-frontend@$current_instances
        
        # Update nginx upstream
        update_nginx_upstream
        
        log "Scale down completed: Now running $((current_instances - 1)) instances"
    else
        log "Cannot scale down: Minimum instances ($MIN_INSTANCES) required"
    fi
}

update_nginx_upstream() {
    # Reload nginx configuration
    nginx -t && systemctl reload nginx
    log "Nginx configuration reloaded"
}

# Main monitoring loop
while true; do
    cpu_usage=$(get_cpu_usage)
    active_instances=$(get_active_instances)
    
    log "CPU: ${cpu_usage}%, Instances: $active_instances"
    
    if (( $(echo "$cpu_usage > $SCALE_UP_THRESHOLD" | bc -l) )); then
        scale_up $active_instances
    elif (( $(echo "$cpu_usage < $SCALE_DOWN_THRESHOLD" | bc -l) )); then
        scale_down $active_instances
    fi
    
    sleep $CHECK_INTERVAL
done
```

### 2.3 Load Balancer Health Checks

#### A. Health Check Script (/opt/starguide/scripts/health_check.sh)
```bash
#!/bin/bash

# Health check script for backend instances
check_backend_health() {
    local port=$1
    local url="http://localhost:$port/api/health"
    
    response=$(curl -s -o /dev/null -w "%{http_code}" $url)
    
    if [ "$response" = "200" ]; then
        return 0
    else
        return 1
    fi
}

# Check all backend instances
for port in 8001 8002 8003; do
    if check_backend_health $port; then
        echo "Instance on port $port: HEALTHY"
    else
        echo "Instance on port $port: UNHEALTHY"
        # Remove from load balancer
        systemctl stop starguide-backend@${port#800}
    fi
done
```

## 3. MONITORING & ALERTING

### 3.1 Prometheus Configuration for Load Balancing
```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'nginx'
    static_configs:
      - targets: ['localhost:9113']
    metrics_path: '/metrics'
    
  - job_name: 'starguide-backend-instances'
    static_configs:
      - targets: ['localhost:8001', 'localhost:8002', 'localhost:8003']
    metrics_path: '/api/metrics'
    
  - job_name: 'starguide-frontend-instances'
    static_configs:
      - targets: ['localhost:3000', 'localhost:3001']

rule_files:
  - "alert_rules.yml"

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093
```

### 3.2 Alert Rules for Load Balancing
```yaml
# alert_rules.yml
groups:
  - name: load_balancing
    rules:
      - alert: HighCPUUsage
        expr: cpu_usage > 80
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: High CPU usage detected
          description: "CPU usage is above 80% for more than 5 minutes"
          
      - alert: InstanceDown
        expr: up{job=~"starguide-.*"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: StarGuide instance is down
          description: "Instance {{ $labels.instance }} has been down for more than 1 minute"
          
      - alert: LoadBalancerError
        expr: nginx_http_requests_total{status=~"5.."}
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: Load balancer errors detected
          description: "Nginx is returning 5xx errors"
```

## 4. DISASTER RECOVERY

### 4.1 Failover Configuration
```bash
# /opt/starguide/scripts/failover.sh
#!/bin/bash

# Automatic failover script
PRIMARY_INSTANCE="8001"
BACKUP_INSTANCES=("8002" "8003")

check_primary() {
    curl -f http://localhost:$PRIMARY_INSTANCE/api/health >/dev/null 2>&1
}

activate_backup() {
    local backup_port=$1
    systemctl start starguide-backend@${backup_port#800}
    log "Activated backup instance on port $backup_port"
}

# Main failover logic
if ! check_primary; then
    log "Primary instance failed, activating backup"
    for backup in "${BACKUP_INSTANCES[@]}"; do
        if activate_backup $backup; then
            break
        fi
    done
fi
```

### 4.2 Backup and Recovery
```bash
# /opt/starguide/scripts/backup.sh
#!/bin/bash

BACKUP_DIR="/opt/starguide/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Create backup
tar -czf "$BACKUP_DIR/starguide_backup_$TIMESTAMP.tar.gz" \
    /opt/starguide/backend \
    /opt/starguide/frontend \
    /etc/nginx/conf.d/starguide.conf

# Keep only last 10 backups
cd $BACKUP_DIR && ls -t starguide_backup_*.tar.gz | tail -n +11 | xargs rm -f

log "Backup created: starguide_backup_$TIMESTAMP.tar.gz"
```

## 5. PERFORMANCE OPTIMIZATION

### 5.1 Nginx Performance Tuning
```nginx
# Additional performance settings
worker_processes auto;
worker_cpu_affinity auto;
worker_rlimit_nofile 65535;

events {
    worker_connections 4096;
    use epoll;
    multi_accept on;
    accept_mutex off;
}

http {
    # Connection pooling
    upstream starguide_backend {
        keepalive 100;
        keepalive_requests 1000;
        keepalive_timeout 60s;
    }
    
    # Buffer optimization
    proxy_buffering on;
    proxy_buffer_size 128k;
    proxy_buffers 4 256k;
    proxy_busy_buffers_size 256k;
    proxy_temp_file_write_size 256k;
    
    # Compression optimization
    gzip_comp_level 6;
    gzip_min_length 1000;
    gzip_vary on;
}
```

## 6. SUCCESS METRICS

### 6.1 Load Balancing Metrics
- **Request Distribution:** Even distribution across instances (±10%)
- **Response Time:** <200ms for 95% of requests
- **Availability:** 99.9% uptime
- **Failover Time:** <30 seconds

### 6.2 Auto-scaling Metrics
- **Scale-up Time:** <2 minutes
- **Scale-down Time:** <1 minute
- **Resource Utilization:** 70-85% average CPU usage
- **Cost Efficiency:** 20% reduction in infrastructure costs

## NEXT PHASE
Upon completion, proceed to **PHASE1_SECURITY_AUDIT.md**