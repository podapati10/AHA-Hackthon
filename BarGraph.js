var R_Data, Conf_Deaths = {}, Modi_Data={}, County_D = {}, County_Info, data_id ={}, P_data_id, databyid= [], P_databyid= [], County_Data, Combined_Data=[], 
    date_c, d, dd, m, y, graph_date, S_graph_date, check_date, dataset, Comb_databyid ={}, D_graph_date,
    P_data, P_Value, Y_hat, Y_Lower, Y_Upper, Start_Val1, Start_Val2, P_Flag=0, Sample_Data;

let heightScale, data, values = [], xAxisScale, xScale, xAxisScale1, xScale1, yAxisScale, width = 900, height = 400, padding = 40;



let svg = d3.select('#canvas').append('svg')




let drawCanvas = () => {
    svg.attr('width', width)
    svg.attr('height', height)

}

let generateScales = (data) => {

xScale = d3.scaleLinear().domain([0, databyid.length]).range([padding, width -540])
xAxisScale = d3.scaleTime().range([padding, width -540]).domain(d3.extent(databyid, function(d) {dt = new Date(d.date);return dt;})); 
heightScale = d3.scaleLinear().domain([0,d3.max(data, function(d){ return parseFloat(d.Deaths)})]).nice().range([0, height - (2*padding)]);
yAxisScale = d3.scaleLinear().domain([0,d3.max(data, function(d){ return parseFloat(d.Deaths)})]).nice().range([height - padding, padding ])
}

let generateScales1 = (data) => {
    xScale1 = d3.scaleLinear().domain([0, P_databyid.length]).range([(width - padding)-500, width- padding])
    xAxisScale1 = d3.scaleTime().range([(width - padding)-500, width- padding]).domain(d3.extent(P_databyid, function(d) {dt = new Date(d.Date);return dt;})); 
    heightScale = d3.scaleLinear().domain([0,d3.max(data, function(d){ return parseFloat(d.Y_Upper)})]).nice().range([0, height - (2*padding)]);
     
}

let generateAxes = () => {
    let xAxis = d3.axisBottom(xAxisScale)
    let yAxis = d3.axisLeft(yAxisScale).ticks(3)
    svg.append('g').call(xAxis).attr('id', 'x-axis').attr('transform', 'translate(0, ' + (height-padding) + ')')
    svg.append('g').call(yAxis).attr('id', 'y-axis').attr('transform', 'translate(' + padding + ', 0)')
    }
    
let generateAxes1 = () => {
    let xAxis = d3.axisBottom(xAxisScale)
    let xAxis1 = d3.axisBottom(xAxisScale1).ticks(8)
    let yAxis = d3.axisLeft(yAxisScale)
    svg.append('g').call(xAxis).attr('id', 'x-axis').attr('transform', 'translate(0, ' + (height-padding) + ')')
    svg.append('g').call(xAxis1).attr('id', 'x-axis').attr('transform', 'translate(0, ' + (height-padding) + ')')
    svg.append('g').call(yAxis).attr('id', 'y-axis').attr('transform', 'translate(' + padding + ', 0)')
    }

