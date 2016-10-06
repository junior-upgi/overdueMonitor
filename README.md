Deployment instructions for current master repo on the following servers: ERP SQL server (sunv9) and MySQL server (upgiserver86)

These instructions does not use symbolic link from user's project folder to the http docroot folder (files are manually copied into the server http docroot)


cd /home/junior/htmlProject

git clone https://github.com/junior-upgi/overdueMonitor.git

cd /home/junior/htmlProject/overdueMonitor

rm -rf .git

rm .gitignore

rm README.md

rm jsconfig.json

rm -rf misc


cd /home/junior/htmlProject/overdueMonitor/backend

rm -rf sql_script

rm -rf notes

npm install --prod

rm package.json


sudo su

rm -rf /var/www/html/overdueMonitor

cd /home/junior/htmlProject/overdueMonitor/frontend

mkdir /var/www/html/overdueMonitor

cp /home/junior/htmlProject/overdueMonitor/frontend/* /var/www/html/overdueMonitor/ 

chown -R junior:junior /var/www/html/overdueMonitor

chmod -R 755 /var/www/html/overdueMonitor

rm -rf /home/junior/htmlProject/overdueMonitor/frontend

exit
