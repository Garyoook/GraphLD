# GraphLD

Deployed [Demo](http://146.169.43.78) on Imperial Private Cloud(Imperial VPN is needed out of campus);

This project was initialy bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

And then migrate to [UmiJs](https://umijs.org/) for better file management & routing experience.

Important enginnering components of this project:

[MUI](mui.com) (React UI Components)

[AntV G2](https://g2.antv.antgroup.com/manual/introduction)

[Ant Design Charts](https://charts.ant.design/en) (React version of AntV G2 visualisation package)

[Google charts](https://developers.google.com/chart/interactive/docs/gallery/)

[React-Google-Charts](https://www.react-google-charts.com/)

[GraphDB](https://graphdb.ontotext.com/) (RDF Graph Database, used as backend)

# Getting Started

## 1. Prepare the Linked Data

### i. Configure GraphDB

The backend of GraphLD is supported by [GraphDB](https://graphdb.ontotext.com/), Before running GraphLD, RDF data should be prepared and loaded into GraphDB.

To use GraphDB, you can either:

- [Download GraphDB Workbench](https://www.ontotext.com/products/graphdb/download/) and run it locally;
- Or use Docker Image of GraphDB, see [GraphDB Docker Image](https://hub.docker.com/r/ontotext/graphdb/);

Be noted that to communicate with GraphLD, GraphDB should be configured to enable CORS (Cross-Origin Resource Sharing), see [GraphDB CORS Configuration](https://graphdb.ontotext.com/documentation/10.2/directories-and-config-properties.html?highlight=cors); In short, set `graphdb.workbench.cors.origin` to `*` and `graphdb.workbench.cors.enable` to `true` in your GraphDB configuration.

If you are using GraphDB docker image instead of GraphDB Application, you can configure CORS by adding container parameters, an example of running the docker image is given below, the example uses image `ontotext/graphdb:10.2.1`.

    docker run -p 7200:7200  --name GraphDB -d -it --rm ontotext/graphdb:10.2.1 -Dgraphdb.connector.port=7200 -Dgraphdb.workbench.cors.enable=true -Dgraphdb.workbench.cors.origin=*

After setting up GraphDB, you can access GraphDB Workbench on [http://localhost:7200](http://localhost:7200), and create a new repository for your Linked Data.

### ii. Import Linked data and Schema into GraphDB

To empower GraphLD with conceptual modelling, the Semantic Schema of the target database should also be imported.

An example of Linked Data is [Moindial database in RDF](https://www.semwebtech.org/mondial/10/), you can download prepared [Complete Mondial Database](https://www.dbis.informatik.uni-goettingen.de/Mondial/Mondial-RDF/mondial.rdf) and respective [Semantic Web Schema](https://www.dbis.informatik.uni-goettingen.de/Mondial/Mondial-RDF/mondial-meta.rdf) then import them into GraphDB via Import -> User Data -> Upload RDF files; You can also use Import -> User Data -> Get RDF data from URL to import data using the URLs of above data and schema.

You can also try other Linked Databases and import them into GraphDB.

## 2. Run GraphLD

### i. Configure GraphLD

Now you have the data and schema in GraphDB, you should now configure GraphLD to connect to your GraphDB repository.

In `src/config.ts`, you can configure the following parameters:

- GRAPHDB_HOST_DEV if you are running GraphDB locally. Default is `http://127.0.0.1:7200`;
- GRAPHDB_HOST_PROD if you use GraphDB deployed on remote machinne. Default is set to the current experiment machine the author is using `http://146.169.43.78:7200`, it is not accessible without specified VPN, do if you are cloning this repo and deploy your backend on remote machines, pease modify this configuration;

Then GraphLD application is ready to run.

### ii. Scripts for Running GraphLD:

### `npm run dev`

Runs the React app in the development mode.\
Open [http://localhost:8000](http://localhost:8000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm run build`

Builds the React app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

<!-- See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information. -->

### `npm run preview`

After building the app, you can run this script to preview the production build locally, on [http://localhost:4172](http://localhost:4172)

### Note that GraphDB workbench is required as backend, you can configure that in `src/config.ts`