let drawBars =(data) => {
svg.selectAll('rect').data(databyid).enter().append('rect').attr('class', 'bar')
    .attr('width', 250 / databyid.length).attr('data-date', function(d){
    dt = new Date(d.date);
    return dt;})
    .attr('data-date', function(d){return parseFloat(d.Deaths)})
    .attr('height', function(d) {return heightScale(parseFloat(d.Deaths))})
    .attr('x', function(d, i){return xScale(i)})
    .attr('y', function(d){return (height - padding) - heightScale(parseFloat(d.Deaths));})
    .attr('cursor', 'pointer')
    .on('mouseover', function(d)
    {
        d3.select(this).classed("selected", true)
        countyInfo = d3.select("#canvas").append("div").attr("class", "bar_content"); 
        d3.select(this).style("stroke-width", 1).transition().duration(500);
        countyInfo.style("opacity", 4)
        .style("left", (d3.event.pageX - 280) + "px")
        .style("top", (d3.event.pageY - 200) + "px");
        countyInfo.html("Rate : "+parseFloat((d.Deaths).slice(0, -12))+"<br/>"+"Date : "+d.date)
    })
    .on('mouseout', function(d)
    {
        d3.select(this).classed("selected", false).style("stroke-width", '0.2px').transition().duration(100)
        countyInfo.remove();
    })   
    if(P_Flag==1)
    {
        svg.selectAll("#y-axis").remove()
    }
   
}

    let drawBars1 =(data) => {
    svg.selectAll('bar1').data(data).enter().append('rect').attr('class', 'bar1').attr('width', 250 / data.length)
    .attr('data-date', function(d){dt = new Date(d.Date);return dt;})
    .attr('data-date', function(da){ return parseFloat(d.Y_Upper)})
    .attr('height', function(d) { return heightScale(parseFloat(d.Y_Upper))})
    .attr('x', function(d, i){return xScale1(i)})
    .attr('y', function(d){return (height - padding) - heightScale(parseFloat(d.Y_Upper));})
    .attr('cursor', 'pointer')
    .on('mouseover', function(d)
    {
    d3.select(this).classed("selected", true)
    countyInfo = d3.select("#canvas").append("div").attr("class", "bar_content"); 
    d3.select(this).style("stroke-width", 1).transition().duration(500);
    countyInfo.style("opacity", 4)
    .style("left", (d3.event.pageX - 280) + "px")
    .style("top", (d3.event.pageY - 200) + "px");
    countyInfo.html("Rate : "+parseFloat((d.Y_Upper).slice(0, -12))+"<br/>"+"Date : "+d.Date)
    })
    .on('mouseout', function(d)
    {
    d3.select(this).classed("selected", false).style("stroke-width", '0.2px').transition().duration(100)
    countyInfo.remove();})      
    }

Promise.all([d3.csv('Data/forecast_1001_modified(1).csv'),d3.csv('Data/Data_A_SDOH_Cluster.csv')])
.then(([test_Data, C_Data])=> {
test_Data.forEach(d => {Conf_Deaths[Math.floor(d['fips'])] = d;})
C_Data.forEach(d => {Modi_Data[Math.floor(d['GEO_ID'])] = d;})
County_Info=C_Data;
dataset=test_Data;
Clean_Data()
console.log(County_Info)
}) 

function Clean_Data()
{

var County_ID = 1001;
data_id ={}, databyid= [];
let count=0;

svg.selectAll("#x-axis").remove()
svg.selectAll("#y-axis").remove()
svg.selectAll(".bar").remove()

date_c = new Date("Oct 11,2020");
d = new Date(date_c.setDate(date_c.getDate()));
dd = new Date(d.setDate(date_c.getDate()));
d = dd.getDate();
m = dd.getMonth()+1;
y = dd.getFullYear();
graph_date = m+"/" + (d-1) +"/"+(y-100)
S_graph_date = y+"-" + m +"-"+d

date_c = new Date("sept 15,2020");
d = new Date(date_c.setDate(date_c.getDate()));
dd = new Date(d.setDate(date_c.getDate()));
d = dd.getDate();
m = ("0" + (dd.getMonth() + 1)).slice(-2)
y = dd.getFullYear();
graph_date = y+"-" + m +"-"+d


for(let i=0; i<dataset.length; i++)
{
if(Math.floor(dataset[i].fips)== County_ID)
{ 

if(dataset[i].date > graph_date)
{ 
    
  if(S_graph_date===dataset[i].date)
  {break;}
  if(dataset[i].yhat00 == "" || dataset[i].yhat00== 0)
  {}
  else
  {
  if(dataset[i].yhat00 === '')
  {data_id ={id: Math.floor(dataset[i].fips), Deaths : '0', date : dataset[i].date}}
  else
  {data_id ={id: Math.floor(dataset[i].fips), Deaths : dataset[i].yhat00, date : dataset[i].date}}
  databyid.push(data_id);
  count=count+1;
  }
}
}
}
drawCanvas(databyid)
if(P_Flag==0)
{
    generateScales(databyid)
    generateAxes()
    svg.append("rect").attr("x", 400).attr("y", 390).attr("width", 30).attr("height", 10).attr("fill","#2B7A78");
    svg.append("rect").attr("x", 520).attr("y", 390).attr("width", 30).attr("height", 10).attr("fill","orange");
    svg.append("text").attr("x", 450).attr("y",400).style("text-anchor", "middle").attr("fill","black").text("Past").attr("font-size","10px").attr("class","L_past");
    svg.append("text").attr("x", 580).attr("y",400).style("text-anchor", "middle").attr("fill","black").text("Prediction").attr("font-size","10px").attr("class","L_future");

}
drawBars(databyid)

}

