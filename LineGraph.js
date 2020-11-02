var Conf_Deaths = {}, Modi_Data={}, County_D = {}, County_Info, data_id ={}, County_Data, Combined_Data=[], date_c, d, dd, m, y, graph_date, dataset, range1, range2, rangeV1, rangeV2,
    Comb_databyid ={}, D_graph_date, Get_Date, Date_Cond1, Date_Cond2, line_fun, Y_hat, Y_Lower, Y_Upper, slider_val1, slider_val2, Flag=0, P_Flag=0, Temp_Date, Teamp_Rate, str,
    // val="Predictions of COVID-19 Mortality",
    formatTime = d3.timeFormat("%B %d"), name, s1; 

let heightScale, data, values = [], xAxisScale, yAxisScale, width = 900, height = 400, padding = 40;

var D_margin = {top: 10, right: 30, bottom: 30, left: 50},
    D_width = 900 - D_margin.left - D_margin.right,
    D_height = 400 - D_margin.top - D_margin.bottom;

var svgDynamic = d3.select('#D_Graph').append('svg')
    .attr('width', D_width + D_margin.left + D_margin.right)
    .attr('height', D_height + D_margin.top + D_margin.bottom)

var svgg_Dynamic = svgDynamic.append('g')
    .attr('class', 'g_Dynamic')
    .attr('transform', 'translate(' + D_margin.left + ',' + (D_margin.top)+ ')');

dropdown();

function Load_Graph(str)
{
    // 1009, 1073, 1115, 1117, 1131, 11001, 12001, 12011, 12021, 12086, 42101, 54049
  Promise.all([d3.csv('forecast_'+str+'_modified.csv'),d3.csv('Data_A_SDOH_Cluster.csv')])
  .then(([test_Data, C_Data])=> {
    test_Data.forEach(d => {Conf_Deaths[Math.floor(d['fips'])] = d;})
    C_Data.forEach(d => {Modi_Data[Math.floor(d['GEO_ID'])] = d;})
    County_Info=C_Data;
    dataset=test_Data;
    
   for(i=0; County_Info.length; i++)
   {
       if(County_Info[i].GEO_ID==str)
       {
           name= County_Info[i].name;
           document.getElementById("County_name").innerHTML = name;
           break;
       }
   }
//    Auto_Complete();
   Line_Graph()
  })
}

function dropdown(s1)
{
    s1 = document.getElementById(s1);
    var selectedConti = s1.options[s1.selectedIndex].value;
    if(selectedConti==1009)
    {str=1009;}
	else if(selectedConti==1073)
    {str=1073;}
    else if(selectedConti==1115)
    {str=1115;}
    else if(selectedConti==1117)
    {str=1117;}
    else if(selectedConti==1131)
    {str=1131;}
    else if(selectedConti==11001)
    {str=11001;}
    else if(selectedConti==12001)
    {str=12001;}
    else if(selectedConti==12011)
    {str=12011;}
    else if(selectedConti==12021)
    {str=12021;}
    else if(selectedConti==12086)
    {str=12086;}
    else if(selectedConti==42101)
    {str=42101;}
    else if(selectedConti==54049)
    {str=54049;}

    Load_Graph(str)
}  

function Load_Dynamic_Graph()
{
    Combined_Data=[], Comb_databyid ={};

    for(let i=0; i<dataset.length; i++)
    {
    if(dataset[i].date > Date_Cond1)
    { 
      if(dataset[i].yhat00 == "" || dataset[i].yhat00== 0)
        {}
      else
        {
        if(dataset[i].yhat00 === '')
            {
                data_id ={id: Math.floor(dataset[i].fips), Date: dataset[i].date, Y_hat : '0', Y_Lower : '0', Y_Upper : '0'}
            }
        else
            {
        if(dataset[i].date>=Date_Cond2)
            {   
                if(Flag==0)
                {
                    Comb_databyid={id: Math.floor(dataset[i].fips), Date: dataset[i].date, Y_hat : dataset[i].yhat00, Y_Lower : dataset[i].yhat_lower00, Y_Upper : dataset[i].yhat_upper00}
                    
                    Temp_Date=dataset[i].date;
                }
                else if(Flag==1)
                {
                    Comb_databyid={id: Math.floor(dataset[i].fips), Date: dataset[i].date, Y_hat : dataset[i][Y_hat], Y_Lower : dataset[i][Y_Lower], Y_Upper : dataset[i][Y_Upper]}   
                    
                }
            }
        else
            {
                Comb_databyid ={id: Math.floor(dataset[i].fips), Date : dataset[i].date, Y_hat : dataset[i].yhat00, Y_Lower : dataset[i].yhat_lower00, Y_Upper : dataset[i].yhat_upper00}
                Teamp_Rate=dataset[i].yhat_upper00;
            }
            }
        Combined_Data.push(Comb_databyid);
        }
    }}
}

