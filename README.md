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

crontab -e

=== insert the following lines into crontab ===============================================================================
0 9 * * * nodejs /home/junior/project_upgilinuxvm1/overdueMonitor/backend/overdueAlert >> /home/junior/project_upgilinuxvm1/overdueMonitor/backend/log/overdueAlert.log
50 8 * * 1 nodejs /home/junior/project_upgilinuxvm1/overdueMonitor/backend/weeklyAlert >> /home/junior/project_upgilinuxvm1/overdueMonitor/backend/log/weeklyAlert.log

* * * * * php /home/junior/project_upgilinuxvm1/overdueMonitor/backend/test.php >> /home/junior/project_upgilinuxvm1/overdueMonitor/backend/log/test.log

0 * * * * curl -X POST -H "Content-Type: application/json" -d '{"messageCategoryID":"3","systemCategoryID":"1","manualTopic":"逾期款日報","content":"請點選訊息以查閱今日逾期款狀況","recipientID":"05060001","userGroup":"Admin","url":"http://upgi.ddns.net:3355/overdueMonitor/mobileReport.html","audioFile":"alert.mp3"}' http://localhost:3939/broadcast >> /home/junior/project_upgilinuxvm1/overdueMonitor/backend/log/test.log
0 9 * * * curl -X POST -H "Content-Type: application/json" -d '{"messageCategoryID":"3","systemCategoryID":"1","manualTopic":"逾期款日報","content":"請點選訊息以查閱今日逾期款狀況","recipientID":"08030005","userGroup":"Sales","url":"http://upgi.ddns.net:3355/overdueMonitor/mobileReport.html","audioFile":"alert.mp3"}' http://localhost:3939/broadcast >> /home/junior/project_upgilinuxvm1/overdueMonitor/backend/log/test.log
=========================================================================================================================

=== check if test.log is getting entries per minute

=== done ===
