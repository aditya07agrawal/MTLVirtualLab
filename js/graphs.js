//GLOBAL VARIABLES
var select = document.forms['info']['distribution'];
var canvas = document.getElementById('graph');

var minp = 0.00001;		//Minimum probability shown
var step = 0.001;		//Step of continous graphs
var trials = 10000;		//Number of rands

const param2 = ['bin', 'und', 'unc', 'gam', 'bet', 'nor', 'erl'];				//Graphs which require 2 parameters
const disc = ['und', 'geo', 'bin', 'poi'];										//Graphs which are discrete
const cont = ['unc', 'exp', 'gam', 'bet', 'chi', 'nor', 'erl', 'stu'];			//Graphs which are continuous

//Helper
function beta(a, b){
	return (math.gamma(a) * math.gamma(b)) / math.gamma(a+b);
}

//func
var Dist = new Map([
	['bin', function binomial_dist(k, p=0.5, n=6){
		if(k < 0 || k > n) {return 0}
		return math.combinations(n, k) * Math.pow(p, k) * Math.pow(1-p, n-k);
	}],
	
	['geo', function geometric_dist(k, p=0.5, p2=0){
		if(k < 0) {return 0}
		return ((1-p) * Math.pow(p, k));
	}],
	
	['und', function uniformd_dist(k, l=0, r=4){
		if(k < l || k > r) {return 0}
		return 1/(r - l + 1);
	}],
	
	['poi', function poisson_dist(k, l=2, p2=0){
		if(k < 0) {return 0}
		return Math.pow(l, k) * Math.exp(-l) / math.factorial(k);
	}],
	
	['unc', function uniformc_dist(x, l=0, r=4){
		if(x < l || x >= r) {return 0}
		return 1/(r - l);
	}],
	
	['exp', function exponential_dist(x, l=0.5, p2=0){
		if(x < 0) {return 0}
		return l*Math.exp(-l*x);
	}],

	['erl', function erlang_dist(x, k=2, l=0.5){
		return Dist.get('gam')(x, k, l);
	}],

	['gam', function gamma_dist(x, a=2, b=1){
		if(x < 0) {return 0}
		return Math.pow(x, a-1) * Math.exp(-b*x) * Math.pow(b, a) / math.gamma(a);
	}],

	['bet', function beta_dist(x, a=2, b=1){
		if(x < 0 || x > 1) {return 0}
		return Math.pow(x, a-1) * Math.pow(1-x, b-1) * beta(a,b);
	}],

	['chi', function chi_squared_dist(x, k=2, p2=0){
		return Dist.get('gam')(x, k/2, 0.5);
	}],

	['nor', function normal_dist(x, u=0, s=1){
		return Math.exp(-1*Math.pow((x - u)/s, 2)/2) / (Math.sqrt(2*Math.PI)*s);
	}],

	['stu', function students_t_dist(x, v=1){
		return Math.pow(1 + ((x*x)/v), -(v+1)/2) / Math.sqrt(v) / beta(v/2, 0.5);
	}]
]);

var Rand = new Map([
	['bin', function binomial_rand(p=0.5, n=6){
		let x = 0;
		for(let j = 0; j < n; j++){
			x += (Math.random() < p? 1: 0);
		}
		return x;
	}],
	
	['geo', function geometric_rand(p=0.5, p2=0){
		let x = 0;
		while(Math.random() < p){
			x++;
		}
		return x;
	}],
	
	['und', function uniformd_rand(l=0, r=4){
		return l + Math.floor((r - l + 1)*Math.random());
	}],
	
	['unc', function uniformc_rand(l=0, r=4){
		return l + (r-l)*Math.random();
	}],
	
	['exp', function exponential_rand(l=0.5, p2=0){
		return Math.log(1 - Math.random())/(-1 * l);
	}],
	
	['poi', function poisson_rand(l=2, p2=0){
		let x = -1, r = 0;
		while(r < 1){
			r += Rand.get('exp')(l);
			x++;
		}
		return x;
	}],

	['erl', function erlang_rand(a=2, b=1){
		let x = 0;
		while(a--){
			x += Rand.get('exp')(b);
		}
		return x;
	}],

	['nor', function normal_rand(u=0, s=1){
		let u1 = Math.random();
		let u2 = Math.random();

		return u + s*(Math.sqrt(-2*Math.log(u1)) * Math.sin(2*Math.PI*u2));
	}],
	
	['stu', function students_t_rand(v=1){
		let n = v + 1;
		
		let x = [];
		for(let i = 0; i < n; i++){
			x.push(Rand.get('nor')());
		}

		let mean = 0;
		for(let i of x){
			mean += i;
		}
		mean /= n;

		let S = 0;
		for(let i of x){
			S += (i - mean)*(i - mean);
		}
		S /= (n-1);

		return mean * Math.sqrt(n/S);
	}]
]);

