# Server setup

Get your VM up and running first. In this example, we use Ubuntu 22.04 LTS as the OS of our server.

## Install software dependencies

- install nvm by checking this [link](https://tecadmin.net/how-to-install-nvm-on-ubuntu-22-04/)
- install node, here we use v16.15.1 `nvm install v16.15.1`
- you are ready to run your node projects!

you will also need to install Docker: use this [link](https://www.digitalocean.com/community/tutorials/how-to-install-and-use-docker-on-ubuntu-22-04)

## Install GraphLD and GraphDB.

- Pull GraphDb docker image for backend data management: use docker `docker pull ontotext/graphdb:10.2.2`
- run GraphDB docker image on port 7200 `sudo docker run -p 7200:7200  --name GraphDB -d -it --rm ontotext/graphdb:10.2.2 -Dgraphdb.connector.port=7200 -Dgraphdb.workbench.cors.enable=true -Dgraphdb.workbench.cors.origin=*` 
- note that the argument settings `-Dgraphdb.workbench.cors.enable=true -Dgraphdb.workbench.cors.origin=*` are used for solving CORS.
- 
For GraphLD, clone this project, run `npm install` and then `npm run dev` to preview the development version. For more details please see the project README. 
