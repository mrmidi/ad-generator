# GitHub Secrets Setup for VPS Deployment

## 🔑 Required GitHub Secrets

You need to configure these secrets in your GitHub repository settings:

**Repository Settings → Secrets and Variables → Actions → New repository secret**

### 1. `VPS_SSH_KEY`
Your private SSH key for the deploy user.

**Generate SSH key pair:**
```bash
# On your local machine
ssh-keygen -t rsa -b 4096 -C "github-actions@ad-generator" -f ~/.ssh/ad-generator-deploy

# Copy private key content (this goes to GitHub secret)
cat ~/.ssh/ad-generator-deploy

# Copy public key to VPS
cat ~/.ssh/ad-generator-deploy.pub
```

**Add public key to VPS:**
```bash
# On your VPS as deploy user
echo "ssh-rsa AAAAB3NzaC1yc2E... github-actions@ad-generator" >> /home/deploy/.ssh/authorized_keys
```

### 2. `VPS_HOST`
Your server's IP address or domain name.
```
Example: 192.168.1.100
Or: mrmidi.net
```

### 3. `VPS_USER`
The deployment user on your VPS.
```
deploy
```

### 4. `VPS_TARGET_PATH`
The web directory path on your VPS.
```
/var/www/ad-generator.mrmidi.net
```

## 🔧 Complete Setup Commands

### On your VPS:

1. **Run the setup script:**
```bash
sudo bash setup-vps.sh
```

2. **Copy and configure Nginx:**
```bash
sudo cp nginx-config.conf /etc/nginx/sites-available/ad-generator.mrmidi.net
sudo ln -s /etc/nginx/sites-available/ad-generator.mrmidi.net /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

3. **Configure DNS:**
Point `ad-generator.mrmidi.net` to your VPS IP address.

4. **Get SSL certificate:**
```bash
sudo certbot --nginx -d ad-generator.mrmidi.net
```

### On your local machine:

1. **Generate SSH keys:**
```bash
ssh-keygen -t rsa -b 4096 -C "github-actions@ad-generator" -f ~/.ssh/ad-generator-deploy
```

2. **Copy public key to VPS:**
```bash
ssh-copy-id -i ~/.ssh/ad-generator-deploy.pub deploy@your-vps-ip
```

3. **Test SSH connection:**
```bash
ssh -i ~/.ssh/ad-generator-deploy deploy@your-vps-ip
```

4. **Add secrets to GitHub:**
- Go to https://github.com/mrmidi/ad-generator/settings/secrets/actions
- Add the four secrets listed above

## 🚀 Deployment Process

Once configured, deployment happens automatically:

1. **Push to main branch** → Triggers GitHub Actions
2. **CI/CD runs** → Tests, builds, and deploys
3. **Files deployed** → Static files copied to VPS
4. **Nginx reloaded** → Site updated automatically

## 🔍 Troubleshooting

### Test SSH connection:
```bash
ssh -i ~/.ssh/ad-generator-deploy deploy@your-vps-ip "whoami && pwd && ls -la /var/www/ad-generator.mrmidi.net"
```

### Check deployment logs:
- Go to GitHub Actions tab in your repository
- Click on latest "Deploy to VPS" workflow run
- Check the logs for any errors

### Nginx logs:
```bash
sudo tail -f /var/log/nginx/ad-generator.mrmidi.net.access.log
sudo tail -f /var/log/nginx/ad-generator.mrmidi.net.error.log
```

### Test local build:
```bash
npm run build
ls -la out/
```

## 🔒 Security Notes

- SSH key should be RSA 4096-bit or ED25519
- Deploy user has limited sudo access
- Firewall configured to allow only SSH and HTTP/HTTPS
- Fail2ban protects against brute force attacks
- SSL certificate auto-renewal via certbot

## 📁 File Structure After Deployment

```
/var/www/ad-generator.mrmidi.net/
├── index.html
├── _next/
│   ├── static/
│   └── ...
├── favicon.ico
└── ...
```