function Line_Graph()
{
svg.selectAll(".line_D").remove()
County_ID=1001
date_c = new Date("Oct 11,2020");
d = new Date(date_c.setDate(date_c.getDate()));
dd = new Date(d.setDate(date_c.getDate()));
d = dd.getDate();
m = dd.getMonth()+1;
y = dd.getFullYear();
S_graph_date = y+"-" + m +"-"+d

date_c = new Date("sept 15,2020");
d = new Date(date_c.setDate(date_c.getDate()));
dd = new Date(d.setDate(date_c.getDate()));
d = dd.getDate();
m = ("0" + (dd.getMonth() + 1)).slice(-2)
y = dd.getFullYear();
graph_date = y+"-" + m +"-"+d

console.log(dataset)
for(let i=0; i<dataset.length; i++)
{
if(Math.floor(dataset[i].fips)== County_ID)
{ 

if(dataset[i].date > graph_date)
{ 
    
//   if(S_graph_date===dataset[i].date)
//   {break;}
  if(dataset[i].yhat00 == "" || dataset[i].yhat00== 0)
    {}
  else
    {
    if(dataset[i].yhat00 === '')
        {
            data_id ={id: Math.floor(dataset[i].fips), Deaths : '0', date : dataset[i].date}
        }
    else
        {
    if(dataset[i].date>=D_graph_date)
        {   
            Comb_databyid={id: Math.floor(dataset[i].fips), Date: dataset[i].date, Y_hat : dataset[i][Y_hat], Y_Lower : dataset[i][Y_Lower], Y_Upper : dataset[i][Y_Upper]}
            
        }
    else
        {
            Comb_databyid ={id: Math.floor(dataset[i].fips), Date : dataset[i].date, Y_hat : dataset[i].yhat00, Y_Lower : dataset[i].yhat00, Y_Upper : dataset[i].yhat00}
        }
        }
    Combined_Data.push(Comb_databyid);
    }
}}}
console.log(Combined_Data)

// xScale3 = d3.scaleLinear().domain([0, Combined_Data.length]).range([padding, width- padding])
xAxisScale3 = d3.scaleTime().range([padding, width- padding]).domain(d3.extent(Combined_Data, function(d) {dt = new Date(d.Date);return dt;})); 
var y1 = d3.scaleLinear().domain([0,d3.max(Combined_Data, function(d){ return parseFloat(d.Y_Upper)})]).nice().range([height - padding, padding])
svg.append("g").attr("transform", "translate(0," + (height-padding) + ")").attr("id", "x-axis").call(d3.axisBottom(xAxisScale3));
svg.append("g").attr("id","y-axis").call(d3.axisLeft(y1));
var line_fun = d3.line()
    .x(function(d){dt = new Date(d.Date); return xAxisScale3(dt);})
    .y(function(d){return y1(parseFloat(d.Y_Upper))})
// console.log(databyid)
svg.append("path").data(Combined_Data).attr("class", "line_D")
    .style("stroke", "#008080").attr("fill", "none")
    .style("stroke-width", 3)
    .attr("d", line_fun(Combined_Data));

}

