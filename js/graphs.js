"use strict";

// import Distribution from "./distribution.js";

//GRAPH FUNCTIONS
function distGraph(p1, p2, dist='und', dis=true){
	let x = [], y = [];

	let [start, end] = Limits.get(dist)(p1, p2);
	let freq = (dis? 1: DENSITY), gap = 1/freq;

	start = Math.ceil(start * freq);
	end = Math.trunc(end * freq);

	let total = 0;
	for(let i = start; i <= end && (isFinite(end) || total <= MAXP); i++){
		x.push(i*gap);
		y.push(Dist.get(dist)(i*gap, p1, p2));
		total += y.at(-1);
	}

	return {
		name: "Theoretical",
		x: x, y: y,
		mode: (dis? 'markers': 'lines'),
		type: 'scatter'
	};
}

function randGraph(p1, p2, dist='und', dis=true){
	if(dis){
		const m = new Map();
		for(let i = 0; i < TRIALS; i++){
			let v = Rand.get(dist)(p1, p2);
			let cnt = (m.has(v)? m.get(v): 0);
			m.set(v, cnt+1);
		}
		const x = Array.from(m.keys());
		const y = (Array.from(m.values())).map((x) => x/TRIALS);

		return{
			name: "Randomized",
			type: 'bar',
			x: x, y: y,
			width: 0.4
		}
	}

	const res = [];
	for(let i = 0; i < TRIALS; i++){
		res.push(Rand.get(dist)(p1, p2));
	}

	return {
		name: "Randomized",
		x: res,
		type: 'histogram',
		histnorm: 'probability density'
	};
}

function clteGraph(p1, p2, dist='und', cnt=100, dis=true){
	let x = [];
	for(let i = 0; i < TRIALS; i++){
		x.push(0);
		for(let j = 0; j < cnt; j++){
			x[i] += Rand.get(dist)(p1, p2);
		}
		x[i] /= cnt;
	}

	let trace = {
		name: "Experimental",
		x: x,
		type: 'histogram',
		histnorm: 'probability density'
	}

	if(dis){
		trace['xbins'] = {size: 1/cnt};
	}

	return trace;
}

function cumuGraph(p1, p2, dist='und', dis=true){
	let x = [], y = [];

	let [start, end] = Limits.get(dist)(p1, p2);
	let freq = DENSITY, gap = 1/freq;

	start = Math.ceil(start * freq);
	end = Math.trunc(end * freq);

	x.push(start*gap - gap);
	y.push(0);

	for(let i = start; i <= end && (isFinite(end) || y.at(-1) <= MAXP); i++){
		x.push(i*gap);
		y.push(cDist.get(dist)(i*gap, p1, p2));
	}

	return {
		name: "Theoretical",
		x: x, y: y,
		mode: 'lines',
		type: 'scatter'
	};
}

function cumuGraph2(p1, p2, dist='und'){
	return x => {return cDist.get(dist)(x, p1, p2)};
}

//MAIN FUNCTIONS
function validate(choice){
	if(choice == ""){
		throw ("Please choose a distribution.");
	}

	//Validation of inputed parameters
	let p1 = document.getElementById('p1').value;
	let p2 = document.getElementById('p2').value;

	if(p1 == '' || (parameter2.has(choice) && p2 == '')){
		throw ("Please enter the required parameters.");
	}

	if(isNaN(p1) || isNaN(p2) || p1 < 0 || p2 < 0){
		throw ("Please enter only non-negative numbers as parameters.");
	}

	if((choice == 'geo' || choice == 'bin') && (p1 > 1)){
		throw ("Success probability must be below 1.");
	}

	console.log("Successful validation!");

	p1 = parseFloat(p1);
	p2 = parseFloat(p2);

	return [p1, p2];
}

function validate3(){
	let p3 = document.getElementById('p3').value;

	if(p3 == ''){
		throw ("Please enter the required parameters.");
		return;
	}

	if(isNaN(p3) || p3 < 0){
		throw ("Please enter only non-negative numbers as parameters.");
		return;
	}

	console.log("Successful validation!");

	p3 = parseInt(p3);

	return p3;
}