//GRAPH FUNCTIONS
function disGraph(p1, p2, dist='und'){
	let x_axis = [], y_axis = [];
	let start = false, end = false;
	
	for(let i = 0; !end ; i++){
		x_axis.push(i);
		y_axis.push(Dist.get(dist)(i, p1, p2));

		if(y_axis.at(-1) > minp) {start = true;}
		if(start && y_axis.at(-1) < minp){
			x_axis.pop();
			y_axis.pop();
			end = true;
		}
	}

	end = false;
	for(let i = 0; !end ; i--){
		x_axis.push(i);
		y_axis.push(Dist.get(dist)(i, p1, p2));

		if(y_axis.at(-1) < minp){
			x_axis.pop();
			y_axis.pop();
			end = true;
		}
	}

	return {
		x: x_axis, y: y_axis,
		mode: 'markers',
		type: 'scatter'
	};
}

function conGraph(p1, p2, dist='unc'){
	let x_axis = [], y_axis = [];
	let start = false, end = false;
	
	for(let i = 0; !end ; i += step){
		x_axis.push(i);
		y_axis.push(Dist.get(dist)(i, p1, p2));

		if(y_axis.at(-1) > minp) {start = true}
		if(start && y_axis.at(-1) < minp){
			x_axis.pop();
			y_axis.pop();
			end = true;
		}

		if(dist == 'bet' && i + step >= 1) {end = true}
	}

	let temp_x = [], temp_y = [];
	end = false;
	for(let i = -step; !end ; i -= step){
		temp_x.push(i);
		temp_y.push(Dist.get(dist)(i, p1, p2));

		if(start && temp_y.at(-1) < minp){
			temp_x.pop();
			temp_y.pop();
			end = true;
		}

		if(dist == 'bet' && i + step >= 1) {end = true}
	}

	x_axis = temp_x.reverse().concat(x_axis);
	y_axis = temp_y.reverse().concat(y_axis);

	return {
		x: x_axis, y: y_axis,
		mode: 'lines',
		type: 'scatter'
	};
}

function randGraph(p1, p2, dist='und', dis='true'){
	let x = [];
	for(let i = 0; i < trials; i++){
		x.push(Rand.get(dist)(p1, p2));
	}

	return {
		x: x,
		type: 'histogram',
		histnorm: 'probability' + (dis? '' : ' density')
	}
}

function normal(p1, p2, dist='und', cnt=100){
	let x = [];
	for(let i = 0; i < trials; i++){
		x.push(0);
		for(let j = 0; j < cnt; j++){
			x[i] += Rand.get(dist)(p1, p2);
		}
		x[i] /= cnt;
	}

	return {
		x: x,
		type: 'histogram',
		histnorm: 'probability density'
	}
}

//MAIN FUNCTIONS
function validate(choice){
	//Validation of inputed parameters
	let p1 = document.getElementById('p1').value;
	let p2 = document.getElementById('p2').value;

	if(p1 == '' || (param2.includes(choice) && p2 == '')){
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
	let choice = select.options[select.selectedIndex].value;

	try{
		const [p1, p2] = validate(choice);

		//Graphing
		let theo = document.getElementById('theo').checked;
		let rand = document.getElementById('rand').checked;
	
		let graph = [];
	
		if(theo){
			if(disc.includes(choice)){
				graph.push(disGraph(p1, p2, choice));
			}
	
			if(cont.includes(choice)){
				graph.push(conGraph(p1, p2, choice));
			}
		}
	
		if(rand){
			graph.push(randGraph(p1, p2, choice, disc.includes(choice)));
		}
	
		Plotly.newPlot(canvas, graph);
	} catch(e){
		alert(e);
	}
}

function change(){
	let choice = select.options[select.selectedIndex].value;

	let p1l = document.getElementById('p1l');
	let p2l = document.getElementById('p2l');
	let p1 = document.getElementById('p1');
	let p2 = document.getElementById('p2');

	p1l.hidden = false;
	p1.hidden = false;

	switch(choice){
		case 'geo':
		case 'bin':
			p1l.innerHTML = "Success probability: ";
			break;
		case 'exp':
			p1l.innerHTML = "Rate parameter: ";
			break;
		case 'poi':
			p1l.innerHTML = "Average occurences: ";
			break;
		case 'und':
		case 'unc':
			p1l.innerHTML = "Start: ";
			break;
		case 'erl':
		case 'gam':
			p1l.innerHTML = "Shape parameter: ";
			break;
		case 'bet':
			p1l.innerHTML = "Alpha: ";
			break;
		case 'stu':
		case 'chi':
			p1l.innerHTML = "Degrees of freedom: ";
			break;
		case 'nor':
			p1l.innerHTML = "Mean: ";
			break;
	}

	if(param2.includes(choice)){
		p2l.hidden = false;
		p2.hidden = false;
		
		if(choice == 'bin'){
			p2l.innerHTML = "Number of trials: ";
		}
		else if(choice == 'und' || choice == 'unc'){
			p2l.innerHTML = "End: ";
		}
		else if(choice == 'gam' || choice == 'erl'){
			p2l.innerHTML = "Rate parameter: ";
		}
		else if(choice == 'bet'){
			p2l.innerHTML = "Beta: ";
		}
		else if(choice == 'nor'){
			p2l.innerHTML = "Standard Dev.: ";
		}
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
	
		let graph = [];
	
		graph.push(normal(p1, p2, choice, p3));
	
		Plotly.newPlot(canvas, graph);
	}catch(e){
		alert(e);
	}
}