d3.select("#slider1").on("input", Show_Pred);
d3.select("#slider2").on("input", Show_Pred);

function Show_Pred()
{
    svg.selectAll("#x-axis").remove()
    svg.selectAll("#y-axis").remove()
    svg.selectAll(".bar1").remove()
   
    P_Flag=1;
    Y_hat="",Y_Lower='',Y_Upper='';
    var range1 = document.getElementById('slider1');
    var rangeV1 = document.getElementById('rangeV1');
    var slider_val1 = parseInt(d3.select("#slider1").property("value"));

    var range2 = document.getElementById('slider2');
    var rangeV2 = document.getElementById('rangeV2');
    var slider_val2 = parseInt(d3.select("#slider2").property("value"));

 
    Y_hat = "yhat" +slider_val1+slider_val2;
    Y_Lower= "yhat_lower" +slider_val1+slider_val2;
    Y_Upper= "yhat_upper" + slider_val1+slider_val2;
    P_data_id ={}, P_databyid= [];

date_c = new Date("Oct 11,2020");
d = new Date(date_c.setDate(date_c.getDate()));
dd = new Date(d.setDate(date_c.getDate()));
d = dd.getDate();
m = ("0" + (dd.getMonth() + 1)).slice(-2)
y = dd.getFullYear();
D_graph_date = y+"-" + m +"-"+d

for(let i=0; i<dataset.length; i++)
{
    if(D_graph_date<=dataset[i].date)
    {   
        P_data_id={Date: dataset[i].date, Y_hat : dataset[i][Y_hat], Y_Lower : dataset[i][Y_Lower], Y_Upper : dataset[i][Y_Upper]}
        P_databyid.push(P_data_id)
    }
      
}

drawCanvas(P_databyid)
Clean_Data(databyid)
generateScales1(P_databyid)
generateAxes1()
drawBars1(P_databyid)
Line_Graph();
    // svg.selectAll(".line_D").remove()
    // svg.selectAll(".T_Axis_P").remove()
    // svg.selectAll(".D_Svg1").remove()

    // var P_x = d3.scaleTime().range([(width-100), width]).domain(d3.extent(P_databyid, function(d) {
    //     dt = new Date(d.Date);
    //     return dt;})); 

    // svg.append("g").attr("transform", "translate(0," + height + ")").attr("class", "T_Axis_P").call(d3.axisBottom(P_x).ticks(4));

    // var y1 = d3.scaleLinear().domain([0, d3.max(P_databyid, function(d){ return parseFloat(d.Y_Upper)})]).nice().range([height, 0]);
    // var y1 = d3.scaleLinear().domain([0, 2]).nice().range([height, 0]);
    // svg.append("g").attr("class","D_Y").call(d3.axisLeft(y1));

    // var line_fun = d3.line()
    // .x(function(d){dt = new Date(d.Date); return P_x(dt);})
    // .y(function(d){return y1(parseFloat(d.Y_hat))})

    // var line_fun_U = d3.line()
    // .x(function(d){dt = new Date(d.Date); return P_x(dt);})
    // .y(function(d){return y1(parseFloat(d.Y_Upper))})

    // var line_fun_L = d3.line()
    // .x(function(d){dt = new Date(d.Date); return P_x(dt);})
    // .y(function(d){return y1(parseFloat(d.Y_Lower))})

    // svg.append("path").data(P_databyid).attr("class", "line_D")
    // .style("stroke", "orange").attr("fill", "none")
    // .style("stroke-width", 2)
    // .attr("d", line_fun(P_databyid));

    // svg.append("path").data(P_databyid).attr("class", "line_D")
    // .style("stroke", "pink").attr("fill", "none")
    // .style("stroke-width", 1)
    // .attr("d", line_fun_U(P_databyid));

    // svg.append("path").data(P_databyid).attr("class", "line_D")
    // .style("stroke", "pink").attr("fill", "none")
    // .style("stroke-width", 1)
    // .attr("d", line_fun_L(P_databyid));

    // Load_Dynamic(1001)

    setValue1 = ()=>{
        let newValue1 = Number( (range1.value - range1.min) * 100 / (range1.max - range1.min) ), newPosition1 = 15 - (newValue1 * 0.3);
        rangeV1.innerHTML = `<span>${range1.value}</span>`;
        rangeV1.style.left = `calc(${newValue1}% + (${newPosition1}px))`;
            };
        document.addEventListener("DOMContentLoaded", setValue1);
        range1.addEventListener('input', setValue1);

    setValue2 = ()=>{
        let newValue2 = Number( (range2.value - range2.min) * 100 / (range2.max - range2.min) ), newPosition2 = 15 - (newValue2 * 0.3);
        rangeV2.innerHTML = `<span>${range2.value}</span>`;
        rangeV2.style.left = `calc(${newValue2}% + (${newPosition2}px))`;
                };
        document.addEventListener("DOMContentLoaded", setValue2);
        range2.addEventListener('input', setValue2);
}

