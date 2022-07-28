"use strict";

// import Distribution from "./distribution.js";

//GLOBAL VARIABLES
const select = document.forms['info']['distribution'];
const canvas = document.getElementById('graph');

const MINP = 0.00001;							//Minimum probability shown
const MAXP = 0.99999;							//Maximum probability shown
const MINP_LOG = Math.log(MINP);				//Minimum probabiliy log
const DENSITY = 1000;							//Density(Number of points per unit) of continuous graphs;
const TRIALS = 10000;							//Number of trials of an experiment

const disc = ['und', 'geo', 'bin', 'poi'];										//Discrete distributions
const cont = ['unc', 'exp', 'gam', 'bet', 'chi', 'nor', 'erl', 'stu'];			//Continuous distributions

//Distribution information
const parameter1 = new Map([
	['und', 'Start'],
	['geo', 'Success probability'],
	['bin', 'Success probability'],
	['poi', 'Average occurrences'],
	['unc', 'Start'],
	['exp', 'Rate parameter'],
	['nor', 'Mean'],
	['gam', 'Shape parameter'],
	['erl', 'Shape parameter'],
	['bet', 'Alpha'],
	['chi', 'Degrees of freedom'],
	['stu', 'Degrees of freedom']
]);

const parameter2 = new Map([
	['und', 'End'],
	['bin', 'Trials'],
	['unc', 'End'],
	['nor', 'Std. Dev.'],
	['gam', 'Rate parameter'],
	['erl', 'Rate parameter'],
	['bet', 'Beta']
]);

const default_p1 = new Map([
	['und', 0],
	['geo', 0.5],
	['bin', 0.5],
	['poi', 2],
	['unc', 0],
	['exp', 0.5],
	['nor', 0],
	['gam', 2],
	['erl', 2],
	['bet', 2],
	['chi', 2],
	['stu', 1]
]);

const default_p2 = new Map([
	['und', 4],
	['bin', 6],
	['unc', 4],
	['nor', 1],
	['gam', 1],
	['erl', 0.5],
	['bet', 3]
]);

const Limits = new Map([
	['und', function (l=0, r=4){
		return [l, r];
	}],
	
	['geo', function (p=0.5, p2=0){
		let end = Math.round(MINP_LOG/Math.log(p));
		return [0, end];
	}],

	['bin', function (p=0.5, n=6){
		return [0, n];
	}],
	
	['poi', function (l=2, p2=0){
		return [0, Infinity];
	}],
	
	['unc', function (l=0, r=4){
		return [l, r];
	}],
	
	['exp', function (l=0.5, p2=0){
		let end = -MINP_LOG/l;
		return [0, end];
	}],

	['nor', function (u=0, s=1){
		return [jStat.normal.inv(MINP, u, s), jStat.normal.inv(MAXP, u, s)];
	}],

	['gam', function (a=2, b=1){
		return [0, jStat.gamma.inv(MAXP, a, 1/b)];
	}],

	['erl', function (k=2, l=0.5){
		return [0, jStat.gamma.inv(MAXP, k, 1/l)];
	}],

	['bet', function (a=2, b=3){
		let start = jStat.beta.inv(MINP, a, b);
		let end = jStat.beta.inv(MAXP, a, b);
		if(a >= 1) {start = 0};
		if(b >= 1) {end = 1};
		return [start, end];
	}],

	['chi', function (k=2, p2=0){
		let start = jStat.chisquare.inv(MINP, k);
		if(k >= 2) {start = 0};
		return [start, jStat.chisquare.inv(MAXP, k)];
	}],

	['stu', function (v=1, p2=0){
		return [Math.max(-10, jStat.studentt.inv(MINP, v)), Math.min(10, jStat.studentt.inv(MAXP, v))];
	}]
]);

