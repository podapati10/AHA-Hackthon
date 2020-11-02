var margin = { top: 10, right: 30, bottom: 30, left: 50 },
    width = 810 - margin.left - margin.right, // previous width 810
    height = 400 - margin.top - margin.bottom;  //previous Height 500
var innerWidth = width - margin.left - margin.right;
var innerHeight = height - margin.top - margin.bottom;

var svgDynamic = d3.select('#Dynamic_map').append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
var svgg_Dynamic = svgDynamic.append('g')
    .attr('class', 'g_Dynamic')
    .attr('transform', 'translate(' + margin.left + ',' + (margin.top)+ ')');

var R_Data, Conf_Deaths = {}, County_D = {}, FlagType, Tagg, data_id ={}, P_data_id, databyid= [], P_databyid= [], County_Data, date_c, d, dd, m, y, graph_date, S_graph_date, check_date, 
    P_data, P_Value, Y_hat, Y_Lower, Y_Upper, Start_Val1, Start_Val2, P_Flag=0, Sample_Data;

Load_Graph();

function Load_Graph()
{
    Promise.all([
    d3.csv('Data/forecast_12086_trad_sdoh_score_D.csv'),
    d3.csv('Data/data_Final_Data_Model_Data.csv'),
    d3.csv('Data/Data_A_SDOH_Cluster.csv'),
    d3.csv('Data/data_Final_Data_Traditional_Sdoh.csv'),
    d3.csv('Data/data_Final_Data_Modified_Sdoh.csv')
    ])
    .then(([Pred_Data, Recent_Data, C_Data, T_data, M_data]) => {
        Recent_Data.forEach(d => {Conf_Deaths[Math.floor(d['fips'])] = d;})
        C_Data.forEach(d => {County_D[Math.floor(d['GEO_ID'])] = d;})
        P_data=Pred_Data;
        R_Data=Recent_Data
        County_Data= C_Data
        console.log(County_Data)
        // console.log(M_data)
        // console.log(County_Data)
        // Load_Dynamic(12086)
        // for(let i=0; i<P_data.length; i++)
        // {
        // Start_Val1 =  parseInt(P_data[i].cases_incidence);
        // Start_Val2 =  parseInt(P_data[i].testing_incidence);
        // break;
        // }
        Load_County_CSV();
    })
}

function Load_County_CSV(str)
{
  // C:\Users\gargy\Desktop\AHAbatch---------------d3.csv('AHAbatch/forecast_'+str+'_trad_sdoh_score_D.csv')
  console.log('Data/forecast_'+str+'_trad_sdoh_score_D.csv')
  Promise.all([d3.csv('Data/forecast_1001_trad_sdoh_score_D (3).csv')])
  .then(([test_Data])=> {
    Sample_Data=test_Data;
    console.log(Sample_Data)
    Load_Dynamic(1001)
    for(let i=0; i<Sample_Data.length; i++)
    {
    Start_Val1 =  parseInt(Sample_Data[i].cases_incidence);
    Start_Val2 =  parseInt(Sample_Data[i].testing_incidence);
    break;
    }
console.log(Start_Val1)
console.log(Start_Val2)
  })
}

