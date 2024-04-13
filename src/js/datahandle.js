// load data
async function loadNodeLinks(){
    // handle node
    const nodes = await d3.csv("src/data/nodes.csv")
    .then(d=>{
        d.forEach(element => {
            ["id","YEAR","TERM"].forEach(k=>element[k]= +element[k]);
            element.REQUIRE = !!element.REQUIRE;
            element._step = element.Year+element.TERM/2;
        });
        return d;
    });
    const links = await d3.csv("src/data/links.csv")
    .then(d=>{
        d.forEach(element => {
            ["source","target"].forEach(k=>element[k]= +element[k]);
        });
        return d;
    });
    return {nodes,links}
}
// create force
const mainxKEY = "YEAR";
const subxKEY = "TERM";
function createForce({nodes,links},{width,height},ticked){
    const rangeMain = d3.extend(nodes,d=>d[mainxKEY]);
    let xScaleBand = d3.scaleBand([0,width]).domain(d3.range(rangeMain[0],rangeMain[1])).paddingInner(0.35);;
    const rangeSub = d3.extend(nodes,d=>d[subxKEY]);
    const xWidth = xScaleBand.bandwidth();
    const xScaleinnerBand = d3.scaleBand([0,xWidth]).domain(d3.range(rangeSub[0],rangeSub[1])).paddingInner(0.35);
    const xWidthinner = xScaleinnerBand.bandwidth;
    let simulation = d3.forceSimulation(nodes)                 // Force algorithm is applied to data.nodes
    .force("link", d3.forceLink()                               // This force provides links between nodes
          .id(function(d) { return d.id; })                     // This provide  the id of a node
          .links(links)                                    // and this the list of links
    )
    .force("charge", d3.forceManyBody().strength(-400))         // This adds repulsion between nodes. Play with the -400 for the repulsion strength
    .force("xPosition", d3.forceX(d=>xScaleBand(d[mainxKEY])+xScaleinnerBand(d[subxKEY])))     // 
    .force("yPosition", d3.forceY(height/2).strength(0.2) )    // This force attracts nodes to the center of Y
    .on("end", ticked);
}