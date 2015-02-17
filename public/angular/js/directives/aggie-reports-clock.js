angular.module('Aggie')
    .directive('clockVisualization', [
        'VisualizationDataFormatter',
        function(VisualizationDataFormatter) {
            return {
                restrict:'E',
                link: function($scope, element, attributes) {
                    var radians = 0.0174532925,
                        clockRadius = 200,
                        margin = 120,
                        width = (clockRadius+margin)*2,
                        height = (clockRadius+margin)*2,
                        minuteHandLength = clockRadius,
                        secondHandLength = clockRadius-12,
                        secondHandBalance = 30,
                        secondTickStart = clockRadius,
                    secondTickLength = -10,
                    secondLabelRadius = clockRadius + 16,
                    secondLabelYOffset = 5;

                    var graphDataStart = clockRadius + 25,
                        graphDatalength = 30,
                        minGraphStart = clockRadius - 100;

                    var minuteScale = secondScale = d3.scale.linear()
                        .range([0,354])
                        .domain([0,59]);

                    var handData = [
                        {
                            type:'minute',
                            value:0,
                            length:-minuteHandLength,
                            scale:minuteScale
                        },
                        {
                            type:'second',
                            value:0,
                            length:-secondHandLength,
                            scale:secondScale,
                            balance:secondHandBalance
                        }
                    ];


                    function drawClock(){ //create all the clock elements
                        updateData();	//draw them in the correct starting position
                        var svg = d3.select(element[0]).append("svg")
                            .attr("width", width)
                            .attr("height", height);

                        var face = svg.append('g')
                            .attr('id','clock-face')
                            .attr('transform','translate(' + (clockRadius + margin) + ',' + (clockRadius + margin) + ')');

                        //add marks for seconds
                        face.selectAll('.second-tick')
                            .data(d3.range(0,60)).enter()
                            .append('line')
                            .attr('class', 'second-tick')
                            .attr('x1',0)
                            .attr('x2',0)
                            .attr('y1',secondTickStart)
                            .attr('y2',secondTickStart + secondTickLength)
                            .attr('transform',function(d){
                                return 'rotate(' + secondScale(d) + ')';
                            });
                        //and labels

                        face.selectAll('.second-label')
                            .data(d3.range(5,61,5))
                            .enter()
                            .append('text')
                            .attr('class', 'second-label')
                            .attr('text-anchor','middle')
                            .attr('x',function(d){
                                return secondLabelRadius*Math.sin(secondScale(d)*radians);
                            })
                            .attr('y',function(d){
                                return -secondLabelRadius*Math.cos(secondScale(d)*radians) + secondLabelYOffset;
                            })
                            .text(function(d){
                                return d;
                            });

                        renderReportsGraph();

                        var hands = face.append('g').attr('id','clock-hands');

                        face.append('g').attr('id','face-overlay')
                            .append('circle').attr('class','hands-cover')
                            .attr('x',0)
                            .attr('y',0)
                            .attr('r',clockRadius/20);

                        hands.selectAll('line')
                            .data(handData)
                            .enter()
                            .append('line')
                            .attr('class', function(d){
                                return d.type + '-hand';
                            })
                            .attr('x1',0)
                            .attr('y1',function(d){
                                return d.balance ? d.balance : 0;
                            })
                            .attr('x2',0)
                            .attr('y2',function(d){
                                return d.length;
                            })
                            .attr('transform',function(d){
                                return 'rotate('+ d.scale(d.value) +')';
                            });
                    }

                    function moveHands(){
                        d3.select('#clock-hands').selectAll('line')
                            .data(handData)
                            .transition()
                            .attr('transform',function(d){
                                return 'rotate('+ d.scale(d.value) +')';
                            });
                    }

                    function updateData(){
                        var t = new Date();
                        handData[0].value = t.getMinutes();
                        handData[1].value = t.getSeconds();
                    }

                    drawClock();

                    setInterval(function(){
                        updateData();
                        moveHands();
                        renderReportsGraph();
                    }, 1000);

                    d3.select(self.frameElement).style("height", height + "px");

                    function renderReportsGraph() {
                        if(handData[1].value == 0 ){
                            //clear seconds data
                            d3.select('#clock-face').selectAll('.reports-data.sec').remove();
                            renderMinReportsGraph();
                        }
                        var secReportsData = formatData(getReportPerSecond(handData[1].value));

                        var graphScale = d3.scale.linear()
                            .range([0, graphDatalength])
                            .domain([0,( d3.max(secReportsData[0].data, function(d){
                                return d.value;
                            }))]);

                        var secReport = d3.select('#clock-face').selectAll('reports-data sec')
                            .data(secReportsData).enter()
                            .append('g')
                            .attr('class', 'reports-data sec')
                            .attr('x1', 0)
                            .attr('x2', 0)
                            .attr('y1', graphDataStart)
                            .attr('y2', graphDataStart + graphDatalength)
                            .attr('transform',function(report){
                                return 'rotate(' + (180 + (6 * (report.second - 1))) + ')';
                            });

                        secReport.selectAll('rect')
                            .data(function(d){ return d.data}).enter()
                            .append('rect')
                            .attr('width', 10)
                            .attr('x', -5)
                            .attr('class', function(d) {
                                switch (d.type) {
                                    case 'facebook':
                                        return 'facebook-source';
                                    case 'twitter':
                                        return 'twitter-source';
                                    case 'elmo':
                                        return 'elmo-source';
                                    case 'rss':
                                        return 'rss-source';
                                    default:
                                        return 'unknown-source';
                                }
                            })
                            .attr('y', function(d) {
                                return graphDataStart + graphScale(d.y0);
                            })
                            .attr("height", function(d) {
                                return (graphScale(d.y1) - graphScale(d.y0));
                            });


                    }                     s

                    function renderMinReportsGraph() {
                        if(handData[0].value == 0){
                            d3.select('#clock-face').selectAll('.reports-data.min').remove();
                        }
                        var minReportsData = formatData(getReportPerMinute(handData[0].value));

                        var graphScale = d3.scale.linear()
                            .range([graphDatalength, 0])
                            .domain([0,( d3.max(minReportsData[0].data, function(d){
                                return d.value;
                            }))]);

                        var minReport = d3.select('#clock-face').selectAll('reports-data min')
                            .data(minReportsData).enter()
                            .append('g')
                            .attr('class', 'reports-data min')
                            .attr('x1', 0)
                            .attr('x2', 0)
                            .attr('y1', minGraphStart)
                            .attr('y2', minGraphStart - graphDatalength)
                            .attr('transform',function(report){
                                return 'rotate(' + (180 + (6 * (report.minute - 1))) + ')';
                            });

                        minReport.selectAll('rect')
                            .data(function(d){ return d.data}).enter()
                            .append('rect')
                            .attr('width', 10)
                            .attr('x', -5)
                            .attr('class', function(d) {
                                switch (d.type) {
                                    case 'facebook':
                                        return 'facebook-source';
                                    case 'twitter':
                                        return 'twitter-source';
                                    case 'elmo':
                                        return 'elmo-source';
                                    case 'rss':
                                        return 'rss-source';
                                    default:
                                        return 'unknown-source';
                                }
                            })
                            .attr('y', function(d) {
                                return minGraphStart - graphScale(d.y0);
                            })
                            .attr("height", function(d) {
                                return -(graphScale(d.y1) - graphScale(d.y0));
                            });
                    }

                    function getReportPerSecond(second){

                        return [{
                            second: second,
                            minute: 0,
                            hour: 0,
                            data: [
                                {
                                    type: 'twitter',
                                    value: Math.floor(Math.random() * 1000) + 1
                                },
                                {
                                    type: 'rss',
                                    value: Math.floor(Math.random() * 1000) + 1
                                },
                                {
                                    type: 'elmo',
                                    value: Math.floor(Math.random() * 1000) + 1
                                },
                                {
                                    type: 'facebook',
                                    value: Math.floor(Math.random() * 1000) + 1
                                }
                            ]
                        }]

                    }

                    function getReportPerMinute(minute){

                        return [{
                            second: 0,
                            minute: minute,
                            hour: 0,
                            data: [
                                {
                                    type: 'twitter',
                                    value: Math.floor(Math.random() * 1000) + 1
                                },
                                {
                                    type: 'rss',
                                    value: Math.floor(Math.random() * 1000) + 1
                                },
                                {
                                    type: 'elmo',
                                    value: Math.floor(Math.random() * 1000) + 1
                                },
                                {
                                    type: 'facebook',
                                    value: Math.floor(Math.random() * 1000) + 1
                                }
                            ]
                        }]

                    }
                    function formatData(data){
                        data[0].data.sort(function(a, b) {
                            return a.value - b.value;
                        });

                        var y0 = 0;
                        data[0].data =  data[0].data.map(function(report) {
                            return {
                                type: report.type,
                                value: report.value,
                                y0: y0,
                                y1: y0 += report.value
                            }
                        });

                        return data;
                    }
                }
            }
    }]);