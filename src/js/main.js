// parameter
let width = 2000;//window. innerWidth;
let height = 1000;window. innerHeight;
let margin = {top:20,bottom:20,left:20,right:20};
const mainxKEY = "YEAR";
const subxKEY = "TERM";
const colorKEY = "CATEGORY";
const strokeKEY = "REQUIRE";
const groupCat = [
    {key:"Đại cương",value:[]},
    {key:"Cơ sở ngành",value:[]},
    {key:"Chuyên ngành hướng 1",value:["Chuyên ngành hướng 1 VLHN","Chuyên ngành hướng 1 VLĐC","Chuyên ngành hướng 1 VLLT"]},
    {key:"Chuyên ngành hướng 2",value:["Chuyên ngành hướng 2 VLCR","Chuyên ngành hướng 2 VLTH","Chuyên ngành hướng 2 VLĐT","Chuyên ngành hướng 2 VLUD"]},
]
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
        drawFunc.graph(currentData).setColorByCat(catall).setCustomCat(groupCat).initZoom().draw().initFilter(onChangedata).forceInit();
        function onChangedata({name,layer,cat}){
            currentData.nodes = allData.nodes;
            currentData.links = allData.links;
            switch (name) {
                case "REMOVE":
                    filterState.layer=filterState.layer.filter(d=>d!==layer);
                    break;
                case "ADD":
                    filterState.layer.push(layer);
                    break;
                case "SELECT":
                    if (cat.length){
                        currentData.nodes=[];
                        cat.forEach((c,i)=>{
                            if (c&&c.length){
                                allData.nodes.forEach(d=>{
                                if ((d[mainxKEY]===(i+1)) && (c.find(c=>c===d[colorKEY])))
                                    currentData.nodes.push(d);
                                })
                            }else {
                                allData.nodes.forEach(d=>{
                                    if ((d[mainxKEY]===(i+1)))
                                        currentData.nodes.push(d);
                                    })
                            }
                        });
                    }
                    break;
            }
            // filter by layer
            currentData.nodes = currentData.nodes.filter(d=>filterState.layer.indexOf(d[mainxKEY])>-1);
            let m={};
            currentData.nodes.forEach(n=>m[n.id]=1);
            currentData.links = currentData.links.filter(d=>m[d.source.id]&&m[d.target.id]);
            drawFunc.graph(currentData).draw().initFilter(onChangedata).forceInit();
        }
});

function downloadFunc(canvas, filename) {
    const data = canvas.toDataURL("image/png;base64");
    const donwloadLink = document.querySelector("#download");
    donwloadLink.download = filename;
    donwloadLink.href = data;
    donwloadLink.click();
}
d3.select("#imagedownload").on("click", function(event){
    event.preventDefault();
    event.stopImmediatePropagation();
    html2canvas(document.querySelector("body")).then((canvas) => {
        downloadFunc(canvas,"Phys_course");
    });
});