d3.select("#slider1").on("input", Show_Pred);
d3.select("#slider2").on("input", Show_Pred);
function Show_Pred()
{
    Y_hat="",Y_Lower='',Y_Upper='';
    var range1 = document.getElementById('slider1');
    var rangeV1 = document.getElementById('rangeV1');
    var slider_val1 = parseInt(d3.select("#slider1").property("value"));

    var range2 = document.getElementById('slider2');
    var rangeV2 = document.getElementById('rangeV2');
    var slider_val2 = parseInt(d3.select("#slider2").property("value"));

    var Comb_Val1 =(slider_val1+=Start_Val1);
    var Comb_Val2 =(slider_val2+=Start_Val2);
    Y_hat = "yhat" +Comb_Val1+Comb_Val2;
    Y_Lower= "yhat_lower" +Comb_Val1+Comb_Val2;
    Y_Upper= "yhat_upper" + Comb_Val1+Comb_Val2;
    P_data_id ={}, P_databyid= [];
    // console.log(Y_hat)
    // console.log(Y_Lower)
    // console.log(Y_Upper)

    for(let i=0; i<Sample_Data.length; i++)
    {
            P_data_id={Date: Sample_Data[i].ds, Y_hat : Sample_Data[i][Y_hat], Y_Lower : Sample_Data[i][Y_Lower], Y_Upper : Sample_Data[i][Y_Upper]}
            P_databyid.push(P_data_id);
    }
console.log(P_databyid)
    svgg_Dynamic.selectAll(".D_Y").remove()
    svgg_Dynamic.selectAll(".D_title").remove()
    svgg_Dynamic.selectAll(".line_D").remove()
    svgg_Dynamic.selectAll(".T_Axis_P").remove()
    svgg_Dynamic.selectAll(".D_Svg1").remove()

    var P_x = d3.scaleTime().range([(width-100), width]).domain(d3.extent(P_databyid, function(d) {
        dt = new Date(d.Date);
        return dt;})); 

    svgg_Dynamic.append("g").attr("transform", "translate(0," + height + ")").attr("class", "T_Axis_P").call(d3.axisBottom(P_x).ticks(4));

    // var y1 = d3.scaleLinear().domain([0, d3.max(P_databyid, function(d){ return parseFloat(d.Y_Upper)})]).nice().range([height, 0]);
    var y1 = d3.scaleLinear().domain([0, 2]).nice().range([height, 0]);
    svgg_Dynamic.append("g").attr("class","D_Y").call(d3.axisLeft(y1));

    var line_fun = d3.line()
    .x(function(d){dt = new Date(d.Date); return P_x(dt);})
    .y(function(d){return y1(parseFloat(d.Y_hat))})

    var line_fun_U = d3.line()
    .x(function(d){dt = new Date(d.Date); return P_x(dt);})
    .y(function(d){return y1(parseFloat(d.Y_Upper))})

    var line_fun_L = d3.line()
    .x(function(d){dt = new Date(d.Date); return P_x(dt);})
    .y(function(d){return y1(parseFloat(d.Y_Lower))})

    svgg_Dynamic.append("path").data(P_databyid).attr("class", "line_D")
    .style("stroke", "orange").attr("fill", "none")
    .style("stroke-width", 2)
    .attr("d", line_fun(P_databyid));

    svgg_Dynamic.append("path").data(P_databyid).attr("class", "line_D")
    .style("stroke", "pink").attr("fill", "none")
    .style("stroke-width", 1)
    .attr("d", line_fun_U(P_databyid));

    svgg_Dynamic.append("path").data(P_databyid).attr("class", "line_D")
    .style("stroke", "pink").attr("fill", "none")
    .style("stroke-width", 1)
    .attr("d", line_fun_L(P_databyid));

    document.getElementById("lbl_Case").innerHTML = slider_val1;
    document.getElementById("lbl_Test").innerHTML = slider_val2;

    // Load_Dynamic(1001)

    // svgg_Dynamic.append("path").datum(P_databyid).attr("fill", "Green").attr("stroke", "white").style("opacity", 0.2).attr("stroke-width", 1.5)
    // .attr("d", d3.area()
    //       .x(function(d) {dt = new Date(d.Date); return P_x(dt) })
    //       .y0(y1(0))
    //       .y1(function(d) { return y1((parseFloat(d.Y_hat)))}))
    //      .attr("class","D_Svg1") 

    // setValue1 = ()=>{
    //     let newValue1 = Number( (range1.value - range1.min) * 100 / (range1.max - range1.min) ), newPosition1 = 15 - (newValue1 * 0.3);
    //     rangeV1.innerHTML = `<span>${(slider_val1+100)}</span>`;
    //     rangeV1.style.left = `calc(${newValue1}% + (${newPosition1}px))`;
    //         };
    //     document.addEventListener("DOMContentLoaded", setValue1);
    //     range1.addEventListener('input', setValue1);

    // setValue2 = ()=>{
    //     let newValue2 = Number( (range2.value - range2.min) * 100 / (range2.max - range2.min) ), newPosition2 = 15 - (newValue2 * 0.3);
    //     rangeV2.innerHTML = `<span>${(slider_val2+100)}</span>`;
    //     rangeV2.style.left = `calc(${newValue2}% + (${newPosition2}px))`;
    //             };
    //     document.addEventListener("DOMContentLoaded", setValue2);
    //     range2.addEventListener('input', setValue2);
console.log(slider_val1)
console.log(slider_val2)
// var mouseG = svgg_Dynamic.append("g").attr("class", "mouse-over-effects1").attr('transform', 'translate('+(width-100)+','+0+')');

// // this is the black vertical line to follow mouse
// mouseG.append("path") .attr("class", "mouse-line1").style("stroke", "Black").style("stroke-width", "2px").style("opacity", "0");

// var lines = document.getElementsByClassName('line_D');

// var mousePerLine = mouseG.selectAll('.mouse-per-line1').data(P_databyid).enter().append("g").attr("class", "mouse-per-line1");

// mousePerLine.append("text").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// // append a rect to catch mouse movements on SVG
// // can't catch mouse events on a g element
// mouseG.append('svg:rect') .attr('width', width) .attr('height', height).attr('fill', 'none').attr('pointer-events', 'all')
// .on('mouseout', function() 
// { // on mouse out hide line, circles and text
// d3.select(".mouse-line1").style("opacity", "0");
// d3.selectAll(".mouse-per-line1 text").style("opacity", "0");
// })
// .on('mouseover', function() 
// { // on mouse in show line and text
// d3.select(".mouse-line1").style("opacity", "1");
// d3.selectAll(".mouse-per-line1 text").style("opacity", "1");
// })
// .on('mousemove', function() 
// { // mouse moving over SVG
// var mouse = d3.mouse(this);
// d3.select(".mouse-line1")
// .attr("d", function() 
// {
// var d = "M" + mouse[0] + "," + height;
// d += " " + mouse[0] + "," + 0;
// return d;
// });
// d3.selectAll(".mouse-per-line1").data(P_databyid)
//   .attr("transform", function(d, i)
//     {
//     var xDate = x.invert(mouse[0]),
//     bisect = d3.bisector(function(d) { return d.Date; }).right;
//     idx = bisect(d, xDate);
//     var beginning = 0,
//     end = lines[i].getTotalLength(),
//     target = null;
//     while (true){
//     target = Math.floor((beginning + end) / 2);
//     pos = lines[i].getPointAtLength(target);
//     if ((target === end || target === beginning) && pos.x !== mouse[0]) 
//     {
//         break;
//     }
//     if (pos.x > mouse[0])      end = target;
//     else if (pos.x < mouse[0]) beginning = target;
//     else break; //position found
//     }
//     // .toFixed(2)
// d3.select(this).select('text')
//     .text("Incidents :"+y1.invert(pos.y)+" "+ formatTime(x.invert(pos.x)))
//     .style("fill","Black").style("font-size","1em");
//     return "translate(-20,40)";
//     // For dynamic position
//     // return "translate(" + (mouse[0]-110) + "," + (pos.y) +")";
//     });
// });

}

