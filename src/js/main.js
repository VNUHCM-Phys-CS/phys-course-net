// parameter
let width = 2000;//window. innerWidth;
let height = 1000;window. innerHeight;
let margin = {top:20,bottom:20,left:20,right:20};
// init
const drawFunc = draw({width,height,margin});
// load data
loadNodeLinks()
    .then(graph=>{
        drawFunc.graph(graph).initZoom().draw().forceInit();
});