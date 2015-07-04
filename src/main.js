var data = {
	rawCSVData: 0,
	treeData: {
		name: "root",
		children: [],
	},
	treemap: 0
};

function map_addChildNode(parent, newName) {
	if(parent.children) {
		for(var i = 0; i < parent.children.length; i++) {
			if(parent.children[i].name == newName)  return parent.children[i];
		}	
	} else parent.children = [];

	var newLength = parent.children.push({
		name: newName,
		value: 0,
	});
	
	return parent.children[newLength-1];
}

function main_init() {
	main_loadData();
};

function main_loadData() {
	d3.csv("data/budget1516.csv",function(d) {
		return {
			"2014-15": +d["2014-15"].replace(',','')*1000,
			"2015-16": +d["2015-16"].replace(',','')*1000,
			"2016-17": +d["2016-17"].replace(',','')*1000,
			"2017-18": +d["2017-18"].replace(',','')*1000,
			"2018-19": +d["2018-19"].replace(',','')*1000,
			"Appropriation type": d["Appropriation type"],
			"Department/Agency": d["Department/Agency"],
			"Description": d["Description"],
			"Expense type": d["Expense type"],
			"Outcome": d["Outcome"],
			"Portfolio": d["Portfolio"],
			
			"Program": d["Program"],
			"Source document": d["Source document"],
			"Source table": d["Source table"],
			"URL": d["URL"]
		};
	}, parseCSVData);
};

function parseCSVData(csvData) {
	if(csvData) {
		var currentNode, path, tokens;
		data.rawCSVData = csvData;
		data.rawCSVData.forEach(function(csvElement) {
			currentNode = map_addChildNode(data.treeData,csvElement["Portfolio"]);

			if(!isNaN(csvElement["2015-16"])) {
				currentNode.value += csvElement["2015-16"];
			}
			
		});
		
		data.treemap = d3.layout.treemap()
			.size([1200, 550])
			.sticky(true)
			.value(function(d) { return d.value; });
		
		function nodeColor(d) {
			return d.children ? null : d3.rgb(Math.min(d.area*0.002,50)|0,Math.min(d.area*0.01,80)|0,Math.min(d.area*0.02,100)|0);
		};
		
		var node = d3.select("#main_content_budget").datum(data.treeData).selectAll(".node")
			.data(data.treemap.nodes)
			.enter().append("div")
			.attr("class", "node")
			.call(nodePosition)
			.style("background-color", nodeColor)
			.on("mouseenter", function(d) {
				d3.select(this)
					.transition()
					.delay(0)
					.duration(350)
					.style('background-color', '#b1438c')
					.style("color", d3.rgb(200,200,200));
			})
			.on("mouseleave", function(d) {
				console.log(d)
				d3.select(this)
					.transition()
					.delay(0)
					.duration(350)
					.style("background-color", nodeColor(d))
					.style("color", d3.rgb(225,225,225));
			})
			.append("div")
			.attr("class", "nodeText")
			.style("font-size", function(d) { 
				if(d.dx < 100) return 0;
				else return Math.min(d.dx/20,28);
			})
			.text(function(d) {
				return d.children ? null : d.name;							
				
			})
			.append("div")
			.attr("class", "nodeCost")
			.style("font-size", function(d) { 
				if(d.dx < 150) return 0;
				else return Math.min((d.dx/20)-4,24);
			})
			.text(function(d) {					
				return d.children ? null : "$" + (d.value / 1000000000).toFixed(2) + "b";
			})
			.append("div")
			.attr("class", "nodeContrib")
			.style("font-size", function(d) { 
				if(d.dx < 150) return 0;
				else return Math.min((d.dx/20)-8,20);
			})
			.text(function(d) {					
				return d.children ? null : "You pay $35";
			});
			
		function nodePosition() {
			this.style("left", function(d) { return d.x + "px"; })
				.style("top", function(d) { return d.y + "px"; })
				.style("width", function(d) { return Math.max(0, d.dx - 1) + "px"; })
				.style("height", function(d) { return Math.max(0, d.dy - 1) + "px"; });
		}
		
	}
};