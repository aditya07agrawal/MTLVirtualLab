// // var trace1 = {
// // 	x: [1, 2, 3, 4],
// // 	y: [10, 15, 13, 17],
// // 	mode: 'markers',
// // 	type: 'scatter'
// // };

// // var trace2 = {
// // 	x: [2, 3, 4, 5],
// // 	y: [16, 5, 1, 9],
// // 	mode: 'lines',
// // 	type: 'scatter'
// // };

// // var trace3 = {
// // 	x: [1, 2, 3, 4],
// // 	y: [12, 9, 15, 12],
// // 	mode: 'lines+markers',
// // 	type: 'scatter'
// // };

// // var data = [trace1, trace2, trace3];

// Plotly.newPlot('myChart', data)


//HELPER FUNCTIONS
function binom(n, k, p = 0.5){
	return math.combinations(n, k) * Math.pow(p, k) * Math.pow(1-p, n-k);
}

//MAIN FUNCTIONS
var canvas = document.getElementById('graph');

function geoGraph(p=0.5){
	let N = 10;

	const x_axis = [], y_axis = [];
	for(let i = 0; i <= N; i++) {
		x_axis.push(i);
		y_axis.push(p * Math.pow(1-p, i));
	}

	console.assert(x_axis.length == N+1, "incorrect size: " + x_axis.length);

	return {
		x: x_axis, y: y_axis,
		mode: 'markers',
		type: 'scatter'
	};
}

function expGraph(l=0.5){
	let N = 10.0;
	let step = 0.1

	const x_axis = [], y_axis = [];
	for(let i = 0.0; i <= N; i += step) {
		x_axis.push(i);
		y_axis.push(l*Math.exp(-1*l*i));
	}

	console.assert(x_axis.length == N/step+1, "incorrect size: " + x_axis.length);

	return {
		x: x_axis, y: y_axis,
		mode: 'lines',
		type: 'scatter'
	};
}

function binGraph(n=6, p=0.5){
	const x_axis = [], y_axis = [];
	for(let i = 0; i <= n; i++){
		x_axis.push(i);
		y_axis.push(binom(n, i, p));
	}

	console.assert(x_axis.length == n+1, "incorrect size: " + x_axis.length);

	return {
		x: x_axis, y: y_axis,
		mode: 'markers',
		type: 'scatter'
	};
}

function poiGraph(l=2){
	let N = 10;

	const x_axis = [], y_axis = [];
	for(let i = 0; i <= N; i++) {
		x_axis.push(i);
		y_axis.push(Math.pow(l, i) * Math.exp(-l) / math.factorial(i));
	}

	console.assert(x_axis.length == N+1, "incorrect size: " + x_axis.length);

	return {
		x: x_axis, y: y_axis,
		mode: 'markers',
		type: 'scatter'
	};
}


function submit(){
	let select = document.getElementById('distribution');
	let choice = select.options[select.selectedIndex].value;

	let graph;

	switch(choice){
		case 'geo':
			graph = [geoGraph()];
			break;
		case 'exp':
			graph = [expGraph()];
			break;
		case 'bin':
			graph = [binGraph()];
			break;
		case 'poi':
			graph = [poiGraph()];
			break;
	}

	Plotly.newPlot(canvas, graph);
}

// Plotly.newPlot('geoGraph', [geoGraph()]);
// Plotly.newPlot('expGraph', [expGraph()]);
// Plotly.newPlot('binGraph', [binGraph()]);
// Plotly.newPlot('poiGraph', [poiGraph()]);