#! /bin/bash
. ~/.nvm/nvm.sh

nvm use v16.15.1

git pull
npm run build
sudo cp -r dist/. /var/www/html
echo 'deployed on Imperial Private cloud http://146.169.43.78/'
