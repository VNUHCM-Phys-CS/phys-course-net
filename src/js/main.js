// parameter
let width = 2000;//window. innerWidth;
let height = 1000;window. innerHeight;
let margin = {top:20,bottom:20,left:20,right:20};
const mainxKEY = "YEAR";
const subxKEY = "TERM";
const colorKEY = "CATEGORY";
const strokeKEY = "REQUIRE";
// init
const drawFunc = draw({width,height,margin});
const allData = {nodes:[],links:[]};
let currentData = {nodes:[],links:[]};
let filterState = {layer:[1,2,3,4]};
// load data
loadNodeLinks()
    .then(graph=>{
        allData.nodes=[...graph.nodes];
        allData.links=[...graph.links];
        const catall = _.uniq(allData.nodes.map(d=>d[colorKEY]));
        currentData = {nodes:[...graph.nodes],links:[...graph.links]};
        drawFunc.graph(currentData).setColorByCat(catall).initZoom().draw().initFilter(onChangedata).forceInit();
        function onChangedata({name,layer}){
            if (layer){
                switch (name) {
                    case "REMOVE":
                        filterState.layer=filterState.layer.filter(d=>d!==layer);
                        break;
                    case "ADD":
                        filterState.layer.push(layer);
                        break;
                }
            }
            // filter by layer
            currentData.nodes = allData.nodes.filter(d=>filterState.layer.indexOf(d[mainxKEY])>-1);
            let m={};
            currentData.nodes.forEach(n=>m[n.id]=1);
            currentData.links = allData.links.filter(d=>m[d.source.id]&&m[d.target.id]);
            drawFunc.graph(currentData).draw().initFilter(onChangedata).forceInit();
        }
});