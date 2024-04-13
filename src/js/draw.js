const draw= ({width,height,margin}) => {
    const master = {};
    let widthInner = width-margin.left-margin.right;
    let heightInner = height-margin.top-margin.bottom;
    // init svg
    let svg = d3.select("svg#main_svg")
        .attr('viewBox',`[0,0,${width},${height}]`);
    let g = svg.select('g.holder')
        .attr('transform',`translate(${margin.left},${margin.top})`);
    let gNode = g.select('.holderNode');
    let eNode = gNode.selectAll('g.node');
    let gLink = g.select('.holderLink');
    let eLink = gLink.selectAll('path.link');
    master.draw = ({nodes,ticks})=>{
        eNode = gNode.selectAll('g.node')
            .data(nodes)
            .join(enter =>{
                const eNode =enter.append("g").attr("class", "node");
                eNode.append('rect')
                .attr('width')
                return eNode
            },
            update =>{ 
                update.attr("transform", 'translate()');
                return update;
            });
    }
    master.updateNode = ()=>{
        eNode.attr("transform",d=> {
            debugger
            return `translate(${d.x},${d.y})`});
        // eLink.attr("transform",d=> `translate(${d.x},${d.y})`);
    }
    master.paramas = ()=>({width:widthInner,height:heightInner})
    return master;
}