const Mean = new Map([
	['und', function uniformd_mean(l=0, r=4){
		return (l + r)/2;
	}],
	
	['geo', function geometric_mean(p=0.5, p2=0){
		return (p / (1 - p));
	}],

	['bin', function binomial_mean(p=0.5, n=6){
		return (n * p);
	}],
	
	['poi', function poisson_mean(l=2, p2=0){
		return l;
	}],
	
	['unc', function uniformc_mean(l=0, r=4){
		return (r + l)/2;
	}],
	
	['exp', function exponential_mean(l=0.5, p2=0){
		return 1/l;
	}],

	['nor', function normal_mean(u=0, s=1){
		return u;
	}],

	['gam', function gamma_mean(a=2, b=1){
		return jStat.gamma.mean(a, 1/b);
	}],

	['erl', function erlang_mean(k=2, l=0.5){
		return Mean.get('gam')(l);
	}],

	['bet', function beta_mean(a=2, b=1){
		return jStat.beta.mean(a, b);
	}],

	['chi', function chi_squared_mean(k=2, p2=0){
		return Mean.get('gam')(k/2, 0.5);
	}],

	['stu', function students_t_mean(v=1, p2=0){
		return (v > 1? 0: "Undefined");
	}]
]);

const Variance = new Map([
	['und', function uniformd_variance(l=0, r=4){
		return ((r - l)*(r - l + 2))/12;
	}],
	
	['geo', function geometric_variance(p=0.5, p2=0){
		return (p / ((1 - p)*(1 - p)));
	}],

	['bin', function binomial_variance(p=0.5, n=6){
		return (n * p * (1 - p));
	}],
	
	['poi', function poisson_variance(l=2, p2=0){
		return l;
	}],
	
	['unc', function uniformc_variance(l=0, r=4){
		return ((r - l)*(r - l))/12;
	}],
	
	['exp', function exponential_variance(l=0.5, p2=0){
		return 1/(l*l);
	}],

	['nor', function normal_variance(u=0, s=1){
		return s*s;
	}],

	['gam', function gamma_variance(a=2, b=1){
		return jStat.gamma.variance(a, 1/b);
	}],

	['erl', function erlang_variance(k=2, l=0.5){
		return Variance.get('gam')(l);
	}],

	['bet', function beta_variance(a=2, b=1){
		return jStat.beta.variance(a, b);
	}],

	['chi', function chi_squared_variance(k=2, p2=0){
		return Variance.get('gam')(k/2, 0.5);
	}],

	['stu', function students_t_variance(v=1, p2=0){
		return (v > 2? (v/(v - 2)): "Undefined");
	}]
]);

const Dist = new Map([
	['und', function uniformd_dist(k, l=0, r=4){
		return 1/(r - l + 1);
	}],
	
	['geo', function geometric_dist(k, p=0.5, p2=0){
		return ((1-p) * Math.pow(p, k));
	}],

	['bin', function binomial_dist(k, p=0.5, n=6){
		return math.combinations(n, k) * Math.pow(p, k) * Math.pow(1-p, n-k);
	}],
	
	['poi', function poisson_dist(k, l=2, p2=0){
		return Math.pow(l, k) * Math.exp(-l) / math.factorial(k);
	}],
	
	['unc', function uniformc_dist(x, l=0, r=4){
		return 1/(r - l);
	}],
	
	['exp', function exponential_dist(x, l=0.5, p2=0){
		if(x < 0) {return 0}
		return l*Math.exp(-l*x);
	}],

	['nor', function normal_dist(x, u=0, s=1){
		return jStat.normal.pdf(x, u, s);
	}],

	['gam', function gamma_dist(x, a=2, b=1){
		if(x < 0) {return 0}
		return jStat.gamma.pdf(x, a, 1/b);
	}],

	['erl', function erlang_dist(x, k=2, l=0.5){
		return Dist.get('gam')(x, k, l);
	}],

	['bet', function beta_dist(x, a=2, b=1){
		return jStat.beta.pdf(x, a, b);
	}],

	['chi', function chi_squared_dist(x, k=2, p2=0){
		return Dist.get('gam')(x, k/2, 0.5);
	}],

	['stu', function students_t_dist(x, v=1, p2=0){
		return jStat.studentt.pdf(x, v);
	}]
]);