function Date_Check(D_Check)
{
date_c = new Date(D_Check);
d = new Date(date_c.setDate(date_c.getDate()));
dd = new Date(d.setDate(date_c.getDate()));
d = dd.getDate();
m = ("0" + (dd.getMonth() + 1)).slice(-2)
y = dd.getFullYear();
return graph_date = y+"-" + m +"-"+d
}

d3.select("#slider1").on("input", Render);
d3.select("#slider2").on("input", Render);

function Render()
{
    Flag=1;
    Line_Graph();
}



function Line_Graph()
{
svgg_Dynamic.selectAll(".x-axis").remove()
svgg_Dynamic.selectAll(".y-axis").remove()
svgg_Dynamic.selectAll(".D_title").remove()
svgg_Dynamic.selectAll(".line_D").remove()

Get_Date = "Jul 01,2020"
Date_Cond1 = Date_Check(Get_Date)
Get_Date = "Oct 11,2020"
Date_Cond2 =  Date_Check(Get_Date)

Y_hat="",Y_Lower='',Y_Upper='';
range1 = document.getElementById('slider1');
rangeV1 = document.getElementById('rangeV1');
slider_val1 = parseInt(d3.select("#slider1").property("value"));

range2 = document.getElementById('slider2');
rangeV2 = document.getElementById('rangeV2');
slider_val2 = parseInt(d3.select("#slider2").property("value"));

Y_hat = "yhat" +slider_val1+slider_val2;
Y_Lower= "yhat_lower" +slider_val1+slider_val2;
Y_Upper= "yhat_upper" + slider_val1+slider_val2;

Load_Dynamic_Graph()

// svgg_Dynamic.append('text').attr('class', 'Cont_name').attr('x', 600).attr('y', 310).text("County: "+name).style("font-size","1em");
// svgg_Dynamic.append('text').attr('class', 'Cont_name').attr('x', 600).attr('y', 330).text("Date: "+Date_Cond2).style("font-size","1em");
// svgg_Dynamic.append('text').attr('class', 'Cont_name').attr('x', 600).attr('y', 350).text("Mortality Rate per 100K: " +(Teamp_Rate).slice(0, -12)).style("font-size","1em");

xAxisScale = d3.scaleTime().range([0, D_width]).domain(d3.extent(Combined_Data, function(d) {dt = new Date(d.Date);return dt;})); 
yAxisScale = d3.scaleLinear().domain([0,d3.max(Combined_Data, function(d){ return parseFloat(d.Y_hat)})]).nice().range([D_height, 0])

svgg_Dynamic.append("g").attr("transform", "translate(0," + D_height + ")").attr("class", "x-axis").call(d3.axisBottom(xAxisScale));
svgg_Dynamic.append("g").attr("class","y-axis").call(d3.axisLeft(yAxisScale));

line_fun = d3.line()
    .x(function(d){dt = new Date(d.Date); return xAxisScale(dt);})
    .y(function(d){return yAxisScale(parseFloat(d.Y_hat))}).curve(d3.curveBasis)

svgg_Dynamic.append("path").data(Combined_Data).attr("class", "line_D")
    .style("stroke", "orange")
    .attr("d", line_fun(Combined_Data));

// formatTime(Date_Cond2)
// Teamp_Rate
svgg_Dynamic.append("svg:line")
  .data(Combined_Data)
  .attr("x1", 438)
  .attr("y1", 0)
  .attr("x2", 438)
  .attr("y2", 365)
  .attr("class", "refline")

svgg_Dynamic.selectAll(".lbl_name").remove()
svgg_Dynamic.append("text").attr("x", 480).attr("y", 10).style("text-anchor", "middle").attr("fill","Brown").text("Predicted").style("font-size","1em").attr("class","lbl_name");
svgg_Dynamic.append("text").attr("x", 410).attr("y", 10).style("text-anchor", "middle").attr("fill","Green").text("Past").style("font-size","1em").attr("class","lbl_name");

var mouseG = svgg_Dynamic.append("g").attr("class", "mouse-over-effects").attr('transform', 'translate(0,0)');

// this is the black vertical line to follow mouse
mouseG.append("path") .attr("class", "mouse-line").style("stroke", "Black").style("stroke-width", "2px").style("opacity", "0");

var lines = document.getElementsByClassName('line_D');

var mousePerLine = mouseG.selectAll('.mouse-per-line').data(Combined_Data).enter().append("g").attr("class", "mouse-per-line");

mousePerLine.append("circle")
      .attr("r", 7)
      .style("stroke", "red")
      .style("fill", "none")
      .style("stroke-width", "1px")
      .style("opacity", "0");

mousePerLine.append("text").attr("transform", "translate(10,3)");

// Previous Code
// .attr("transform", "translate(" + D_margin.left + "," + D_margin.top + ")");
// append a rect to catch mouse movements on SVG
// can't catch mouse events on a g element
mouseG.append('svg:rect') .attr('width', D_width) .attr('height', D_height).attr('fill', 'none').attr('pointer-events', 'all')
.on('mouseout', function() 
{ // on mouse out hide line, circles and text
d3.select(".mouse-line").style("opacity", "0");
d3.selectAll(".mouse-per-line circle").style("opacity", "0");
d3.selectAll(".mouse-per-line text").style("opacity", "0");
})
.on('mouseover', function() 
{ // on mouse in show line and text
d3.select(".mouse-line").style("opacity", "1");
d3.selectAll(".mouse-per-line circle").style("opacity", "1");
d3.selectAll(".mouse-per-line text").style("opacity", "1");
})
.on('mousemove', function() 
{ // mouse moving over SVG
var mouse = d3.mouse(this);
d3.select(".mouse-line")
.attr("d", function() 
{
var d = "M" + mouse[0] + "," + D_height;
d += " " + mouse[0] + "," + 0;
return d;
});
d3.selectAll(".mouse-per-line").data(Combined_Data)
  .attr("transform", function(d, i)
    {
    var xDate = xAxisScale.invert(mouse[0]),
    bisect = d3.bisector(function(d) { return d.date; }).right;
    idx = bisect(d, xDate);
    var beginning = 0,
    end = lines[i].getTotalLength(),
    target = null;
    while (true){
    target = Math.floor((beginning + end) / 2);
    pos = lines[i].getPointAtLength(target);
    if ((target === end || target === beginning) && pos.x !== mouse[0]) 
    {
        break;
    }
    if (pos.x > mouse[0])      end = target;
    else if (pos.x < mouse[0]) beginning = target;
    else break; //position found
    }
    // .toFixed(2)
d3.select(this).select('text')
    // .text("Incidents :"+(yAxisScale.invert(pos.y)).toFixed(2)+"," + formatTime(xAxisScale.invert(pos.x)))
    .style("fill","brown").style("font-size","1em");
    svgg_Dynamic.selectAll(".Cont").remove()
    svgg_Dynamic.selectAll(".Cont_Date").remove()
    svgg_Dynamic.selectAll(".Cont_name").remove()
    
    svgg_Dynamic.append("text").attr("x", 590).attr("y",320).style("text-anchor", "middle").attr("fill","black").text("Date: "+ formatTime(xAxisScale.invert(pos.x))).style("fill","black").style("font-size","1em").attr("class","Cont_Date");
    svgg_Dynamic.append("text").attr("x", 630).attr("y",340).style("text-anchor", "middle").attr("fill","black").text("Mortality Rate per 100K: "+(yAxisScale.invert(pos.y)).toFixed(2)).style("fill","black").style("font-size","1em").attr("class","Cont");
    
    return "translate(" + (mouse[0]) + "," + (pos.y) +")"; 
    // For Static position
    //return "translate(-20,340)"; 
    
    });

});

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
var result = "Please "
window.alert(result);
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
    { str=arr[i].GEO_ID;
        Load_Graph()
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
