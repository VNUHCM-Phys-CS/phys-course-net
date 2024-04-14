const draw= function({width,height,margin}) {
    const mainxKEY = "YEAR";
    const subxKEY = "TERM";
    const colorKEY = "CATEGORY";
    const strokeKEY = "REQUIRE";
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
    let gGrid = g.select('g.grid');
    let simulation = d3.forceSimulation();
    let nodes=[];
    let links=[];
    let store = {yHeightinner:48,ymingap:5,gap:0.2,_nodes:[],_links:[]};
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
    let colorByCat = d3.scaleOrdinal(d3.schemePaired)
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
        const {_links,xWidthinner,xScaleBand,xWidth,yHeightinner,layer,gap} = store;
        gGrid.selectAll('rect.bound').data(layer)
            .join('rect')
            .attr('class','bound')
            .attr('id',d=>'areaYear'+d)
            .attr('width',xWidth*(1+gap*2))
            .attr('height',height*2+yHeightinner*(0.5+gap)*2)
            .attr('x',d=>xScaleBand(d)-xWidthinner/2-gap*xWidth)
            .attr('y',-height-yHeightinner*(0.5+gap))
            .attr('fill','#e1e1e1');
        // connect with button
        layer.forEach(d=>{
            d3.select("#btnYear"+d)
            .on("mouseover",(e,v)=>d3.select("#areaYear"+d).classed('blink',true))
            .on("mouseleave",(e,v)=>d3.select("#areaYear"+d).classed('blink',false))
        })

        eNode = gNode.selectAll('g.node')
            .data(nodes,n=>n.id)
            .join(enter =>{
                const eNode =enter.append("g").attr("class", "node");
                eNode.append('rect')
                .attr('width',xWidthinner)
                .attr('height',yHeightinner)
                .attr('x',-xWidthinner/2)
                .attr('y',-yHeightinner/2)
                .attr('rx',5)
                .attr('fill',d=>colorByCat(d[colorKEY]))
                .attr('opacity',0.6)
                .attr('stroke',d=> d[strokeKEY]!==1?'#222':'none')
                .attr('stroke-width',d=>d[strokeKEY]!==1?2:undefined)
                .attr('stroke-dasharray',d=>d[strokeKEY]===2?4:undefined)
                ;
                const textO = eNode.append('foreignObject')
                .attr('x',-xWidthinner/2)
                .attr('y',-yHeightinner/2)
                .attr('width',xWidthinner)
                .attr('height',yHeightinner)
                .style('overflow','hidden');
                textO
                .append('xhtml:div')
                .attr('class','textCat text-center h-full')
                .attr('title',s=>s.NAME)
                .append('xhtml:p')
                .attr('class','leading-5 align-middle line-clamp-2')
                    .html(d=>d.NAME);
                return eNode
            },update=>{
                update.transition().attr("transform",d=>`translate(${d.x},${d.y})`);
                return update;
            }),remove=>{
                remove.transition().attr('opacity',0).remove();
                return remove;
            };
        eNode.each(function(){
            const e= d3.select(this);
            e.datum()._el = e;
        })
        eNode.call(handleFreeze,
            function(){
            },
            function(){
                svg.classed('onHighlight',true);
                const el = d3.select(this);
                const v = el.datum();
                el.classed('highlight',true);
                //pre link
                v._linkspre.forEach(l=>{
                    retrive(l,'source','_linkspre');
                })
                v._linksnext.forEach(l=>{
                    retrive(l,'target','_linksnext');
                })
                function retrive(l,key,keylink){
                    if (l._el) l._el.classed('highlight',true);
                    if (l[key]._el) l[key]._el.classed('highlight',true);
                    l[key][keylink].forEach(l=>retrive(l,key,keylink));
                }
            },
            function(){
                svg.classed('onHighlight',false);
                g.selectAll('.highlight').classed('highlight',false);
            }
        )
        eLink = gLink.selectAll('path.link')
            .data(_links)
            .join('path')
            .attr('class','link')
            .attr('fill','none')
            .attr('display',d=>d.lchild?'none':undefined)
            .attr("stroke",d=>d.isSameLevel?"#aaa":"#bbb")
            .attr("stroke-width", d=>d.isSameLevel?2:1.5)
            // .on("mouseover",(e,l)=>console.log(l));
        eLink.each(function(){
            const e= d3.select(this);
            e.datum()._el = e;
        })
        master.drawLegend();
        return master;
    }
    function handleFreeze(el,clickFunc,mouseoverFunc,mouseleaveFunc){
        return el.on('click',function(e,v){
            if (store.isFreeze){
                store.isFreeze.mouseleaveFunc();
            }
            if (store.isFreeze.v===v)
                    store.isFreeze = undefined;
            else{
                clickFunc.bind(this)();
                store.isFreeze = {v,clickFunc:clickFunc.bind(this),mouseoverFunc:mouseoverFunc.bind(this),mouseleaveFunc:mouseleaveFunc.bind(this)}
            }
        })
        .on('mouseover',function(e,v){
            if (!store.isFreeze){
                mouseoverFunc.bind(this)();
            }
        })
        .on('mouseleave',function(e,v){
            if (!store.isFreeze){
                mouseleaveFunc.bind(this)();
            }
        })
    }
    master.drawLegend = ()=>{
        let legenG = d3.select('.legend .cat');
        const lh = legenG.selectAll('div.h')
        .data(colorByCat.domain())
        .join('div')
        .attr('class','h flex p-1');
        lh.append('div')
            .attr('class','colorbox h-4 w-6')
            .style('background-color',d=>colorByCat(d));
        lh.append('p')
            .attr('class','textcolorbox h-4 leading-3 ml-1 mr-1')
            .html(d=>d);


    }
    updateStore = ()=>{
        store.rangeMain = d3.extent(nodes,d=>d[mainxKEY]);
        store.layer = d3.range(store.rangeMain[0],store.rangeMain[1]+1);
        store.xScaleBand = d3.scaleBand([0,widthInner]).domain(store.layer).paddingInner(0.35);;
        store.rangeSub = d3.extent(nodes,d=>d[subxKEY]);
        store.xWidth = store.xScaleBand.bandwidth();
        store.xScaleinnerBand = d3.scaleBand([0,store.xWidth]).domain(d3.range(store.rangeSub[0],store.rangeSub[1]+1)).paddingInner(0.35);
        store.xWidthinner = store.xScaleinnerBand.bandwidth();
        store.cat = _.uniq(nodes.map(d=>d[colorKEY]));
        colorByCat.domain(store.cat);

        // node and virtual node
        simulation.stop();

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
                    const target = {id:idvirtual,_step:i,[mainxKEY]:maink,[subxKEY]:(i-maink)/xstep+1,[colorKEY]:l.target[colorKEY]};
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
            if (lastitem!==l.source){
                store._links.push({source:lastitem,target:l.target,isVirtual:true});
                l.lchild = child;
            }
        })
        // add link to node
        store._nodes.forEach(n=>{n._linkspre=[];n._linksnext=[];});
        store._links.forEach(l=>{
            l.source._linksnext.push(l);
            l.target._linkspre.push(l);
        })
        store.groupByLayer = d3.groups(store._nodes,d=>d._step);
        let maxE = 0;
        store.groupByLayer.forEach(([k,g])=>{
            maxE = Math.max(maxE,g.length);
        })
        store.groupByLayer.maxE = maxE;
    }
    master.forceInit = ()=>{
        const {xScaleBand,xScaleinnerBand,widthInner,groupByLayer,yHeightinner} = store;
        const cat = colorByCat.domain();
        const yorder = d3.scaleOrdinal().domain(cat).range(d3.range(0,cat.length));
        
        const yScale = d3.scaleLinear().domain([0,cat.length]).range([-groupByLayer.maxE*yHeightinner/2,groupByLayer.maxE*yHeightinner/2]);
        simulation.nodes(store._nodes)                 // Force algorithm is applied to data.nodes
        .force("link", d3.forceLink().links(store._links).strength(0.5))                                  // and this the list of links)
        .force("charge", d3.forceManyBody().strength(-400))         // This adds repulsion between nodes.Play with the -400 for the repulsion strength
        .force("xPosition", d3.forceX(d=>xScaleBand(d[mainxKEY])+xScaleinnerBand(d[subxKEY])).strength(1))     // 
        .force("yPosition", d3.forceY(d=>yScale(yorder(d[colorKEY]))).strength(0.4))
        .force("collide", d3.forceCollide().radius(d => widthInner + 1).iterations(2))
        .on("tick", master.updateNode)
        .on("end", master.fixNodePos);
        gLink.style("display",'hidden');
        simulation.alpha(0.8).restart();
        return master;
    }
    master.updateNode = ()=>{
        eNode.attr("transform",d=>`translate(${d.x},${d.y})`);
        return master;
    }
    master.fixNodePos = ()=>{
        const {yHeightinner,ymingap,xScaleBand,xScaleinnerBand,_nodes,layer,gap} = store;
        const groupByLayer = d3.groups(_nodes,d=>d._step);
        const maxHL=[];
        // arrange y pos
        groupByLayer.forEach(([k,g])=>{
            g.sort((a,b)=>a.y-b.y);
            const maxmem = g.length;
            let maxH = yHeightinner*maxmem + ymingap*(maxmem-1);
            let posy= (heightInner-maxH)/2;
            const lmax = {step:k,y0:Infinity,y1:-Infinity}
            maxHL.push(lmax);
            g.forEach(d=>{
                d.x = xScaleBand(d[mainxKEY])+xScaleinnerBand(d[subxKEY]);
                d.y = posy;
                if (!d.isVirtual){
                    lmax.y0 = Math.min(lmax.y0,d.y);
                    lmax.y1 = Math.max(lmax.y1,d.y);
                }
                posy+= yHeightinner+ymingap;
            })
        });

        const groupByMainLayer = d3.rollup(maxHL,d=>{
            const y0=d3.min(d,de=>de.y0),y1=d3.max(d,de=>de.y1);
            const h = y1-y0;
            return {y0,y1,h}
        }
        ,d=>Math.floor(d.step));
        gGrid.selectAll('rect.bound')
        .attr('height',d=>(groupByMainLayer.get(d).h)+yHeightinner*(0.5+gap)*2)
        .attr('y',d=>groupByMainLayer.get(d).y0-yHeightinner*(0.5+gap));

        eNode.attr("transform",d=>`translate(${d.x},${d.y})`);
        gLink.style("display",undefined);
        eLink.attr("d",linkFunc);
        return master;
    }
    return master;
}