function PDF(){
	const choice = select.options[select.selectedIndex].value;
	const discrete = disc.includes(choice);

	layout.yaxis.title = "Probability " + (discrete? "Mass": "Density");

	try{
		const [p1, p2] = validate(choice);

		//Graphing
		let theo = document.getElementById('theo').checked;
		let rand = document.getElementById('rand').checked;

		let graph = [];

		if(theo){
			graph.push(distGraph(p1, p2, choice, discrete));
		}

		if(rand){
			graph.push(randGraph(p1, p2, choice, discrete));
		}

		Plotly.newPlot(canvas, graph, layout);
		outputMean(choice, p1, p2);
	}catch(e){
		alert(e);
	}
}

function CDF(){
	const choice = select.options[select.selectedIndex].value;
	const discrete = disc.includes(choice);

	layout.yaxis.title = "Probability " + (discrete? "Mass": "Density");

	try{
		const [p1, p2] = validate(choice);

		//Graphing
		let graph = [];

		graph.push(cumuGraph(p1, p2, choice, discrete));

		Plotly.newPlot(canvas, graph, layout);
	}catch(e){
		alert(e);
	}
}

function CDF2(){
	const choice = select.options[select.selectedIndex].value;
	const discrete = disc.includes(choice);

	layout.yaxis.title = "Probability " + (discrete? "Mass": "Density");

	try{
		const [p1, p2] = validate(choice);
		const [s, e] = Limits.get(choice)(p1, p2);

		board2.removeObject(['plt']);
		board2.setBoundingBox([s-0.1, 1.1, Math.min(e, 10)+0.1, -0.1]);
		board2.create('functiongraph', [cumuGraph2(p1, p2, choice)], {id: 'plt'});
	}catch(e){
		alert(e);
	}
}

function CLT(){
	let choice = select.options[select.selectedIndex].value;
	
	layout.yaxis.title = "Probability Density";

	try{
		const [p1, p2] = validate(choice);
		const p3 = validate3();

		const mean = Mean.get(choice)(p1, p2);
		const sd = Math.sqrt(Variance.get(choice)(p1, p2)/p3)

		let graph = [];

		graph.push(clteGraph(p1, p2, choice, p3, disc.includes(choice)));
		graph.push(distGraph(mean, sd, 'nor', false));

		Plotly.newPlot(canvas, graph, layout);
		outputMean(choice, p1, p2);
	}catch(e){
		alert(e);
	}
}

function change(){
	let choice = select.options[select.selectedIndex].value;

	const elements = document.getElementsByClassName('parameter');
	for(let e of elements) {e.style.visibility = "visible";}

	document.getElementById('p1l').innerHTML = parameter1.get(choice) + ": ";
	document.getElementById('p1').value = default_p1.get(choice);

	if(parameter2.has(choice)){
		document.getElementById('p2l').innerHTML = parameter2.get(choice) + ": ";
		document.getElementById('p2').value = default_p2.get(choice);
	}
	else{
		p2l.style.visibility = "hidden";
		p2.style.visibility = "hidden";
	}

	if(document.head.id == "std"){
		document.getElementById('prl').innerHTML = (disc.includes(choice)? "P(X = x) = ": "p(x) = ");
	}
}

function outputMean(choice, p1=0, p2=0){
	let val = Mean.get(choice)(p1, p2);
	let txt = "Mean = " + val.toString();
	document.getElementById('mean').innerHTML = txt;
}

function outputProbability(){
	const choice = select.options[select.selectedIndex].value;

	try{
		const [p1, p2] = validate(choice);
		let x = document.getElementById('x').value;

		if(isNaN(x)){
			throw ("Please enter a number.");
		}

		document.getElementById('pr').value = (x == ""? "": Dist.get(choice)(parseFloat(x), p1, p2));
	}catch(e){
		alert(e);
	}
}

function outputCumulativeProbability(){
	const choice = select.options[select.selectedIndex].value;

	try{
		const [p1, p2] = validate(choice);
		let x = document.getElementById('x').value;

		if(isNaN(x)){
			throw ("Please enter a number.");
		}

		document.getElementById('pr').value = (x == ""? "": cDist.get(choice)(parseFloat(x), p1, p2));
	}catch(e){
		alert(e);
	}
}