function Auto_Complete() 
{
var currentFocus;
var inp = document.getElementById("myInput");
var arr = County_Info;

inp.addEventListener("input", function(e) 
{
var a, b, i, val = this.value;
closeAllLists();
if (!val) { return false;}
currentFocus = -1;

a = document.createElement("DIV");
a.setAttribute("id", this.id + "autocomplete-list");
a.setAttribute("class", "autocomplete-items");
this.parentNode.appendChild(a);
for (i = 0; i < arr.length; i++) 
{
    if (arr[i]["name"].substr(0, val.length).toUpperCase() == val.toUpperCase()) 
    {
        b = document.createElement("DIV");
        b.innerHTML = "<strong>" + arr[i]["name"].substr(0, val.length) + "</strong>";
        b.innerHTML += arr[i]["name"].substr(val.length);
        b.innerHTML += "<input type='hidden' value='" + arr[i]["name"] + "'>";
        b.addEventListener("click", function(e) 
        {
        inp.value = this.getElementsByTagName("input")[0].value;
        closeAllLists();
        });
        a.appendChild(b);
    }
}
});
    
inp.addEventListener("keydown", function(e) 
{
var x = document.getElementById(this.id + "autocomplete-list");
if (x) x = x.getElementsByTagName("div");
if (e.keyCode == 40) 
{
    currentFocus++;
    addActive(x);
} 
else if (e.keyCode == 38) 
{ 
    currentFocus--;
    addActive(x);
} 
else if (e.keyCode == 13) 
{
    e.preventDefault();
if (currentFocus > -1) 
{
if (x)  x[currentFocus].click();
}
}
var County_Name = document.getElementById("myInput").value;
for(let i=0; i<arr.length; i++)
{
    if(arr[i].name == County_Name)
    { 
        Load_County_CSV(arr[i].GEO_ID)
    }
}  
}
);

function addActive(x) 
{
    if (!x) return false;
    removeActive(x);
    if (currentFocus >= x.length) currentFocus = 0;
    if (currentFocus < 0) currentFocus = (x.length - 1);
    x[currentFocus].classList.add("autocomplete-active");
}
      
function removeActive(x) 
{
    for (var i = 0; i < x.length; i++) 
    {
        x[i].classList.remove("autocomplete-active");
    }
}

function closeAllLists(elmnt) 
{
var x = document.getElementsByClassName("autocomplete-items");
    for (var i = 0; i < x.length; i++) 
    {
        if (elmnt != x[i] && elmnt != inp) 
        {
            x[i].parentNode.removeChild(x[i]);
        }
    }
}
document.addEventListener("click", function (e) 
{
    closeAllLists(e.target);
});
}