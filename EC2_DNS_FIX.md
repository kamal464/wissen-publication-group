# Fix DNS / hostname on EC2 (before running MASTER_SETUP.sh)

If you see:

- `sudo: unable to resolve host ip-172-31-xx-xx: Temporary failure in name resolution`
- `fatal: unable to access 'https://github.com/...': Could not resolve host: github.com`

the instance has no working DNS. Fix it **once** by running these on the server (SSH in, then paste):

```bash
# 1) Fix hostname so sudo stops complaining
echo "127.0.0.1 $(hostname)" | sudo tee -a /etc/hosts

# 2) Fix DNS so git and npm can reach the internet
echo -e "nameserver 8.8.8.8\nnameserver 8.8.4.4" | sudo tee /etc/resolv.conf

# 3) Check
ping -c1 github.com
```

If `ping -c1 github.com` still fails:

- **Public subnet:** Ensure the instance has a public IP and the subnet has an Internet Gateway. Check security group allows outbound (and that you didn’t remove 0.0.0.0/0 egress).
- **Private subnet:** You need a NAT Gateway (or NAT instance) and a default route to it so the instance can reach the internet.
- **VPC:** In VPC → DHCP option sets, ensure “AmazonProvidedDNS” is used (or a custom DNS that’s reachable).

After DNS works, run:

```bash
cd /var/www/wissen-publication-group
./MASTER_SETUP.sh
```

---

## Fix "No space left on device" (before or when setup fails)

If `git pull` or the build fails with **No space left on device**, free space **once** on the server:

```bash
cd /var/www/wissen-publication-group

# Remove build artifacts (will be rebuilt by setup)
rm -rf frontend/.next backend/dist

# Remove failed/incomplete swap file if present
sudo swapoff /swapfile 2>/dev/null || true
sudo rm -f /swapfile

# Clear caches
npm cache clean --force
sudo apt clean
sudo journalctl --vacuum-size=50M

# Check free space
df -h /
```

If free space is still under ~1GB, also clean logs and consider expanding the EBS volume in the AWS console (e.g. 8 GB → 20 GB, then extend the partition and filesystem). Then run `./MASTER_SETUP.sh` again.
