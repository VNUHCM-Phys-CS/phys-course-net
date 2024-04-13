const draw= function({width,height,margin}) {
    const mainxKEY = "YEAR";
    const subxKEY = "TERM";
    const colorKEY = "CATEGORY";
    const master = {};
    let widthInner = width-margin.left-margin.right;
    let heightInner = height-margin.top-margin.bottom;
    // init svg
    let svg = d3.select("svg#main_svg")
        .attr('viewBox',`0 0 ${width} ${height}`);
    let g = svg.select('g.holder')
        .attr('transform',`translate(${margin.left},${margin.top})`);
    let gNode = g.select('.holderNode');
    let eNode = gNode.selectAll('g.node');
    let gLink = g.select('.holderLink');
    let eLink = gLink.selectAll('path.link');
    let simulation = d3.forceSimulation();
    let nodes=[];
    let links=[];
    let store = {yHeightinner:32,ymingap:5,_nodes:[],_links:[]};
    const linkDifFunc = d3.linkHorizontal()
    .source(d=>[d.source.x+store.xWidthinner/2,d.source.y])
    .target(d=>[d.target.x-store.xWidthinner/2,d.target.y])
    .x(d=>d[0])
    .y(d=>d[1]);
    const linkSameFunc =(d)=>{
        let tx = d.target.x+store.xWidthinner/2, sx = d.source.x+store.xWidthinner/2,
            dx = tx - sx,
            dy = d.target.y - d.source.y,
            dr = Math.sqrt(dx * dx + dy * dy)/2;
        if (d.source.y<d.target.y )
            return "M" + sx + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + tx + "," + d.target.y;
        else
            return "M" + tx + "," + d.target.y + "A" + dr + "," + dr + " 0 0,1 " + sx + "," + d.source.y;
    };
    const linkFunc = (l)=>{
        if (l.isSameLevel)
            return linkSameFunc(l);
        else {
            let d = linkDifFunc(l);
            if (l.source.id<0){
                d[0] = 'L';
                d = `M${l.source.x-store.xWidthinner/2} ${l.source.y}`+d;
            }
            if (l.target.id<0){
                d += ` L${l.target.x+store.xWidthinner/2} ${l.target.y}`;
            }
            return d;
        }
    };
    let colorByCat = d3.scaleOrdinal(d3.schemeObservable10)
    master.graph = (graph) =>{
        return (arguments.length)?(nodes=graph.nodes,links=graph.links,master):{nodes,link};
    }
    master.initZoom = ()=>{
        const view = svg.select("rect.view")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", width)
            .attr("height", height)
            .attr('opacity',0);
        const zoom = d3.zoom()
            .scaleExtent([0.1, 40])
            // .translateExtent([[-margin.left, -margin.top], [width + 90, height + 100]])
            .filter(filter)
            .on("zoom", zoomed);
        function zoomed({ transform }) {
            g.attr("transform", transform);
        }
        
        function reset() {
            svg.transition()
                .duration(750)
                .call(zoom.transform, d3.zoomIdentity);
        }
    
        // prevent scrolling then apply the default filter
        function filter(event) {
            event.preventDefault();
            return (!event.ctrlKey || event.type === 'wheel') && !event.button;
        }
        Object.assign(svg.call(zoom).node(), {reset});
        return master
    }
    master.draw = ()=>{
        updateStore();
        const {_links,xWidthinner,yHeightinner} = store;
        eNode = gNode.selectAll('g.node')
            .data(nodes)
            .join(enter =>{
                const eNode =enter.append("g").attr("class", "node");
                eNode.append('rect')
                .attr('width',xWidthinner)
                .attr('height',yHeightinner)
                .attr('x',-xWidthinner/2)
                .attr('y',-yHeightinner/2)
                .attr('rx',5)
                .attr('fill',d=>colorByCat(d[colorKEY]))
                .attr('opacity',0.8)
                ;
                eNode.append('text')
                .text(d=>d.id)
                return eNode
            },
            update =>{ 
                update.attr("transform", 'translate()');
                return update;
            });
        eLink = gLink.selectAll('path.link')
            .data(_links)
            .join('path')
            .attr('class','link')
            .attr('fill','none')
            .attr('display',d=>d.lchild?'none':undefined)
            .attr("stroke",d=>d.isSameLevel?"#bbb":d.isVirtual?"red":"#ddd")
            .attr("stroke-width", d=>d.isSameLevel?2:1.5)
            .on("mouseover",(e,l)=>console.log(l));
        return master;
    }
    updateStore = ()=>{
        store.rangeMain = d3.extent(nodes,d=>d[mainxKEY]);
        store.xScaleBand = d3.scaleBand([0,widthInner]).domain(d3.range(store.rangeMain[0],store.rangeMain[1]+1)).paddingInner(0.35);;
        store.rangeSub = d3.extent(nodes,d=>d[subxKEY]);
        store.xWidth = store.xScaleBand.bandwidth();
        store.xScaleinnerBand = d3.scaleBand([0,store.xWidth]).domain(d3.range(store.rangeSub[0],store.rangeSub[1]+1)).paddingInner(0.35);
        store.xWidthinner = store.xScaleinnerBand.bandwidth();
        store.cat = _.uniq(nodes.map(d=>d[colorKEY]));
        colorByCat.domain(store.cat);

        // node and virtual node
        simulation.stop();
        simulation.nodes(nodes)                 // Force algorithm is applied to data.nodes
        .force("link", d3.forceLink()                               // This force provides links between nodes
            .id(function(d) { return d.id; })                     // This provide  the id of a node
            .links(links).strength(1)                                  // and this the list of links
        );

        // Replace the input nodes and links with mutable objects for the simulation.
        store._nodes = [...nodes];
        store._links = [...links];
        // add virtual node/link
        let idvirtual = -1;
        const xstep = 0.5;
        let vnodes = {}; // store id vs layer avoid repeat node
        links.forEach(l=>{
            let lastitem=l.source;
            let child=[];
            for (let i=l.source._step+xstep;i<l.target._step;i+=xstep)
            {
                let _l = vnodes[`${lastitem.id}-${lastitem._step}`];
                if (!_l){
                    const maink = Math.floor(i);
                    const target = {id:idvirtual,_step:i,[mainxKEY]:maink,[subxKEY]:(i-maink)/xstep+1};
                    store._nodes.push(target);
                    idvirtual--;
                    _l = {source:lastitem,target,isVirtual:true};
                    child.push(_l);
                    store._links.push(_l);
                    vnodes[`${lastitem.id}-${lastitem._step}`] = _l;
                    lastitem = target;
                }else{
                    child.push(_l);
                    lastitem = _l.target;
                }
            }
            if (lastitem.id==4)
                debugger
            if (lastitem!==l.source){
                store._links.push({source:lastitem,target:l.target,isVirtual:true});
                l.lchild = child;
            }
        })
    }
    master.forceInit = ()=>{
        const {xScaleBand,xScaleinnerBand} = store;

        simulation.nodes(store._nodes)                 // Force algorithm is applied to data.nodes
        .force("link", d3.forceLink().links(store._links).strength(0.1))                                  // and this the list of links)
        .force("charge", d3.forceManyBody().strength(-200))         // This adds repulsion between nodes.Play with the -400 for the repulsion strength
        .force("xPosition", d3.forceX(d=>xScaleBand(d[mainxKEY])+xScaleinnerBand(d[subxKEY])).strength(2))     // 
        // .force("yPosition", d3.forceY(heightInner/2).strength(0.1) )    // This force attracts nodes to the center of Y
        .on("tick", master.updateNode)
        .on("end", master.fixNodePos);
        gLink.style("display",'hidden');
        simulation.alpha(1).restart();
        return master;
    }
    master.updateNode = ()=>{
        eNode.attr("transform",d=>`translate(${d.x},${d.y})`);
        return master;
    }
    master.fixNodePos = ()=>{
        const {yHeightinner,ymingap,xScaleBand,xScaleinnerBand,_nodes,_links} = store;
        const groupByLayer = d3.groups(_nodes,d=>d._step);
        // arrange y pos
        groupByLayer.forEach(([k,g])=>{
            g.sort((a,b)=>a.y-b.y);
            const maxmem = g.length;
            let maxH = yHeightinner*maxmem + ymingap*(maxmem-1);
            let posy= (heightInner-maxH)/2;
            g.forEach(d=>{
                d.x = xScaleBand(d[mainxKEY])+xScaleinnerBand(d[subxKEY]);
                d.y = posy;
                posy+= yHeightinner+ymingap;
            })
        });
        eNode.attr("transform",d=>`translate(${d.x},${d.y})`);
        gLink.style("display",undefined);
        eLink.attr("d",linkFunc);
        return master;
    }
    return master;
}