//GLOBAL VARIABLES
var select = document.forms['info']['distribution'];

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
		y_axis.push((1 - p) * Math.pow(p, i));
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

	let m = n+1;
	console.assert(x_axis.length == n+1, "Incorrect size: " + x_axis.length + " should be: " + m);

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

function create(){
	console.log("Sucessful submission");
	let choice = select.options[select.selectedIndex].value;

	let p1 = document.getElementById('p1').value;
	let p2 = document.getElementById('p2').value;

	if(p1 == '' || (choice == 'bin' && p2 == '')){
		alert("Please enter the required parameters.");
		return;
	}

	if(isNaN(p1) || isNaN(p2) || p1 < 0 || p2 < 0){
		alert("Please enter only non-negative numbers as parameters.");
		return;
	}

	if(choice == 'geo' || choice == 'bin'){
		if(p1 > 1){
			alert("Success probability must be below 1.");
			return;
		}
	}

	p1 = parseFloat(p1);
	p2 = parseFloat(p2);

	let graph = [];

	switch(choice){
		case 'geo':
			graph.push(geoGraph(p1));
			break;
		case 'exp':
			graph.push(expGraph(p1));
			break;
		case 'bin':
			graph.push(binGraph(p2, p1));
			break;
		case 'poi':
			graph.push(poiGraph(p1));
			break;
	}

	Plotly.newPlot(canvas, graph);
}

function change(){
	let choice = select.options[select.selectedIndex].value;

	let p1l = document.getElementById('p1l');
	let p2l = document.getElementById('p2l');
	let p1 = document.getElementById('p1');
	let p2 = document.getElementById('p2');

	switch(choice){
		case 'geo':
		case 'bin':
			p1l.innerHTML = "Success probability: ";
			p1.value = 0.5;
			break;
		case 'exp':
			p1l.innerHTML = "Rate parameter: ";
			p1.value = 0.5;
			break;
		case 'poi':
			p1l.innerHTML = "Average occurences: ";
			p1.value = 2;
			break;
	}
	
	if(choice == 'bin'){
		p2l.style.visibility = "";
		p2.style.visibility = "";
		p2l.innerHTML = "Number of trials: "
		p2.value = 6;
	}
	else{
		p2l.style.visibility = "hidden";
		p2.style.visibility = "hidden";
	}
}

// Plotly.newPlot('geoGraph', [geoGraph()]);
// Plotly.newPlot('expGraph', [expGraph()]);
// Plotly.newPlot('binGraph', [binGraph()]);
// Plotly.newPlot('poiGraph', [poiGraph()]);