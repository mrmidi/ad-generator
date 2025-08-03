#!/bin/bash
# VPS Setup Script for ad-generator deployment
# Run this on your Debian 12 VPS as root or with sudo

set -e

echo "🚀 Setting up VPS for ad-generator deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
DOMAIN="ad-generator.mrmidi.net"
WEBROOT="/var/www/ad-generator.mrmidi.net"
DEPLOY_USER="deploy"

echo -e "${YELLOW}📋 Configuration:${NC}"
echo "Domain: $DOMAIN"
echo "Web root: $WEBROOT"
echo "Deploy user: $DEPLOY_USER"
echo ""

# Update system
echo -e "${YELLOW}📦 Updating system packages...${NC}"
apt update && apt upgrade -y

# Install required packages
echo -e "${YELLOW}📦 Installing required packages...${NC}"
apt install -y nginx certbot python3-certbot-nginx ufw fail2ban

# Create deploy user
echo -e "${YELLOW}👤 Creating deploy user...${NC}"
if ! id "$DEPLOY_USER" &>/dev/null; then
    useradd -m -s /bin/bash $DEPLOY_USER
    usermod -aG sudo $DEPLOY_USER
    echo "Deploy user created"
else
    echo "Deploy user already exists"
fi

# Create web directory
echo -e "${YELLOW}📁 Creating web directory...${NC}"
mkdir -p $WEBROOT
chown -R $DEPLOY_USER:www-data $WEBROOT
chmod -R 755 $WEBROOT

# Setup SSH directory for deploy user
echo -e "${YELLOW}🔑 Setting up SSH for deploy user...${NC}"
sudo -u $DEPLOY_USER mkdir -p /home/$DEPLOY_USER/.ssh
sudo -u $DEPLOY_USER chmod 700 /home/$DEPLOY_USER/.ssh
sudo -u $DEPLOY_USER touch /home/$DEPLOY_USER/.ssh/authorized_keys
sudo -u $DEPLOY_USER chmod 600 /home/$DEPLOY_USER/.ssh/authorized_keys

# Configure Nginx
echo -e "${YELLOW}⚙️ Configuring Nginx...${NC}"
# Remove default site
rm -f /etc/nginx/sites-enabled/default

# Note: You'll need to copy the nginx config manually
echo -e "${RED}📝 TODO: Copy nginx-config.conf to /etc/nginx/sites-available/$DOMAIN${NC}"
echo -e "${RED}📝 TODO: Create symlink: ln -s /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/${NC}"

# Configure firewall
echo -e "${YELLOW}🔥 Configuring firewall...${NC}"
ufw --force enable
ufw allow ssh
ufw allow 'Nginx Full'

# Setup fail2ban
echo -e "${YELLOW}🛡️ Configuring fail2ban...${NC}"
systemctl enable fail2ban
systemctl start fail2ban

# SSL Certificate (Let's Encrypt)
echo -e "${YELLOW}🔒 Setting up SSL certificate...${NC}"
echo -e "${RED}📝 TODO: Run after DNS is configured: certbot --nginx -d $DOMAIN${NC}"

# Create a simple index.html for testing
echo -e "${YELLOW}📄 Creating test page...${NC}"
cat > $WEBROOT/index.html << EOF
<!DOCTYPE html>
<html>
<head>
    <title>Ad Generator - Coming Soon</title>
    <style>
        body { font-family: Arial, sans-serif; text-align: center; margin-top: 100px; }
        .container { max-width: 600px; margin: 0 auto; }
        .status { color: #28a745; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🖨️ Ad Generator</h1>
        <p class="status">✅ Server is ready for deployment!</p>
        <p>The application will be deployed here automatically via GitHub Actions.</p>
        <p><small>$(date)</small></p>
    </div>
</body>
</html>
EOF

chown $DEPLOY_USER:www-data $WEBROOT/index.html

echo -e "${GREEN}✅ VPS setup completed!${NC}"
echo ""
echo -e "${YELLOW}📋 Next steps:${NC}"
echo "1. Copy nginx-config.conf to /etc/nginx/sites-available/$DOMAIN"
echo "2. Enable the site: ln -s /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/"
echo "3. Test nginx config: nginx -t"
echo "4. Reload nginx: systemctl reload nginx"
echo "5. Configure DNS: Point $DOMAIN to this server's IP"
echo "6. Get SSL certificate: certbot --nginx -d $DOMAIN"
echo "7. Add deploy user's SSH public key to /home/$DEPLOY_USER/.ssh/authorized_keys"
echo "8. Configure GitHub secrets (see setup-github-secrets.md)"
echo ""
echo -e "${GREEN}🎉 Your VPS is ready for deployment!${NC}"
