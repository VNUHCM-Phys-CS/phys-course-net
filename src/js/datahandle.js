// load data
async function loadNodeLinks(){
    // handle node
    const nodes = await d3.csv("src/data/nodes.csv")
    .then(d=>{
        d.forEach(element => {
            ["id","YEAR","TERM"].forEach(k=>element[k]= +element[k]);
            element.REQUIRE = !!element.REQUIRE;
            element._step = element.YEAR+(element.TERM-1)/2;
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
    d3.forceSimulation().nodes(nodes)                 // Force algorithm is applied to data.nodes
    .force("link", d3.forceLink()                               // This force provides links between nodes
        .id(function(d) { return d.id; })                     // This provide  the id of a node
        .links(links).strength(0.1)                                  // and this the list of links
    ).stop();
    // check same level
    links.forEach(l=>{
        if(l.source._step===l.target._step)
            l.isSameLevel = true;
    })
    return {nodes,links}
}