const Rand = new Map([
	['und', function uniformd_rand(l=0, r=4){
		return l + Math.floor((r - l + 1)*Math.random());
	}],
	
	['geo', function geometric_rand(p=0.5, p2=0){
		let x = 0;
		while(Math.random() < p) { x++; }
		return x;
	}],
	
	['bin', function binomial_rand(p=0.5, n=6){
		let x = 0;
		for(let j = 0; j < n; j++){
			x += (Math.random() < p? 1: 0);
		}
		return x;
	}],
	
	['poi', function poisson_rand(l=2, p2=0){
		return jStat.poisson.sample(l);
	}],
	
	['unc', function uniformc_rand(l=0, r=4){
		return l + (r-l)*Math.random();
	}],
	
	['exp', function exponential_rand(l=0.5, p2=0){
		return Math.log(1 - Math.random())/(-1 * l);
	}],

	['nor', function normal_rand(u=0, s=1){
		return jStat.normal.sample(u, s);
	}],

	['gam', function gamma_rand(a=2, b=1){
		return jStat.gamma.sample(a, 1/b);
	}],

	['erl', function erlang_rand(a=2, b=1){
		return jStat.gamma.sample(a, 1/b);
	}],

	['bet', function beta_rand(a=2, b=1){
		return jStat.beta.sample(a, b);
	}],

	['chi', function chi_squared_dist(k=2, p2=0){
		return jStat.chisquare.sample(k);
	}],
	
	['stu', function students_t_rand(v=1){
		return jStat.studentt.sample(v);
	}]
]);

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

function normal(p1, p2, dist='und', cnt=100, dis=true){
	let x = [];
	for(let i = 0; i < TRIALS; i++){
		x.push(0);
		for(let j = 0; j < cnt; j++){
			x[i] += Rand.get(dist)(p1, p2);
		}
		x[i] /= cnt;
	}

	return {
		name: "Experimental",
		x: x,
		type: 'histogram',
		histnorm: 'probability' + (dis? '' : ' density')
	}
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

function create(){
	console.log("Sucessful submission");
	const choice = select.options[select.selectedIndex].value;
	const discrete = disc.includes(choice);

	const layout = {
		xaxis: {title: "x"},
		yaxis: {
			title: "Probability " + (discrete? "Mass": "Density")
		}
	};

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

function change(){
	let choice = select.options[select.selectedIndex].value;

	let p1l = document.getElementById('p1l');
	let p1 = document.getElementById('p1');
	
	let p2l = document.getElementById('p2l');
	let p2 = document.getElementById('p2');

	p1l.hidden = false;
	p1.hidden = false;

	p1l.innerHTML = parameter1.get(choice) + ": ";
	p1.value = default_p1.get(choice);

	if(parameter2.has(choice)){
		p2l.hidden = false;
		p2.hidden = false;

		p2l.innerHTML = parameter2.get(choice) + ": ";
		p2.value = default_p2.get(choice);
	}
	else{
		p2l.hidden = true;
		p2.hidden = true;
	}
}

function validate3(){
	let p3 = document.getElementById('p3').value;

	if(p3 == ''){
		alert("Please enter the required parameters.");
		return;
	}

	if(isNaN(p3) || p3 < 0){
		alert("Please enter only non-negative numbers as parameters.");
		return;
	}

	console.log("Successful validation!");

	p3 = parseInt(p3);

	return p3;
}

function CLT(){
	let choice = select.options[select.selectedIndex].value;

	try{
		const [p1, p2] = validate(choice);
		const p3 = validate3();

		const mean = Mean.get(choice)(p1, p2);
		const sd = Math.sqrt(Variance.get(choice)(p1, p2)/p3)
	
		let graph = [];
	
		graph.push(normal(p1, p2, choice, p3, disc.includes(choice)));
		graph.push(distGraph(mean, sd, 'nor', false));
	
		Plotly.newPlot(canvas, graph);
		outputMean(choice, p1, p2);
	}catch(e){
		alert(e);
	}
}

function outputMean(choice, p1=0, p2=0){
	let val = Mean.get(choice)(p1, p2);
	let txt = "Mean = " + val.toString();
	document.getElementById('mean').innerHTML = txt;
}