function Load_Dynamic(County_ID)
{
// 1001
// County_ID = 12086; 
data_id ={}, databyid= [];
let count=0;
var formatTime = d3.timeFormat("%B %d");

date_c = new Date("Oct 11,2020");
d = new Date(date_c.setDate(date_c.getDate()));
dd = new Date(d.setDate(date_c.getDate()));
d = dd.getDate();
m = dd.getMonth()+1;
y = dd.getFullYear();
graph_date = m+"/" + (d-1) +"/"+(y-100)
S_graph_date = y+"-" + m +"-"+d
console.log(typeof(S_graph_date))
for(let i=0; i<R_Data.length; i++)
{
  if(Math.floor(R_Data[i].fips)== County_ID)
    {    
    do
    {
      date_cc = new Date("Jan 21,2020");
      d = new Date(date_cc.setDate(date_cc.getDate()));
      dd = new Date(d.setDate(date_cc.getDate()+count));
      d = dd.getDate();
      m = dd.getMonth()+1;
      y = dd.getFullYear();
      check_date = y+"-" + m +"-"+(d-1)
      if(R_Data[i].death_incidence === '')
        {
          data_id ={id: Math.floor(R_Data[i].fips), Deaths : '0', date : R_Data[i].date}
        }
      else
        {
          data_id ={id: Math.floor(R_Data[i].fips), Deaths : R_Data[i].death_incidence, date : R_Data[i].date}
        }
      databyid.push(data_id);
      count=count+1;
      
      if(String(R_Data[i].date) === String(S_graph_date))
        {
          break;
        }
      }while(String(R_Data[i].date) === String(S_graph_date))         
      }
    }
console.log(databyid)
svgg_Dynamic.selectAll(".D_Svg").remove()
svgg_Dynamic.selectAll(".T_Axis").remove()
svgg_Dynamic.selectAll(".D_Y").remove()
svgg_Dynamic.selectAll(".D_title").remove()
svgg_Dynamic.selectAll(".line_D").remove()

var x = d3.scaleTime().range([0, (width-100) ]).domain(d3.extent(databyid, function(d) {
        dt = new Date(d.date);
        return dt;})); 

svgg_Dynamic.append("g").attr("transform", "translate(0," + height + ")").attr("class", "T_Axis").call(d3.axisBottom(x));

// var y1 = d3.scaleLinear().domain([0, d3.max(databyid, function(d){ return parseFloat(d.Deaths)})]).nice().range([height, 0 ]);
var y1 = d3.scaleLinear().domain([0, 2]).nice().range([height, 0 ]);

svgg_Dynamic.append("g").attr("class","D_Y").call(d3.axisLeft(y1));

var line_fun = d3.line()
    .x(function(d){dt = new Date(d.date); return x(dt);})
    .y(function(d){return y1(parseFloat(d.Deaths))})
// console.log(databyid)
svgg_Dynamic.append("path").data(databyid).attr("class", "line_D")
    .style("stroke", "#008080").attr("fill", "none")
    .style("stroke-width", 3)
    .attr("d", line_fun(databyid));
    // g_Dynamic

    svgg_Dynamic.append("path").datum(databyid).attr("fill", "orange").attr("stroke", "white").style("opacity", 0.7).attr("stroke-width", 0.5)
    .attr("d", d3.area()
          .x(function(d) {dt = new Date(d.date); return x(dt) })
          .y0(y1(0))
          .y1(function(d) { return y1((parseFloat(d.Deaths)))}))
         .attr("class","D_Svg") 
    
var mouseG = svgg_Dynamic.append("g").attr("class", "mouse-over-effects").attr('transform', 'translate(0,460)');

// this is the black vertical line to follow mouse
mouseG.append("path") .attr("class", "mouse-line").style("stroke", "Black").style("stroke-width", "2px").style("opacity", "0");

var lines = document.getElementsByClassName('line_D');

var mousePerLine = mouseG.selectAll('.mouse-per-line').data(databyid).enter().append("g").attr("class", "mouse-per-line");

mousePerLine.append("text").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// append a rect to catch mouse movements on SVG
// can't catch mouse events on a g element
mouseG.append('svg:rect') .attr('width', width) .attr('height', height).attr('fill', 'none').attr('pointer-events', 'all')
.on('mouseout', function() 
{ // on mouse out hide line, circles and text
d3.select(".mouse-line").style("opacity", "0");
d3.selectAll(".mouse-per-line text").style("opacity", "0");
})
.on('mouseover', function() 
{ // on mouse in show line and text
d3.select(".mouse-line").style("opacity", "1");
d3.selectAll(".mouse-per-line text").style("opacity", "1");
})
.on('mousemove', function() 
{ // mouse moving over SVG
var mouse = d3.mouse(this);
d3.select(".mouse-line")
.attr("d", function() 
{
var d = "M" + mouse[0] + "," + height;
d += " " + mouse[0] + "," + 0;
return d;
});
d3.selectAll(".mouse-per-line").data(databyid)
  .attr("transform", function(d, i)
    {
    var xDate = x.invert(mouse[0]),
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
    .text("Incidents :"+y1.invert(pos.y)+" "+ formatTime(x.invert(pos.x)))
    .style("fill","Black").style("font-size","1em");
    return "translate(-20,40)";
    // For dynamic position
    // return "translate(" + (mouse[0]-110) + "," + (pos.y) +")";
    });
});
}

  function Auto_Complete() {
    var currentFocus;
    var inp = document.getElementById("myInput");
    var arr = County_Data;
    
/*execute a function when someone writes in the text field:*/
inp.addEventListener("input", function(e) {
    var a, b, i, val = this.value;
    /*close any already open lists of autocompleted values*/
    closeAllLists();
    if (!val) { return false;}
    currentFocus = -1;
    /*create a DIV element that will contain the items (values):*/
    a = document.createElement("DIV");
    a.setAttribute("id", this.id + "autocomplete-list");
    a.setAttribute("class", "autocomplete-items");
    /*append the DIV element as a child of the autocomplete container:*/
    this.parentNode.appendChild(a);
    /*for each item in the array...*/
    for (i = 0; i < arr.length; i++) {
      /*check if the item starts with the same letters as the text field value:*/
      if (arr[i]["name"].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
        /*create a DIV element for each matching element:*/
        b = document.createElement("DIV");
        /*make the matching letters bold:*/
        b.innerHTML = "<strong>" + arr[i]["name"].substr(0, val.length) + "</strong>";
        b.innerHTML += arr[i]["name"].substr(val.length);
        /*insert a input field that will hold the current array item's value:*/
        b.innerHTML += "<input type='hidden' value='" + arr[i]["name"] + "'>";
        /*execute a function when someone clicks on the item value (DIV element):*/
            b.addEventListener("click", function(e) {
            /*insert the value for the autocomplete text field:*/
            inp.value = this.getElementsByTagName("input")[0].value;
            /*close the list of autocompleted values,
            (or any other open lists of autocompleted values:*/
            closeAllLists();
        });
        a.appendChild(b);
      }
    }
});
    
    
    /*execute a function presses a key on the keyboard:*/
    inp.addEventListener("keydown", function(e) {
        var x = document.getElementById(this.id + "autocomplete-list");
        if (x) x = x.getElementsByTagName("div");
        if (e.keyCode == 40) {
          /*If the arrow DOWN key is pressed,
          increase the currentFocus variable:*/
          currentFocus++;
          /*and and make the current item more visible:*/
          addActive(x);
        } else if (e.keyCode == 38) { //up
          /*If the arrow UP key is pressed,
          decrease the currentFocus variable:*/
          currentFocus--;
          /*and and make the current item more visible:*/
          addActive(x);
        } else if (e.keyCode == 13) {
          /*If the ENTER key is pressed, prevent the form from being submitted,*/
          e.preventDefault();
          if (currentFocus > -1) {
            /*and simulate a click on the "active" item:*/
            if (x)  x[currentFocus].click();
            
          }
        }
        var County_Name = document.getElementById("myInput").value;
  
        for(let i=0; i<arr.length; i++)
        {
            if(arr[i].name == County_Name)
            { 
                // Load_Dynamic(Math.floor(arr[i].fips))
                Load_County_CSV(arr[i].GEO_ID)
            }
        }  
    }
    );

    function addActive(x) {
        /*a function to classify an item as "active":*/
        if (!x) return false;
        /*start by removing the "active" class on all items:*/
        removeActive(x);
        if (currentFocus >= x.length) currentFocus = 0;
        if (currentFocus < 0) currentFocus = (x.length - 1);
        /*add class "autocomplete-active":*/
        x[currentFocus].classList.add("autocomplete-active");
      }
      
    function removeActive(x) {
      /*a function to remove the "active" class from all autocomplete items:*/
      for (var i = 0; i < x.length; i++) {
        x[i].classList.remove("autocomplete-active");
      }
    }
    function closeAllLists(elmnt) {
      /*close all autocomplete lists in the document,
      except the one passed as an argument:*/
      var x = document.getElementsByClassName("autocomplete-items");
      for (var i = 0; i < x.length; i++) {
        if (elmnt != x[i] && elmnt != inp) {
        x[i].parentNode.removeChild(x[i]);
      }
    }
  }
  /*execute a function when someone clicks in the document:*/
  document.addEventListener("click", function (e) {
      closeAllLists(e.target);
  });
  }
