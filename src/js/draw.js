const draw= ({width,height,margin}) => {
    const master = {};
    let widthInner = width-margin.left-margin.right;
    let heightInner = height-margin.top-margin.bottom;
    // init svg
    let svg = d3.select("svg#main_svg")
        .attr('viewBox',[0,0,width,height]);
    let g = svg.select('g.holder')
        .attr('transform',`translate(${margin.left},${margin.top})`);
    let gNode = g.select('.holderNode');
    let gLink = g.select('.holderLink');
    master.draw = ({nodes,ticks})=>{
        gNode.selectAll('g.node')
            .data(node)
            .join(enter =>()=>{
                const eNode =enter.append("g").attr("class", "node");

                return eNode
            },
            update =>{ 
                update.attr("fill", "blue");
                return update;
            });
    }
    return master;
}