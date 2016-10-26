Deployment instructions for upgilinuxvm1 server (deploy at a development environment)

environment requirement:
node.js 6.9
php 7.0
apache 2.4

=== start ===

cd /home/junior/project_upgilinuxvm1

git clone https://github.com/junior-upgi/overdueMonitor.git

cd /home/junior/project_upgilinuxvm1/overdueMonitor/backend

npm install --prod

npm install --only=dev

sudo su

rm -rf /var/www/html/overdueMonitor

cd /home/junior/project_upgilinuxvm1/overdueMonitor/frontend

mkdir /var/www/html/overdueMonitor

nano /etc/fstab

=== insert the following line into fstab ================================================================================
/home/junior/project_upgilinuxvm1/overdueMonitor/frontend /var/www/html/overdueMonitor none defaults,permissions,bind 0 0
=========================================================================================================================

=== reboot the system and make sure symbolic link is properly generated on
=== the frontend file directory, then continue with the instructions 

sudo chown -R junior:junior /var/www/html/overdueMonitor

sudo chmod -R 755 /var/www/html/overdueMonitor

=== done ===
