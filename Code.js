
var margin = { top: 10, right: 30, bottom: 30, left: 50 },
    width = 810 - margin.left - margin.right, // previous width 810
    height = 500 - margin.top - margin.bottom;  //previous Height 500
var innerWidth = width - margin.left - margin.right;
var innerHeight = height - margin.top - margin.bottom;

var G_margin = {top: 10, right: 30, bottom: 30, left: 50},
    G_width = 550 - G_margin.left - G_margin.right,
    G_height = 250 - G_margin.top - G_margin.bottom;

var D_margin = {top: 10, right: 30, bottom: 30, left: 50},
    D_width = 450 - D_margin.left - D_margin.right,
    D_height = 300 - D_margin.top - D_margin.bottom;

///////////////  Global Variables ///////////////// 
var counties, states,  countyInfo, SDOHbyid = {}, INFbyid = {}, State_Dataset, StateByid = {}, w = 20, h = 150, Tagg = 0, State_d = [], Map_S,
 Casesbyid = {}, Deathsbyid = {}, Conf_Cases = {}, Conf_Deaths= {}, radiusScale, radiusValue, centered, Flag, FlagType=0, Tag=0, C_width=1420, slider_val, state_data=[], 
 date_list=[], G_data=[], t, Map_Type, SubMap_Type, F_Date, ConfirmedCases_Dataset=[], ConfirmedDeaths_Dataset=[], StatesbyName = {}, quantizeScale,
 databyid=[], data_id ={}, count=0, d, m, y, check_date = null, date_c, date_cc, vl, dt, graph_date, S_graph_date, clust_name, Temp_Var3, Temp_Var4;

var slider_val, date, dat, dat2, day, month, year, render_date;

var svgA = d3.select('#Covid_map').append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
var svgA_g = svgA.append('g')
    .attr('class', 'g_A')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

var svgDynamic = d3.select('#Dynamic_Line_Graph').append('svg')
    .attr('width', D_width + D_margin.left + D_margin.right)
    .attr('height', D_height + D_margin.top + D_margin.bottom)
var svgg_Dynamic = svgDynamic.append('g')
    .attr('class', 'g_Dynamic')
    .attr('transform', 'translate(' + D_margin.left + ',' + (D_margin.top)+ ')');

var svgArea1 = d3.select('#Line_Graph1').append('svg')
    .attr('width', G_width + G_margin.left + G_margin.right)
    .attr('height', G_height + G_margin.top + G_margin.bottom)
    .append('g')
    .attr('class', 'g_Area1')
    .attr('transform', 'translate(' + G_margin.left + ',' + G_margin.top + ')');

var svgArea2 = d3.select('#Line_Graph2').append('svg')
    .attr('width', G_width + G_margin.left + G_margin.right)
    .attr('height', G_height + G_margin.top + G_margin.bottom)
    .append('g')
    .attr('class', 'g_Area2')
    .attr('transform', 'translate(' + G_margin.left + ',' + G_margin.top + ')');

var svgArea3 = d3.select('#Line_Graph3').append('svg')
    .attr('width', G_width + G_margin.left + G_margin.right)
    .attr('height', G_height + G_margin.top + G_margin.bottom)
    .append('g')
    .attr('class', 'g_Area3')
    .attr('transform', 'translate(' + G_margin.left + ',' + G_margin.top + ')');

var svgArea4 = d3.select('#Line_Graph4').append('svg')
    .attr('width', G_width + G_margin.left + G_margin.right)
    .attr('height', G_height + G_margin.top + G_margin.bottom)
    .append('g')
    .attr('class', 'g_Area4')
    .attr('transform', 'translate(' + G_margin.left + ',' + G_margin.top + ')');

radiusScale = d3.scaleSqrt();
var projection = d3.geoAlbersUsa().translate([width/2.5, height/2]).scale(800)
var path = d3.geoPath().projection(projection)
var clusterColor = d3.scaleOrdinal(d3.schemeAccent);

Load_Graph();

function Load_Graph()
{
    Promise.all([ d3.csv('us-state-ansi-fips.csv'),
    d3.json('us.json'),d3.csv('data_Final_Data_Traditional_Sdoh_Factors.csv'),d3.csv('data_Final_Data_Modified_Sdoh_Factors.csv'),
    d3.csv('https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_US.csv'),
    d3.csv('https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_deaths_US.csv'),
    d3.csv('https://query.data.world/s/4u2fxporpsbahcsju3sbsfcee34dfm')
    ])
    .then(([State, Jdataset, T_SDOH_dataset, M_SDOH_dataset, CC_CCases, CC_CDeaths, State_Data]) => {
    T_SDOH_dataset.forEach(d => {SDOHbyid[d['fips']] = d;})
    M_SDOH_dataset.forEach(d => {INFbyid[d['fips']] = d;})
    CC_CCases.forEach(d => {Conf_Cases[Math.floor(d['FIPS'])] = d;})
    CC_CDeaths.forEach(d => {Conf_Deaths[Math.floor(d['FIPS'])] = d;})
    State.forEach(d => {StateByid[d['Fips']] = d;})
    State_Data.forEach(d => {StatesbyName[d['state']] = d;})
    counties = topojson.feature(Jdataset, Jdataset.objects.counties).features
    states = topojson.feature(Jdataset, Jdataset.objects.states).features
    states.forEach(d => { Object.assign(d.properties, StateByid[+d.id]);});
    states.forEach(d => { Object.assign(d.properties, StatesbyName[+d.stname]);});
    counties.forEach(d => { Object.assign(d.properties, SDOHbyid[+d.id]);});
    counties.forEach(d => { Object.assign(d.properties, INFbyid[+d.id]);});

    State_Dataset = State_Data;
    State_d =State;
    Tag=1;
    ConfirmedDeaths_Dataset =CC_CDeaths;
    ConfirmedCases_Dataset = CC_CCases;
    counties.forEach(d => {
        d.properties.projected = projection(d3.geoCentroid(d));
    });    
    Load_svgA(counties, states)
    Auto_Complete();
    })

    d3.csv('Rolling_Aggregate_Cases_INF_Clusters.csv').then(function (data) 
    { 
	G_data = data.map(function (d) {
	    return { date : d3.timeParse("%m/%d/%Y")(d.date), C_INF_0 : d.C_INF_0*100 ,C_INF_1 : d.C_INF_1*100 ,C_INF_2 : d.C_INF_2*100 ,
    C_INF_3 : d.C_INF_3*100 , C_SDOH_0 : d.C_SDOH_0*100 ,C_SDOH_1 : d.C_SDOH_1*100 ,C_SDOH_2 : d.C_SDOH_2*100 ,
    C_SDOH_3 : d.C_SDOH_3*100 , D_INF_0 : d.D_INF_0*100 ,D_INF_1 : d.D_INF_1*100 ,D_INF_2 : d.D_INF_2*100 ,D_INF_3 : d.D_INF_3*100 , 
    D_SDOH_0 : d.D_SDOH_0*100 ,D_SDOH_1 : d.D_SDOH_1*100 ,D_SDOH_2 : d.D_SDOH_2*100 ,D_SDOH_3 : d.D_SDOH_3*100  }
        })	
    })
}


function Case_type()
{
    Clear();
    var Cases_Type = document.getElementsByName("Cases_Type");
    if(Cases_Type[0].checked)
    {
        FlagType=0;
        Tagg =0;
    }
    else if(Cases_Type[1].checked)
    {
        FlagType=1;
        Tagg =1;
    }

    Map_S = document.getElementsByName("Map_S");
    if(Map_S[0].checked)
    {
        show_SDOH();
    }
    else if(Map_S[1].checked)
    {
        Flag=1;
    Load_State_Data()
    }
    
    counties.forEach(d => { if(projection(d3.geoCentroid(d)) !== null)
        {d.properties.projected = projection(d3.geoCentroid(d));}
        else{d.properties.projected = 0,0}
    });
}

function Map_CS(F_Id)
{
Map_S = document.getElementsByName("Map_S");
if(Map_S[0].checked)
    {
    Clear();
    show_SDOH();
    var Cases_Type = document.getElementsByName("Cases_Type");
    if(Cases_Type[0].checked)
    {
        FlagType=0;
        Tagg =0;
    }
    else if(Cases_Type[1].checked)
    {
        FlagType=1;
        Tagg =1;
    }
    Load_Dynamic(F_Id)
    }
else if(Map_S[1].checked)
    {
        svgA.selectAll(".legend_I").remove();
var legend_S = svgA.append("defs").attr("class", "legend_S").append("svg:linearGradient").attr("id", "gradient1").attr("x1", "100%")
    .attr("y1", "0%").attr("x2", "100%").attr("y2", "100%").attr("spreadMethod", "pad");
    // legend_S.append("stop").attr("offset", "0%").attr("stop-color", S_highColor).attr("stop-opacity", 1);	
    // legend_S.append("stop").attr("offset", "100%").attr("stop-color", S_lowColor).attr("stop-opacity", 1);

    svgA.append("rect").attr("width", w).attr("height", h).attr('class', 'legendI').attr("transform", "translate(640,290)").style("fill", "url(#gradient1)");
    Load_State_Data();
    }
}

function Load_State_Data()
{
    document.getElementById("Cluster_Name").innerHTML = ""
    console.log(State_Dataset)
    Clear();
    svgA_g.selectAll(".county").remove()
    svgA_g.selectAll(".state").remove()
    
     date_c = new Date;
     d = new Date(date_c.setDate(date_c.getDate()));
     dd = new Date(d.setDate(date_c.getDate()));
     d = dd.getDate()-2;
     m = dd.getMonth()+1;
     y = dd.getYear();
    var Curr_date = "20"+(y-100)+"-" + m +"-"+("0" + (d + 1)).slice(-2)
    var Temp_Var1=[], s_v1 =[], s_v2 =[], Var1 = {}, y_R, yAxis_R, colorLegend;

    for( let i=0; i<State_d.length; i++)
    {
        for(let j =0; j<State_Dataset.length; j++)
        {
            if(State_d[i]["stname"] === State_Dataset[j]["state"] && State_Dataset[j]["date"]===Curr_date)
            {
                    Var1= {State :State_Dataset[j]["state"], Cases : State_Dataset[j]["cumulative_cases_per_100_000"], Deaths : State_Dataset[j]["cumulative_deaths_per_100_000"], Date : State_Dataset[j]["date"]}
                    Temp_Var1.push(Var1)
                    s_v1.push(parseFloat(State_Dataset[j]["cumulative_cases_per_100_000"]))
                    s_v2.push(parseFloat(State_Dataset[j]["cumulative_deaths_per_100_000"]))
            } 
        }
    }  
    svgA.selectAll(".y_axis").remove()
    svgA_g.selectAll(".state").data(states).enter().append("path").attr("class", "state").attr("d", path)
    .attr('fill', function(d) {
        for(let i=0; i< Temp_Var1.length; i++)
        {
        if(d.properties.stname === Temp_Var1[i]["State"] && Temp_Var1[i]["Date"]===Curr_date)
        {
            if(Tagg === 0 || Tagg=== null)
            {      
              
                quantizeScale = d3.scaleQuantile()
                .domain(s_v1)
                .range(['#fee5d9', '#fcae91', '#fb6a4a', '#cb181d']);
                
                return quantizeScale(Temp_Var1[i]["Cases"])
            }
            else if(Tagg === 1)
            {
                quantizeScale = d3.scaleQuantile()
        .domain(s_v2)
        .range(['#fee5d9', '#fcae91', '#fb6a4a', '#cb181d']);
    //     svgA.append("g")
    // .attr("transform", "translate(610,20)")
    // .append(() => legend({quantizeScale,  width: 260, tickFormat: ".1f"}));
                return quantizeScale(Temp_Var1[i]["Deaths"])
            }
        } 
        }
    })
.attr("stroke", "Black")
.attr('opacity', 2)
.attr('cursor', 'pointer')
.on('click', function (d) { stateZoom(d) })
.on('mouseover', function(d)
{    
    for(let i=0; i<Temp_Var1.length; i++)
    {
    if(Temp_Var1[i]["State"]===d.properties.stname)
    {
        Temp_Var3=Temp_Var1[i]["Cases"]
        Temp_Var4=Temp_Var1[i]["Deaths"]
    }
    }
    d3.select(this).classed("selected", true)
    countyInfo = d3.select("#Covid_map").append("div").attr("class", "county_content").style("opacity", 0); 
    d3.select(this).style("stroke-width", 1).transition().duration(500);
    countyInfo.style("opacity", 1.1)
    .style("left", (d3.event.pageX - 350) + "px")
    .style("top", (d3.event.pageY - 300) + "px");
    if(Tagg === 0)
    {countyInfo.html("State : "+d.properties.stname+"<br/>"+"Cases : "+ Temp_Var3)
    svgg_Dynamic.selectAll(".D_title").remove()
    svgg_Dynamic.append('text').attr('class', 'D_title').attr('x', 30).attr('y', 28).text("Confirmed Cases :"+ parseInt(Temp_Var3));
    // document.getElementById("Cluster_Name").innerHTML = "Cluster : "+d.properties.cluster_sdoh_name;
}
    else if(Tagg === 1)
    {countyInfo.html("State : "+d.properties.stname+"<br/>"+"Deaths: "+Temp_Var4)
    svgg_Dynamic.selectAll(".D_title").remove()
    svgg_Dynamic.append('text').attr('class', 'D_title').attr('x', 30).attr('y', 28).text("Confirmed Cases :"+ parseInt(Temp_Var4));
    // document.getElementById("Cluster_Name").innerHTML = "Cluster : "+d.properties.cluster_inf_name;
}
    Load_Dynamic(d.properties.stname);
})
.on('mouseout', function(d){d3.select(this).classed("selected", false).style("stroke-width", '0.2px').transition().duration(100)
countyInfo.remove();
})
    svgA_g.call(d3.zoom().on('zoom', () => { d3.selectAll('.g_A').attr('transform', d3.event.transform);}));
    // State_scale = d3.scaleLinear().domain([SminVal,SmaxVal]).range([S_lowColor,S_highColor])
    // y_R = d3.scaleLinear().range([h, 0]).domain([CminVal, CmaxVal]);
    // yAxis_R = d3.axisLeft(y_R);
    // svgA.append("g").attr("class", "y_axis").attr("transform", "translate(639,290)").call(yAxis_R)

    // colorLegend = d3.legendColor().labelFormat(d3.format(".0f"))
    //             .scale(quantizeScale).shapePadding(5).shapeWidth(50)
    //             .shapeHeight(20).labelOffset(12);
    // svgA.append("g").attr("transform", "translate(640, 290)").call(colorLegend);
}

function Auto_Complete() {
    var currentFocus;
    var inp = document.getElementById("myInput");
    var arr = ConfirmedCases_Dataset;
    var arr1 = State_d;
    Map_S = document.getElementsByName("Map_S");
    if(Map_S[0].checked)
    {
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
    for (i = 0; i < arr1.length; i++) {
      /*check if the item starts with the same letters as the text field value:*/
      if (arr[i]["Combined_Key"].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
        /*create a DIV element for each matching element:*/
        b = document.createElement("DIV");
        /*make the matching letters bold:*/
        b.innerHTML = "<strong>" + arr[i]["Combined_Key"].substr(0, val.length) + "</strong>";
        b.innerHTML += arr[i]["Combined_Key"].substr(val.length);
        /*insert a input field that will hold the current array item's value:*/
        b.innerHTML += "<input type='hidden' value='" + arr[i]["Combined_Key"] + "'>";
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
    }
    else if(Map_S[1].checked)
    {
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
    for (i = 0; i < arr1.length; i++) {
      /*check if the item starts with the same letters as the text field value:*/
      if (arr1[i]["stname"].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
        /*create a DIV element for each matching element:*/
        b = document.createElement("DIV");
        /*make the matching letters bold:*/
        b.innerHTML = "<strong>" + arr1[i]["stname"].substr(0, val.length) + "</strong>";
        b.innerHTML += arr1[i]["stname"].substr(val.length);
        /*insert a input field that will hold the current array item's value:*/
        b.innerHTML += "<input type='hidden' value='" + arr1[i]["stname"] + "'>";
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
    }
    
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
    if(Map_S[0].checked)
    {
       
        for(let i=0; i<ConfirmedDeaths_Dataset.length; i++)
        {
            if(ConfirmedCases_Dataset[i].Combined_Key == County_Name)
            { 
               if(FlagType == null) FlagType=0
                Load_Dynamic(Math.floor(ConfirmedCases_Dataset[i].FIPS))
            }
        }
    }
    else if(Map_S[1].checked)
    {
        for(let i=0; i<State_d.length; i++)
        {
            if(State_d[i].stname == County_Name)
            { 
            //    if(FlagType == null) FlagType=0
                Load_Dynamic(State_d[i].stname)
            }
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

function Load_Dynamic(County_ID)
{
svgg_Dynamic.selectAll(".D_title").remove()
data_id ={}, databyid= [];
count=0
var formatTime = d3.timeFormat("%B %d");
var parseTime = d3.timeParse("%m/%d/%y");
var Cases_Type = document.getElementsByName("Cases_Type");

    if(Cases_Type[0].checked)
    {
        FlagType=0;
    }
    else if(Cases_Type[1].checked)
    {
        FlagType=1;
    }
date_c = new Date;
d = new Date(date_c.setDate(date_c.getDate()));
dd = new Date(d.setDate(date_c.getDate()));
d = dd.getDate();
m = dd.getMonth()+1;
y = dd.getYear();
graph_date = m+"/" + (d-2) +"/"+(y-100)
S_graph_date = "20"+(y-100)+"-" + m +"-"+d
Map_S = document.getElementsByName("Map_S");
if(Map_S[0].checked)
{
    if(FlagType==0)
    {
        for(let i=0; i<ConfirmedCases_Dataset.length; i++)
        {
        if(Math.floor(ConfirmedCases_Dataset[i].FIPS)== County_ID)
            {    
            document.getElementById("placeTitle").innerHTML = (ConfirmedCases_Dataset[i]["Combined_Key"]).slice(0, -4);
            do
                {
                date_cc = new Date("Jan 22,2020");
                d = new Date(date_cc.setDate(date_cc.getDate()));
                dd = new Date(d.setDate(date_cc.getDate()+count));
                d = dd.getDate();
                m = dd.getMonth()+1;
                y = dd.getYear();
                check_date = m+"/" + d +"/"+(y-100)
                data_id ={id: Math.floor(ConfirmedCases_Dataset[i].FIPS), cases : ConfirmedCases_Dataset[i][check_date], date :check_date}
                vl =parseInt(ConfirmedCases_Dataset[i][graph_date])

                databyid.push(data_id)
                count=count+1;
                if(vl=== parseInt(ConfirmedCases_Dataset[i][check_date]))
                    {
                    break;
                    }
                } while(vl === parseInt(ConfirmedCases_Dataset[i][graph_date]))           
            }
        }
        svgg_Dynamic.append('text').attr('class', 'D_title').attr('x', 30).attr('y', 28).text("Confirmed Cases :"+ parseInt(vl));
    }
    else
    {
        for(let i=0; i<ConfirmedDeaths_Dataset.length; i++)
            {
            if(Math.floor(ConfirmedDeaths_Dataset[i].FIPS)== County_ID)
                {    
                document.getElementById("placeTitle").innerHTML = (ConfirmedDeaths_Dataset[i]["Combined_Key"]).slice(0, -4);
                do
                    {
                    date_c = new Date("Jan 22,2020");
                    d = new Date(date_c.setDate(date_c.getDate()));
                    dd = new Date(d.setDate(date_c.getDate()+count));
                    d = dd.getDate();
                    m = dd.getMonth()+1;
                    y = dd.getYear();
                    check_date = m+"/" + d +"/"+(y-100)
                    data_id ={id: Math.floor(ConfirmedDeaths_Dataset[i].FIPS), cases : ConfirmedDeaths_Dataset[i][check_date], date :check_date}
                    vl =parseInt(ConfirmedDeaths_Dataset[i][graph_date])
                    databyid.push(data_id)
                    count=count+1;
                    if(vl=== parseInt(ConfirmedDeaths_Dataset[i][check_date]))
                        {
                        break;
                        }
                    } while(vl === parseInt(ConfirmedDeaths_Dataset[i][graph_date]))           
                }
            }
            svgg_Dynamic.append('text').attr('class', 'D_title').attr('x', 30).attr('y', 28).text("Confirmed Deaths :"+ parseInt(vl));
    }
}
else if(Map_S[1].checked)
    {
        if(FlagType===0)
        {
        for(let i=0; i<State_Dataset.length; i++)
        {
        if(State_Dataset[i].state === County_ID)
            {    
            document.getElementById("placeTitle").innerHTML = State_Dataset[i]["state"];
            do
                {
                date_c = new Date("Jan 22,2020");
                d = new Date(date_c.setDate(date_c.getDate()));
                dd = new Date(d.setDate(date_c.getDate()+count));
                d = dd.getDate();
                m = dd.getMonth()+1;
                y = dd.getYear();
                check_date = "20"+(y-100)+"-" + m +"-"+d
                data_id ={State : State_Dataset[i].state, cases : State_Dataset[i]["cumulative_cases_per_100_000"], date :State_Dataset[i]["date"]}
                databyid.push(data_id)
                count=count+1;
                if(S_graph_date=== State_Dataset[i].date && State_Dataset[i].state === County_ID)
                    {
                        vl =State_Dataset[i]["cumulative_cases_per_100_000"]
                    break;
                    }
                } while(S_graph_date=== State_Dataset[i].date && State_Dataset[i].state === County_ID)           
            }
        }
        svgg_Dynamic.append('text').attr('class', 'D_title').attr('x', 30).attr('y', 28).text("Confirmed Cases :"+ parseInt(Temp_Var3));
        }
        else
        {
            for(let i=0; i<State_Dataset.length; i++)
                {
                if(State_Dataset[i]["state"] === County_ID)
                    {    
                    document.getElementById("placeTitle").innerHTML = State_Dataset[i]["state"];
                    do
                        {
                        date_c = new Date("Jan 22,2020");
                        d = new Date(date_c.setDate(date_c.getDate()));
                        dd = new Date(d.setDate(date_c.getDate()+count));
                        d = dd.getDate()-2;
                        m = dd.getMonth()+1;
                        y = dd.getYear();
                        check_date = "20"+(y-100)+"-" + m +"-"+d
                        data_id ={State : State_Dataset[i].state, cases : State_Dataset[i]["cumulative_deaths_per_100_000"],  date : State_Dataset[i]["date"]}
                        databyid.push(data_id)
                        count=count+1;
                        if(S_graph_date=== State_Dataset[i].date && State_Dataset[i].state === County_ID)
                        {
                        vl =State_Dataset[i]["cumulative_deaths_per_100_000"]
                        break;
                        }
                    } while(S_graph_date=== State_Dataset[i].date && State_Dataset[i].state === County_ID)            
                    }
                }
                svgg_Dynamic.append('text').attr('class', 'D_title').attr('x', 30).attr('y', 28).text("Confirmed Deaths :"+ parseInt(Temp_Var4));
        }
    }
svgg_Dynamic.selectAll(".D_Svg").remove()
svgg_Dynamic.selectAll(".T_Axis").remove()
svgg_Dynamic.selectAll(".D_Y").remove()
svgg_Dynamic.selectAll(".line_D").remove()
    var x = d3.scaleTime().range([0, D_width ]).domain(d3.extent(databyid, function(d) {
        dt = new Date(d.date);
        return dt;})); 
        svgg_Dynamic.append("g").attr("transform", "translate(0," + D_height + ")").attr("class", "T_Axis").call(d3.axisBottom(x));

    var y1 = d3.scaleLinear().domain([0, d3.max(databyid, function(d){ return parseInt(d.cases)})]).nice().range([ D_height, 0 ]);
    svgg_Dynamic.append("g").attr("class","D_Y").call(d3.axisLeft(y1));

    var line_fun = d3.line()
    .x(function(d){dt = new Date(d.date); return x(dt);})
    .y(function(d){return y1(parseInt(d.cases))})

svgg_Dynamic.append("path").data(databyid).attr("class", "line_D")
    .style("stroke", "#008080").attr("fill", "none")
    .style("stroke-width", 3)
    .attr("d", line_fun(databyid));
    
    svgg_Dynamic.append("path").datum(databyid).attr("fill", "red").attr("stroke", "white").style("opacity", 0.7).attr("stroke-width", 1.5)
    .attr("d", d3.area()
          .x(function(d) {dt = new Date(d.date); return x(dt) })
          .y0(y1(0))
          .y1(function(d) { return y1((parseInt(d.cases)))}))
         .attr("class","D_Svg") 
    
var mouseG = svgg_Dynamic.append("g").attr("class", "mouse-over-effects").attr('transform', 'translate(0,0)');

// this is the black vertical line to follow mouse
mouseG.append("path") .attr("class", "mouse-line").style("stroke", "Black").style("stroke-width", "2px").style("opacity", "0");

var lines = document.getElementsByClassName('line_D');

var mousePerLine = mouseG.selectAll('.mouse-per-line').data(databyid).enter().append("g").attr("class", "mouse-per-line");

mousePerLine.append("text").attr("transform", "translate(" + D_margin.left + "," + D_margin.top + ")");

// append a rect to catch mouse movements on SVG
// can't catch mouse events on a g element
mouseG.append('svg:rect') .attr('width', D_width) .attr('height', D_height).attr('fill', 'none').attr('pointer-events', 'all')
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
var d = "M" + mouse[0] + "," + D_height;
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
    .text("Incidents :"+Math.floor(y1.invert(pos.y))+" "+ formatTime(x.invert(pos.x)))
    .style("fill","Black").style("font-size","1em");
    return "translate(-20,40)";
    // For dynamic position
    // return "translate(" + (mouse[0]-110) + "," + (pos.y) +")";
    });
});
}

$("#ex7-enabled").click(function() { 
    
	if(this.checked) {
		document.getElementById('slider').disable = false;
	}
	else {
		document.getElementById('slider').disable = true;
	}
});

function Reload()
{
    location.reload();	
}

function Load_svgA(counties, states)
{
    svgA_g.selectAll(".county").data(counties).enter().append("path").attr("class", "county").attr("d", path)
    .attr('fill', "white")//d => clusterColor(d.properties.Cluster_Census))
    .attr('cursor', 'pointer')
    svgA_g.selectAll(".state").data(states).enter().append("path").attr("class", "state").attr("d", path).attr("fill", "None")
    svgA_g.call(d3.zoom().on('zoom', () => { d3.selectAll('.g_A').attr('transform', d3.event.transform);}));

    date_c = new Date;
    d = new Date(date_c.setDate(date_c.getDate()));
    dd = new Date(d.setDate(date_c.getDate()));
    d = dd.getDate()-2
    m = dd.getMonth()+1;
    y = dd.getYear();
    var Curr_date = "20"+(y-100)+"-" + m +"-"+("0" + (d + 1)).slice(-2)
    var cnt=0, cnt1=0;
    for(let i=0; i<State_Dataset.length; i++)
    {
        if (Curr_date === State_Dataset[i]["date"]) 
        {
        cnt=cnt + parseInt(State_Dataset[i]["cumulative_cases"])
        cnt1= cnt1 + parseInt(State_Dataset[i]["cumulative_deaths"])
        }
    }
    document.getElementById("C_Cases").innerHTML = cnt.toLocaleString();
    document.getElementById("D_Cases").innerHTML = cnt1.toLocaleString();

    counties.forEach(d => { Object.assign(d.properties, Conf_Cases[+d.id]);});

    counties.forEach(d => { if(projection(d3.geoCentroid(d)) !== null)
        {d.properties.projected = projection(d3.geoCentroid(d));}
        else{d.properties.projected = 0,0}
    });

    
}

function Load_SdohMap()
{
    svgA_g.selectAll(".county").remove()
    svgA_g.selectAll(".state").remove()
    svgA_g.selectAll(".country-circle").remove()
    Clear();
    svgA_g.selectAll(".county").data(counties).enter().append("path").attr("class", "county").attr("d", path)
    .attr('fill', function(d) {
        if(Map_Type == "SDOH")
        {
        // document.getElementById("DropSub").disabled=true;
        return clusterColor(d.properties.trad_F_Cluster)
        }
        else if(Map_Type == "Reg_SDOH")
        {
        // document.getElementById("DropSub").disabled=false;
        return "white"
        }
        
        else if(Map_Type == "INF")
        {
        // document.getElementById("DropSub").disabled=true;
        return  clusterColor(d.properties.mod_F_Cluster)
        }
        else if(Map_Type == "Reg_INF")
        {
        // document.getElementById("DropSub").disabled=false;
        return "white"
        }
    })
    .attr('opacity', 0.8)
    .attr('cursor', 'pointer')
    .on('click', function (d) { stateZoom(d) })
    .on('mouseover', function(d)
    {    
        d3.select(this).classed("selected", true)
        countyInfo = d3.select("#Covid_map").append("div").attr("class", "county_content").style("opacity", 0); 
        d3.select(this).style("stroke-width", 1).transition().duration(500);
        countyInfo.style("opacity", 1.1)
        .style("left", (d3.event.pageX - 350) + "px")
        .style("top", (d3.event.pageY - 300) + "px");
        if(Map_Type == "SDOH")
        {
        if(parseInt(d.properties.trad_F_Cluster)== 0) 
        {
            clust_name = "Working Class"
        }
        if(parseInt(d.properties.trad_F_Cluster)== 1) 
        {
            clust_name = "Majorly White, Elderly"
        }
        if(parseInt(d.properties.trad_F_Cluster)== 2) 
        {
            clust_name = "Socioeconomically Disadvantaged"
        }
        if(parseInt(d.properties.trad_F_Cluster)== 3) 
        {
            clust_name = "Socioeconomically Advantaged"
        }
        if(parseInt(d.properties.trad_F_Cluster)== 4) 
        {
            clust_name = "Deprived Immigrant"
        }
        countyInfo.html("County: "+d.properties.name+"<br/>"+"Cluster: "+clust_name)
        document.getElementById("Cluster_Name").innerHTML = "Cluster : "+clust_name;}
        else if(Map_Type == "INF")
        {
            if(parseInt(d.properties.mod_F_Cluster)== 0) 
            {
                clust_name = "Metropolitan Core"
            }
            if(parseInt(d.properties.mod_F_Cluster)== 1) 
            {
                clust_name = "Urban Working Class"
            }
            if(parseInt(d.properties.mod_F_Cluster)== 2) 
            {
                clust_name = "Socioeconomically Disadvantaged with Poor Health"
            }
            if(parseInt(d.properties.mod_F_Cluster)== 3) 
            {
                clust_name = "Socioeconomically Advantaged"
            }
            if(parseInt(d.properties.mod_F_Cluster)== 4) 
            {
                clust_name = "Deprived Immigrant, Poor Health"
            }    
            if(parseInt(d.properties.mod_F_Cluster)== 5) 
            {
                clust_name = "Rural, White, Elderly"
            }  
        countyInfo.html("County: "+d.properties.name+"<br/>"+"Cluster: "+clust_name)
        document.getElementById("Cluster_Name").innerHTML = "Cluster : "+clust_name}
        Load_Dynamic(Math.floor(d.properties.FIPS));
    })
    .on('mouseout', function(d){d3.select(this).classed("selected", false).style("stroke-width", '0.2px').transition().duration(100)
    countyInfo.remove();
})
    svgA_g.selectAll(".state").data(states).enter().append("path").attr("class", "state").attr("d", path).attr("fill", "None")
    svgA_g.call(d3.zoom().on('zoom', () => { d3.selectAll('.g_A').attr('transform', d3.event.transform);}));
    
}

// function Load_SubSdohMap()
// {
//     svgA_g.selectAll(".county").remove()
//     svgA_g.selectAll(".state").remove()
//     svgA_g.selectAll(".country-circle").remove()
//     Clear();
//     if(Map_Type == "Reg_SDOH")
//     {
//     svgA_g.selectAll(".county").data(counties).enter().append("path").attr("class", "county").attr("d", path)
//     .attr('fill', function(d){
//             if(SubMap_Type == "MW")
//         {
//             return clusterColor(d.properties.cluster_sdoh_MW)
//         }
//         else if(SubMap_Type == "NE")
//         {
//             return clusterColor(d.properties.cluster_sdoh_NE)
//         }
//         else if(SubMap_Type == "S")
//         {
//             return  clusterColor(d.properties.cluster_sdoh_SO)
//         }
//         else if(SubMap_Type == "W")
//         {
//             return clusterColor(d.properties.cluster_sdoh_WE)
//         }
//         })
//         .attr('cursor', 'pointer')
//         .on('click', function (d) { stateZoom(d) })
//         .on('mouseover', function(d)
//         {
//             d3.select(this).classed("selected", true)
//             countyInfo = d3.select("#Covid_map").append("div").attr("class", "county_content").style("opacity", 0); 
//             d3.select(this).style("stroke-width", 1).transition().duration(500);
//             countyInfo.style("opacity", 1.1)
//             .style("left", (d3.event.pageX - 300) + "px")
//             .style("top", (d3.event.pageY - 250) + "px");
//             if(SubMap_Type == "MW")
//             {countyInfo.html("County: "+d.properties.name+"<br/>"+"Cluster: "+d.properties.cluster_sdoh_name)
//             document.getElementById("Cluster_Name").innerHTML = "Cluster : "+d.properties.cluster_sdoh_name;}
//             else if(SubMap_Type == "NE")
//             {countyInfo.html("County: "+d.properties.name+"<br/>"+"Cluster: "+d.properties.cluster_sdoh_name)
//             document.getElementById("Cluster_Name").innerHTML = "Cluster : "+d.properties.cluster_sdoh_name;}
//             else if(SubMap_Type == "S")
//             {countyInfo.html("County: "+d.properties.name+"<br/>"+"Cluster: "+d.properties.cluster_sdoh_name)
//             document.getElementById("Cluster_Name").innerHTML = "Cluster : "+d.properties.cluster_sdoh_name;}
//             else if(SubMap_Type == "W")
//             {countyInfo.html("County: "+d.properties.name+"<br/>"+"Cluster: "+d.properties.cluster_sdoh_name)
//             document.getElementById("Cluster_Name").innerHTML = "Cluster : "+d.properties.cluster_sdoh_name;}
//             Load_Dynamic(d.properties.fips);
//         })
//         .on('mouseout', function(d){d3.select(this).classed("selected", false).style("stroke-width", '0.2px').transition().duration(100)
//         countyInfo.remove();
//         })
//     }
//     else if(Map_Type == "Reg_INF")
//     {
//         svgA_g.selectAll(".county").data(counties).enter().append("path").attr("class", "county").attr("d", path)
//         .attr('fill', function(d){
//         if(SubMap_Type == "MW")
//         {
//             return clusterColor(d.properties.cluster_inf_MW)
//         }
//         else if(SubMap_Type == "NE")
//         {
//             return clusterColor(d.properties.cluster_inf_NE)
//         }
//         else if(SubMap_Type == "S")
//         {
//             return  clusterColor(d.properties.cluster_inf_SO)
//         }
//         else if(SubMap_Type == "W")
//         {
//             return clusterColor(d.properties.cluster_inf_WE)
//         }
//         })
//         .attr('cursor', 'pointer')
//         .on('click', function (d) { stateZoom(d) })
//         .on('mouseover', function(d)
//         {
//             d3.select(this).classed("selected", true)
//             countyInfo = d3.select("#Covid_map").append("div").attr("class", "county_content").style("opacity", 0); 
//             d3.select(this).style("stroke-width", 1).transition().duration(500);
//             countyInfo.style("opacity", 1.1)
//             .style("left", (d3.event.pageX - 350) + "px")
//             .style("top", (d3.event.pageY - 300) + "px");
//             if(SubMap_Type == "MW")
//             {countyInfo.html("County: "+d.properties.name+"<br/>"+"Cluster: "+d.properties.cluster_inf_name)
//             document.getElementById("Cluster_Name").innerHTML = "Cluster : "+d.properties.cluster_inf_name;}
//             else if(SubMap_Type == "NE")
//             {countyInfo.html("County: "+d.properties.name+"<br/>"+"Cluster: "+d.properties.cluster_inf_name)
//             document.getElementById("Cluster_Name").innerHTML = "Cluster : "+d.properties.cluster_inf_name;}
//             else if(SubMap_Type == "S")
//             {countyInfo.html("County: "+d.properties.name+"<br/>"+"Cluster: "+d.properties.cluster_inf_name)
//             document.getElementById("Cluster_Name").innerHTML = "Cluster : "+d.properties.cluster_inf_name;}
//             else if(SubMap_Type == "W")
//             {countyInfo.html("County: "+d.properties.name+"<br/>"+"Cluster: "+d.properties.cluster_inf_name)
//             document.getElementById("Cluster_Name").innerHTML = "Cluster : "+d.properties.cluster_inf_name;}
//             Load_Dynamic(d.properties.fips);
//         })
//         .on('mouseout', function(d){d3.select(this).classed("selected", false).style("stroke-width", '0.2px').transition().duration(100)
//         countyInfo.remove();
//         })
//     }
//     svgA_g.selectAll(".state").data(states).enter().append("path").attr("class", "state").attr("d", path).attr("fill", "None")
//     svgA_g.call(d3.zoom().on('zoom', () => { d3.selectAll('.g_A').attr('transform', d3.event.transform);}));
    
// }

function Trad_Legend()
{
    svgA.selectAll(".legend_I").remove();
    svgA.append("rect").attr("x", 100).attr("y", 420).attr("width", 10).attr("height", 10).attr("fill","#7fc97f").attr("class", "legend_I");
    svgA.append("text").attr("x", 165).attr("y", 430).style("text-anchor", "middle").attr("fill","Black").text("Working Class").attr("class", "legend_I");
    svgA.append("rect").attr("x", 100).attr("y", 440).attr("width", 10).attr("height", 10).attr("fill","#ffff99").attr("class", "legend_I");
    svgA.append("text").attr("x", 190).attr("y", 450).style("text-anchor", "middle").attr("fill","Black").text("Majorly White, Elderly").attr("class", "legend_I");
    svgA.append("rect").attr("x", 100).attr("y", 460).attr("width", 10).attr("height", 10).attr("fill","#fdc086").attr("class", "legend_I");
    svgA.append("text").attr("x", 220).attr("y", 470).style("text-anchor", "middle").attr("fill","Black").text("Socioeconomically Disadvantaged").attr("class", "legend_I");
    svgA.append("rect").attr("x", 270).attr("y", 420).attr("width", 10).attr("height", 10).attr("fill","#beaed4").attr("class", "legend_I");
    svgA.append("text").attr("x", 380).attr("y", 430).style("text-anchor", "middle").attr("fill","Black").text("Socioeconomically Advantaged").attr("class", "legend_I");
    svgA.append("rect").attr("x", 270).attr("y", 440).attr("width", 10).attr("height", 10).attr("fill","#386cb0").attr("class", "legend_I");
    svgA.append("text").attr("x", 350).attr("y", 450).style("text-anchor", "middle").attr("fill","Black").text("Deprived Immigrant").attr("class", "legend_I");
}

function Mod_Legend()
{
    svgA.selectAll(".legend_I").remove();
    svgA.append("rect").attr("x", 100).attr("y", 420).attr("width", 10).attr("height", 10).attr("fill","#7fc97f").attr("class", "legend_I");
    svgA.append("text").attr("x", 180).attr("y", 430).style("text-anchor", "middle").attr("fill","Black").text("Metropolitan Core").attr("class", "legend_I");
    svgA.append("rect").attr("x", 100).attr("y", 440).attr("width", 10).attr("height", 10).attr("fill","#ffff99").attr("class", "legend_I");
    svgA.append("text").attr("x", 190).attr("y", 450).style("text-anchor", "middle").attr("fill","Black").text("Urban Working Class").attr("class", "legend_I");
    svgA.append("rect").attr("x", 100).attr("y", 460).attr("width", 10).attr("height", 10).attr("fill","#666666").attr("class", "legend_I");
    svgA.append("text").attr("x", 190).attr("y", 470).style("text-anchor", "middle").attr("fill","Black").text("Rural, White, Elderly").attr("class", "legend_I");
    svgA.append("rect").attr("x", 300).attr("y", 420).attr("width", 10).attr("height", 10).attr("fill","#beaed4").attr("class", "legend_I");
    svgA.append("text").attr("x", 415).attr("y", 430).style("text-anchor", "middle").attr("fill","Black").text("Socioeconomically Advantaged").attr("class", "legend_I");
    svgA.append("rect").attr("x", 300).attr("y", 440).attr("width", 10).attr("height", 10).attr("fill","#386cb0").attr("class", "legend_I");
    svgA.append("text").attr("x", 420).attr("y", 450).style("text-anchor", "middle").attr("fill","Black").text("Deprived Immigrant, Poor Health").attr("class", "legend_I");
    svgA.append("rect").attr("x", 300).attr("y", 460).attr("width", 10).attr("height", 10).attr("fill","#fdc086").attr("class", "legend_I");
    svgA.append("text").attr("x", 470).attr("y", 470).style("text-anchor", "middle").attr("fill","Black").text("Socioeconomically Disadvantaged with Poor Health").attr("class", "legend_I");
}

function show_SDOH()
{Map_Type = "SDOH";Load_SdohMap();
Trad_Legend();
}

function show_Reg_SDOH()
{Map_Type = "Reg_SDOH";Load_SdohMap();}

function show_INF()
{Map_Type = "INF";Load_SdohMap();
Mod_Legend();
}

function show_Reg_INF()
{Map_Type = "Reg_INF";Load_SdohMap();}

function show_Modi_W()
{SubMap_Type = "W";Map_Type = "Reg_INF";Load_SubSdohMap();}

function show_Modi_S()
{SubMap_Type = "S";Map_Type = "Reg_INF";Load_SubSdohMap();}

function show_Modi_MW()
{SubMap_Type ="MW";Map_Type = "Reg_INF";Load_SubSdohMap();}

function show_Modi_NE()
{SubMap_Type="NE";Map_Type = "Reg_INF";Load_SubSdohMap();}

function show_UNModi_W()
{SubMap_Type="W";Map_Type = "Reg_SDOH";Load_SubSdohMap();}

function show_UNModi_S()
{SubMap_Type="S";Map_Type = "Reg_SDOH";Load_SubSdohMap();}

function show_UNModi_MW()
{SubMap_Type="MW";Map_Type = "Reg_SDOH";Load_SubSdohMap();}

function show_UNModi_NE()
{SubMap_Type="NE";Map_Type = "Reg_SDOH";Load_SubSdohMap();}

function radioMode()
{
    counties.forEach(d => { if(projection(d3.geoCentroid(d)) !== null)
        {d.properties.projected = projection(d3.geoCentroid(d));}
        else{d.properties.projected = 0,0}
    });
    var mode_R = document.getElementsByName("modeR");
    if(mode_R[0].checked)
    {
        FlagType=0;
        counties.forEach(d => { Object.assign(d.properties, Conf_Cases[+d.id]);});
        Load_Cases_Circles(); 
        document.getElementById('slider').value = 0;
    }
    else if(mode_R[1].checked)
    {
        FlagType=1;
        counties.forEach(d => { Object.assign(d.properties, Conf_Deaths[+d.id]);});
        Load_Death_Circles();
        document.getElementById('slider').value = 0;
    }
}

function Clear()
{
    svgArea1.selectAll(".group_1").remove()
    svgArea2.selectAll(".group_2").remove()
    svgArea3.selectAll(".group_3").remove()
    svgArea4.selectAll(".group_4").remove()
    svgArea1.selectAll(".G_Y_1").remove()
    svgArea2.selectAll(".G_Y_2").remove()
    svgArea3.selectAll(".G_Y_3").remove()
    svgArea4.selectAll(".G_Y_4").remove()
    svgArea1.selectAll(".Time_Axis_1").remove()
    svgArea2.selectAll(".Time_Axis_2").remove()
    svgArea3.selectAll(".Time_Axis_3").remove()
    svgArea4.selectAll(".Time_Axis_4").remove()
    svgArea1.selectAll(".title").remove()
    svgArea2.selectAll(".title").remove()
    svgArea3.selectAll(".title").remove()
    svgArea4.selectAll(".title").remove()
    svgArea1.selectAll(".axis-label").remove()
    svgArea2.selectAll(".axis-label").remove()
    svgArea3.selectAll(".axis-label").remove()
    svgArea4.selectAll(".axis-label").remove()
}

function Load_Cases()
{
  Clear();
  
if(Map_Type=="INF")
{ 
           MAX = Math.max(
            d3.max(G_data, function(d) { return +d.C_INF_0; }),
            d3.max(G_data, function(d) { return +d.C_INF_1; }),
            d3.max(G_data, function(d) { return +d.C_INF_2; }), 
            d3.max(G_data, function(d) { return +d.C_INF_3; }))
            // Add Y axis
       var x = d3.scaleTime().range([0, G_width ]).domain(d3.extent(G_data, function(d) {return d.date;}));
 
        var y1 = d3.scaleLinear().domain([0, MAX+100]).range([ G_height, 0 ]) 
        svgArea1.append("g").attr("class","G_Y_1").call(d3.axisLeft(y1));
        var y2 = d3.scaleLinear().domain([0,MAX+100]).range([ G_height, 0 ]);
        svgArea2.append("g").attr("class","G_Y_2").call(d3.axisLeft(y2));
        var y3 = d3.scaleLinear().domain([0,MAX+100]).range([ G_height, 0 ]);
        svgArea3.append("g").attr("class","G_Y_3").call(d3.axisLeft(y3));
        var y4 = d3.scaleLinear().domain([0,MAX+100]).range([ G_height, 0 ]);
        svgArea4.append("g").attr("class","G_Y_4").call(d3.axisLeft(y4));        

        svgArea1.append("g")
        .attr("transform", "translate(0," + G_height + ")")
        .attr("class", "Time_Axis_1")
        .call(d3.axisBottom(x));
        // svgArea1.append('text').attr('class', 'axis-label').attr('y', -37).attr('x', -G_height / 1.8)
        // .attr('fill', 'black').attr('transform', `rotate(-90)`).attr('text-anchor', 'middle').text("Cumulative incidence rate");

        svgArea2.append("g")
        .attr("transform", "translate(0," + G_height + ")")
        .attr("class", "Time_Axis_2")
        .call(d3.axisBottom(x));
        // svgArea2.append('text').attr('class', 'axis-label').attr('y', -37).attr('x', -G_height / 1.8)
        // .attr('fill', 'black').attr('transform', `rotate(-90)`).attr('text-anchor', 'middle').text("Cumulative incidence rate");

        svgArea3.append("g")
        .attr("transform", "translate(0," + G_height + ")")
        .attr("class", "Time_Axis_3")
        .call(d3.axisBottom(x));
        // svgArea3.append('text').attr('class', 'axis-label').attr('y', -37).attr('x', -G_height / 1.8)
        // .attr('fill', 'black').attr('transform', `rotate(-90)`).attr('text-anchor', 'middle').text("Cumulative incidence rate");

        svgArea4.append("g")
        .attr("transform", "translate(0," + G_height + ")")
        .attr("class", "Time_Axis_4")
        .call(d3.axisBottom(x));
        // svgArea4.append('text').attr('class', 'axis-label').attr('y', -37).attr('x', -G_height / 1.8)
        // .attr('fill', 'black').attr('transform', `rotate(-90)`).attr('text-anchor', 'middle').text("Cumulative incidence rate");

        svgArea1.append("path").datum(G_data).attr("fill", "red").attr("stroke", "white").style("opacity", 0.7).attr("stroke-width", 1.5).attr("d", d3.area()
          .x(function(d) { return x(d.date) })
          .y0(y1(0))
          .y1(function(d) { return y1(+d.C_INF_0) }))
         .attr("class","group_1") 
        svgArea1.append('text').attr('class', 'title').attr('x', 30).attr('y', 28).text("Dense, High Migration");

        svgArea2.append("path").datum(G_data).attr("fill", "red").attr("stroke", "white").style("opacity", 0.7).attr("stroke-width", 1.5).attr("d", d3.area()
            .x(function(d) { return x(d.date) })
            .y0(y2(0))
            .y1(function(d) { return y2(+d.C_INF_1) }))
            .attr("class","group_2")
        svgArea2.append('text').attr('class', 'title').attr('x', 30).attr('y', 28).text("Deprived, Poor health");

        svgArea3.append("path").datum(G_data).attr("fill", "red").attr("stroke", "white").style("opacity", 0.7).attr("stroke-width", 1.5).attr("d", d3.area()
            .x(function(d) { return x(d.date) })
            .y0(y3(0))
            .y1(function(d) { return y3(+d.C_INF_2) }))
            .attr("class","group_3")
        svgArea3.append('text').attr('class', 'title').attr('x', 30).attr('y', 28).text("Mixed");

        svgArea4.append("path").datum(G_data).attr("fill", "red").attr("stroke", "white").style("opacity", 0.7).attr("stroke-width", 1.5).attr("d", d3.area()
            .x(function(d) { return x(d.date) })
            .y0(y4(0))
            .y1(function(d) { return y4(+d.C_INF_3) }))
            .attr("class","group_4")
        svgArea4.append('text').attr('class', 'title').attr('x', 30).attr('y', 28).text("Majorly Immigrant");
       }

       else if(Map_Type=="SDOH")
       {

       MAX = Math.max(
        d3.max(G_data, function(d) { return +d.C_SDOH_0; }),
        d3.max(G_data, function(d) { return +d.C_SDOH_1; }),
        d3.max(G_data, function(d) { return +d.C_SDOH_2; }), 
        d3.max(G_data, function(d) { return +d.C_SDOH_3; }))
       
        var x = d3.scaleTime().range([0, G_width ]).domain(d3.extent(G_data, function(d) {return d.date;}));
 
        y1 = d3.scaleLinear().domain([0, MAX+100]).range([ G_height, 0 ])
        svgArea1.append("g").attr("class","G_Y_1").call(d3.axisLeft(y1));

        y2 = d3.scaleLinear().domain([0,MAX+100]).range([ G_height, 0 ]);
        svgArea2.append("g").attr("class","G_Y_2").call(d3.axisLeft(y2));

        y3 = d3.scaleLinear().domain([0,MAX+100]).range([ G_height, 0 ]);
        svgArea3.append("g").attr("class","G_Y_3").call(d3.axisLeft(y3));

        y4 = d3.scaleLinear().domain([0,MAX+100]).range([ G_height, 0 ]);
        svgArea4.append("g").attr("class","G_Y_4").call(d3.axisLeft(y4));        

        svgArea1.append("g")
        .attr("transform", "translate(0," + G_height + ")")
        .attr("class", "Time_Axis_1")
        .call(d3.axisBottom(x));
        // svgArea1.append('text').attr('class', 'axis-label').attr('y', -37).attr('x', -G_height / 1.8)
        // .attr('fill', 'black').attr('transform', `rotate(-90)`).attr('text-anchor', 'middle').text("Cumulative incidence rate");

        svgArea2.append("g")
        .attr("transform", "translate(0," + G_height + ")")
        .attr("class", "Time_Axis_2")
        .call(d3.axisBottom(x));
        // svgArea2.append('text').attr('class', 'axis-label').attr('y', -37).attr('x', -G_height / 1.8)
        // .attr('fill', 'black').attr('transform', `rotate(-90)`).attr('text-anchor', 'middle').text("Cumulative incidence rate");

        svgArea3.append("g")
        .attr("transform", "translate(0," + G_height + ")")
        .attr("class", "Time_Axis_3")
        .call(d3.axisBottom(x));
        // svgArea3.append('text').attr('class', 'axis-label').attr('y', -37).attr('x', -G_height / 1.8)
        // .attr('fill', 'black').attr('transform', `rotate(-90)`).attr('text-anchor', 'middle').text("Cumulative incidence rate");

        svgArea4.append("g")
        .attr("transform", "translate(0," + G_height + ")")
        .attr("class", "Time_Axis_4")
        .call(d3.axisBottom(x));
        // svgArea4.append('text').attr('class', 'axis-label').attr('y', -37).attr('x', -G_height / 1.8)
        // .attr('fill', 'black').attr('transform', `rotate(-90)`).attr('text-anchor', 'middle').text("Cumulative incidence rate");

        svgArea1.append("path").datum(G_data).attr("fill", "red").attr("stroke", "white").style("opacity", 0.7).attr("stroke-width", 1.5)
        .attr("d", d3.area()
          .x(function(d) { return x(d.date) })
          .y0(y1(0))
          .y1(function(d) { return y1(+d.C_SDOH_0) }))
         .attr("class","group_1") 
        svgArea1.append('text').attr('class', 'title').attr('x', 30).attr('y', 28).text("Majorly Old/Whites/Disabled");
        
        svgArea2.append("path").datum(G_data).attr("fill", "red").attr("stroke", "white").style("opacity", 0.7).attr("stroke-width", 1.5).attr("d", d3.area()
            .x(function(d) { return x(d.date) })
            .y0(y2(0))
            .y1(function(d) { return y2(+d.C_SDOH_1) }))
            .attr("class","group_2")
        svgArea2.append('text').attr('class', 'title').attr('x', 30).attr('y', 28).text("Dense/Immigrant/Deprived");
        
        svgArea3.append("path").datum(G_data).attr("fill", "red").attr("stroke", "white").style("opacity", 0.7).attr("stroke-width", 1.5)
          .attr("d", d3.area()
            .x(function(d) { return x(d.date) })
            .y0(y3(0))
            .y1(function(d) { return y3(+d.C_SDOH_2) }))
            .attr("class","group_3")
        svgArea3.append('text').attr('class', 'title').attr('x', 30).attr('y', 28).text("Affluent");

        svgArea4.append("path").datum(G_data).attr("fill", "red").attr("stroke", "white").style("opacity", 0.7).attr("stroke-width", 1.5)
          .attr("d", d3.area()
            .x(function(d) { return x(d.date) })
            .y0(y4(0))
            .y1(function(d) { return y4(+d.C_SDOH_3) }))
            .attr("class","group_4")
        svgArea4.append('text').attr('class', 'title').attr('x', 30).attr('y', 28).text("Deprived Minority");
       }
} 

function Load_Deaths()
{
   Clear();

    if(Map_Type=="INF")
    { 
        MAX=Math.max(d3.max(G_data, function(d) { return +d.D_INF_0; }),
        d3.max(G_data, function(d) { return +d.D_INF_1; }),
        d3.max(G_data, function(d) { return +d.D_INF_2; }),
        d3.max(G_data, function(d) { return +d.D_INF_3; }))
    
    var x = d3.scaleTime().range([0, G_width ]).domain(d3.extent(G_data, function(d) {return d.date;}));

    y1 = d3.scaleLinear().domain([0, 90]).range([ G_height, 0 ])  
    svgArea1.append("g").attr("class","G_Y_1").call(d3.axisLeft(y1));

    y2 = d3.scaleLinear().domain([0,90]).range([ G_height, 0 ]);
    svgArea2.append("g").attr("class","G_Y_2").call(d3.axisLeft(y2));

    y3 = d3.scaleLinear().domain([0,90]).range([ G_height, 0 ]);
    svgArea3.append("g").attr("class","G_Y_3").call(d3.axisLeft(y3));

    y4 = d3.scaleLinear().domain([0,90]).range([ G_height, 0 ]);
    svgArea4.append("g").attr("class","G_Y_4").call(d3.axisLeft(y4));        

    svgArea1.append("g")
        .attr("transform", "translate(0," + G_height + ")")
        .attr("class", "Time_Axis_1")
        .call(d3.axisBottom(x));
    // svgArea1.append('text').attr('class', 'axis-label').attr('y', -37).attr('x', -G_height / 1.8)
    //     .attr('fill', 'black').attr('transform', `rotate(-90)`).attr('text-anchor', 'middle').text("Cumulative death rate");

    svgArea2.append("g")
        .attr("transform", "translate(0," + G_height + ")")
        .attr("class", "Time_Axis_2")
        .call(d3.axisBottom(x));
    // svgArea2.append('text').attr('class', 'axis-label').attr('y', -37).attr('x', -G_height / 1.8)
    //     .attr('fill', 'black').attr('transform', `rotate(-90)`).attr('text-anchor', 'middle').text("Cumulative death rate");

    svgArea3.append("g")
        .attr("transform", "translate(0," + G_height + ")")
        .attr("class", "Time_Axis_3")
        .call(d3.axisBottom(x));
    // svgArea3.append('text').attr('class', 'axis-label').attr('y', -37).attr('x', -G_height / 1.8)
    //     .attr('fill', 'black').attr('transform', `rotate(-90)`).attr('text-anchor', 'middle').text("Cumulative death rate");

    svgArea4.append("g")
        .attr("transform", "translate(0," + G_height + ")")
        .attr("class", "Time_Axis_4")
        .call(d3.axisBottom(x));
    // svgArea4.append('text').attr('class', 'axis-label').attr('y', -37).attr('x', -G_height / 1.8)
    //     .attr('fill', 'black').attr('transform', `rotate(-90)`).attr('text-anchor', 'middle').text("Cumulative death rate");

svgArea1.append("path").datum(G_data).attr("fill", "red").attr("stroke", "white").style("opacity", 0.7).attr("stroke-width", 1.5).attr("d", d3.area()
        .x(function(d) { return x(d.date) })
        .y0(y1(0))
        .y1(function(d) { return y1(+d.D_INF_0) }))
        .attr("class","group_1") 
svgArea1.append('text').attr('class', 'title').attr('x', 30).attr('y', 28).text("Dense, High Migration");

svgArea2.append("path").datum(G_data).attr("fill", "red").attr("stroke", "white").style("opacity", 0.7).attr("stroke-width", 1.5).attr("d", d3.area()
          .x(function(d) { return x(d.date) })
          .y0(y2(0))
          .y1(function(d) { return y2(+d.D_INF_1) }))
          .attr("class","group_2")
svgArea2.append('text').attr('class', 'title').attr('x', 30).attr('y', 28).text("Deprived, Poor health");

svgArea3.append("path").datum(G_data).attr("fill", "red").attr("stroke", "white").style("opacity", 0.7).attr("stroke-width", 1.5).attr("d", d3.area()
          .x(function(d) { return x(d.date) })
          .y0(y3(0))
          .y1(function(d) { return y3(+d.D_INF_2) }))
          .attr("class","group_3")
svgArea3.append('text').attr('class', 'title').attr('x', 30).attr('y', 28).text("Mixed");

svgArea4.append("path").datum(G_data).attr("fill", "red").attr("stroke", "white").style("opacity", 0.7).attr("stroke-width", 1.5).attr("d", d3.area()
          .x(function(d) { return x(d.date) })
          .y0(y4(0))
          .y1(function(d) { return y4(+d.D_INF_3) }))
          .attr("class","group_4")
svgArea4.append('text').attr('class', 'title').attr('x', 30).attr('y', 28).text("Majorly Immigrant");
        }

else if(Map_Type=="SDOH")
    {
        MAX=Math.max(d3.max(G_data, function(d) { return +d.D_SDOH_0; }),
        d3.max(G_data, function(d) { return +d.D_SDOH_1; }),
        d3.max(G_data, function(d) { return +d.D_SDOH_2; }), 
        d3.max(G_data, function(d) { return +d.D_SDOH_3; }))

    var x = d3.scaleTime().range([0, G_width ]).domain(d3.extent(G_data, function(d) {return d.date;}));

     y1 = d3.scaleLinear().domain([0, MAX+20]).range([ G_height, 0 ])   
     svgArea1.append("g").attr("class","G_Y_1").call(d3.axisLeft(y1));

    y2 = d3.scaleLinear().domain([0,MAX+20]).range([ G_height, 0 ]);
    svgArea2.append("g").attr("class","G_Y_2").call(d3.axisLeft(y2));

    y3 = d3.scaleLinear().domain([0,MAX+20]).range([ G_height, 0 ]);
    svgArea3.append("g").attr("class","G_Y_3").call(d3.axisLeft(y3));

    y4 = d3.scaleLinear().domain([0,MAX+20]).range([ G_height, 0 ]);
    svgArea4.append("g").attr("class","G_Y_4").call(d3.axisLeft(y4));        

    svgArea1.append("g")
        .attr("transform", "translate(0," + G_height + ")")
        .attr("class", "Time_Axis_1")
        .call(d3.axisBottom(x));
    // svgArea1.append('text').attr('class', 'axis-label').attr('y', -37).attr('x', -G_height / 1.8)
    //     .attr('fill', 'black').attr('transform', `rotate(-90)`).attr('text-anchor', 'middle').text("Cumulative death rate");

    svgArea2.append("g")
        .attr("transform", "translate(0," + G_height + ")")
        .attr("class", "Time_Axis_2")
        .call(d3.axisBottom(x));
    // svgArea2.append('text').attr('class', 'axis-label').attr('y', -37).attr('x', -G_height / 1.8)
    //     .attr('fill', 'black').attr('transform', `rotate(-90)`).attr('text-anchor', 'middle').text("Cumulative death rate");

    svgArea3.append("g")
        .attr("transform", "translate(0," + G_height + ")")
        .attr("class", "Time_Axis_3")
        .call(d3.axisBottom(x));
    // svgArea3.append('text').attr('class', 'axis-label').attr('y', -37).attr('x', -G_height / 1.8)
    //     .attr('fill', 'black').attr('transform', `rotate(-90)`).attr('text-anchor', 'middle').text("Cumulative death rate");

    svgArea4.append("g")
        .attr("transform", "translate(0," + G_height + ")")
        .attr("class", "Time_Axis_4")
        .call(d3.axisBottom(x));
    // svgArea4.append('text').attr('class', 'axis-label').attr('y', -37).attr('x', -G_height / 1.8)
    //     .attr('fill', 'black').attr('transform', `rotate(-90)`).attr('text-anchor', 'middle').text("Cumulative death rate");

    svgArea1.append("path").datum(G_data).attr("fill", "red").attr("stroke", "white").style("opacity", 0.7).attr("stroke-width", 1.5).attr("d", d3.area()
        .x(function(d) { return x(d.date) })
        .y0(y1(0))
        .y1(function(d) { return y1(+d.D_SDOH_0) }))
        .attr("class","group_1") 
    svgArea1.append('text').attr('class', 'title').attr('x', 30).attr('y', 28).text("Majorly Old/Whites/Disabled");
        
    svgArea2.append("path").datum(G_data).attr("fill", "red").attr("stroke", "white").style("opacity", 0.7).attr("stroke-width", 1.5).attr("d", d3.area()
          .x(function(d) { return x(d.date) })
          .y0(y2(0))
          .y1(function(d) { return y2(+d.D_SDOH_1) }))
          .attr("class","group_2")
    svgArea2.append('text').attr('class', 'title').attr('x', 30).attr('y', 28).text("Dense/Immigrant/Deprived");
        
    svgArea3.append("path").datum(G_data).attr("fill", "red").attr("stroke", "white").style("opacity", 0.7).attr("stroke-width", 1.5).attr("d", d3.area()
          .x(function(d) { return x(d.date) })
          .y0(y3(0))
          .y1(function(d) { return y3(+d.D_SDOH_2) }))
          .attr("class","group_3")
    svgArea3.append('text').attr('class', 'title').attr('x', 30).attr('y', 28).text("Affluent");

    svgArea4.append("path").datum(G_data).attr("fill", "red").attr("stroke", "white").style("opacity", 0.7).attr("stroke-width", 1.5).attr("d", d3.area()
          .x(function(d) { return x(d.date) })
          .y0(y4(0))
          .y1(function(d) { return y4(+d.D_SDOH_3) }))
          .attr("class","group_4")
    svgArea4.append('text').attr('class', 'title').attr('x', 30).attr('y', 28).text("Deprived Minority");
    }

}

function Load_Death_Circles()
{
    // d3.select("#slider").property("value",0)
    svgA_g.selectAll(".country-circle").remove()

date_c = new Date;
d = new Date(date_c.setDate(date_c.getDate()));
dd = new Date(d.setDate(date_c.getDate()));
d = dd.getDate()-2;
m = dd.getMonth()+1;
y = dd.getYear();
graph_date = m+"/" + d +"/"+(y-100)

S_graph_date = "20"+(y-100)+"-" + m +"-"+("0" + (d + 1)).slice(-2)

// counties.forEach(d => { Object.assign(d.properties, Conf_Deaths[+d.id]);});

    // featuresWithCases = counties
    //     .filter(d => d.properties[graph_date])
    //     .map(d => {
    //         d.properties[graph_date] = +d.properties[graph_date];
    //       return d;
    //     });

        radiusValue= d => parseInt(d.properties[graph_date])
        current_cases =radiusValue;
        radiusScale.domain([0, d3.max(counties, radiusValue)])
        .range([0, 20]);
        
        svgA_g.selectAll('circle')
        .data(counties)
        .enter()
        .append('circle')
        .attr('class', 'country-circle')
        .attr('cx', d => d.properties.projected[0])
        .attr('cy', d => d.properties.projected[1])
        .attr('r', d => radiusScale(radiusValue(d)))
        .on('mouseover', function(d)
  {
      d3.select(this).classed("selected", true)
      countyInfo = d3.select("#Covid_map").append("div").attr("class", "circle_content").style("opacity", 0); 
      d3.select(this).style("stroke-width", 1).transition().duration(500);
      countyInfo.style("opacity", 1.1);
      if(Map_Type==="SDOH")
      {
        countyInfo.html("County : "+ (d.properties.Combined_Key).slice(0, -4)+ "<br/>" + "Deaths : "+radiusValue(d)+ "<br/>"+d.properties.cluster_sdoh_name)
        .style("left", (d3.event.pageX - 350) + "px")
        .style("top", (d3.event.pageY - 300) + "px");
      }
      else
      {
        countyInfo.html("County : "+ (d.properties.Combined_Key).slice(0, -4)+ "<br/>" +"Deaths : "+radiusValue(d)+ "<br/>"+d.properties.cluster_inf_name)
        .style("left", (d3.event.pageX - 350) + "px")
        .style("top", (d3.event.pageY - 300) + "px");
      }
      
  })
  .on('mouseout', function(d){d3.select(this).classed("selected", false).style("stroke-width", '0.2px').transition().duration(100);
  countyInfo.remove();})

//   Load_Deaths()
}

function Load_Cases_Circles()
{
    svgA_g.selectAll(".country-circle").remove()
    // d3.select("#slider").property("value",0)
    
date_c = new Date;
d = new Date(date_c.setDate(date_c.getDate()));
dd = new Date(d.setDate(date_c.getDate()));
d = dd.getDate()-1;
m = dd.getMonth()+1;
y = dd.getYear();
graph_date = m+"/" + d +"/"+(y-100)
S_graph_date = "20"+(y-100)+"-" + m +"-"+("0" + (d + 1)).slice(-2)

    // counties.forEach(d => { Object.assign(d.properties, Conf_Cases[+d.id]);});

    // counties.forEach(d => { if(projection(d3.geoCentroid(d)) !== null)
    //     {d.properties.projected = projection(d3.geoCentroid(d));}
    //     else{d.properties.projected = 0,0}
    // });

    // featuresWithCases = counties
    //     .filter(d => d.properties[graph_date])
    //     .map(d => {
    //       d.properties[graph_date] = +d.properties[graph_date];
    //       return d;
    //     });

        radiusValue= d => parseInt(d.properties[graph_date])
        current_cases =radiusValue;
        radiusScale.domain([0, d3.max(counties, radiusValue)])
        .range([0, 20]);

        svgA_g.selectAll('circle')
        .data(counties)
        .enter()
        .append('circle')
        .attr('class', 'country-circle')
        .attr('cx', d => d.properties.projected[0])
        .attr('cy', d => d.properties.projected[1])
        .attr('r', d => radiusScale(radiusValue(d)))
        // .on('click', d => Generate_CovidGraph_R(d.properties.NAME, d.properties.FIPS, current_Date))
        .on('mouseover', function(d)
  {
      d3.select(this).classed("selected", true)
      countyInfo = d3.select("#Covid_map").append("div").attr("class", "circle_content").style("opacity", 0); 
      d3.select(this).style("stroke-width", 1).transition().duration(500);
      countyInfo.style("opacity", 1.1);
      if(Map_Type=="SDOH")
      {
        countyInfo.html("County : "+ (d.properties.Combined_Key).slice(0, -4)+ "<br/>" + "Cases : "+radiusValue(d)+ "<br/>"+d.properties.cluster_sdoh_name)
        .style("left", (d3.event.pageX - 350) + "px")
        .style("top", (d3.event.pageY - 300) + "px");
      }
      else
      {
        countyInfo.html("County : "+ (d.properties.Combined_Key).slice(0, -4)+ "<br/>" +"Cases : "+radiusValue(d)+ "<br/>"+d.properties.cluster_inf_name)
        .style("left", (d3.event.pageX - 350) + "px")
        .style("top", (d3.event.pageY - 300) + "px");
      }
  })
  .on('mouseout', function(d){d3.select(this).classed("selected", false).style("stroke-width", '0.2px').transition().duration(100);
  countyInfo.remove();})

// Load_Cases()
}

function stateZoom(d) {
    var zoomLevel ,x, y;
 
    if(d && centered !== d)
    {
        var centroid = path.centroid(d);
        x = centroid[0];
        y = centroid[1];
        zoomLevel = zoomSettings.zoomLevel;
        centered = d;
    }
    else{
        x = width/2;
        y= height/2;
        zoomLevel=1;
        centered=null;
    }
 svgA_g.transition()
 .duration(zoomSettings.duration)
 .ease(zoomSettings.ease)
 .attr('transform','translate(' + width/2 + ',' + height/2 + ')scale('+ zoomLevel + ')translate('+ -x +','+ -y + ')');
 }

 var zoomSettings = {
    duration: 1500,
    ease: d3.easeCubicOut,
    zoomLevel: 4
};

d3.select("#slider").on("input", render_cases);
function render_cases()
{
    const range = document.getElementById('slider');
    rangeV = document.getElementById('rangeV');
    slider_val =parseInt(d3.select("#slider").property("value"));
        if(FlagType==0)
        {  
            date = new Date("Feb 1,2020");
        }
        else if(FlagType==1)
        {
            date = new Date("March 1,2020");
        }
        dat =new Date(date.setDate(date.getDate()));
        dat2 =new Date(dat.setDate(date.getDate()+slider_val));
        day = dat2.getDate();
        month = dat2.getMonth()+1;
        year = dat2.getYear();
        render_date = month +"/"+ day +"/" + (year-100)

        setValue = ()=>{
        let newValue = Number( (range.value - range.min) * 100 / (range.max - range.min) ), newPosition = 15 - (newValue * 0.3);
        rangeV.innerHTML = `<span>${render_date}</span>`;
        rangeV.style.left = `calc(${newValue}% + (${newPosition}px))`;
            };
        document.addEventListener("DOMContentLoaded", setValue);
        range.addEventListener('input', setValue);
        svgA_g.selectAll(".country-circle").remove()
        // document.getElementById('date_Slider').innerHTML =  render_date
        render_circles(render_date)
}

function  render_circles(current_Date)
{
if(FlagType==0)
{        
    radiusValue= d => parseInt(d.properties[current_Date])
    current_cases =radiusValue;
    radiusScale.domain([0, d3.max(counties, radiusValue)])
    .range([0, 20]);

svgA_g.selectAll('circle')
  .data(counties)
  .enter()
  .append('circle')
  .attr('class', 'country-circle')
  .attr('cx', d => d.properties.projected[0])
  .attr('cy', d => d.properties.projected[1])
  .attr('r', d => radiusScale(radiusValue(d)))
  //.on('click', d => Generate_CovidGraph_R(d.properties.NAME, d.properties.FIPS, current_Date))
  .on('mouseover', function(d)
{
d3.select(this).classed("selected", true)
countyInfo = d3.select("#Covid_map").append("div").attr("class", "circle_content").style("opacity", 0); 
d3.select(this).style("stroke-width", 1).transition().duration(500);
countyInfo.style("opacity", 1.1);
countyInfo.html("Date :"+ current_Date +"<br/>"+"County : "+ (d.properties.Combined_Key).slice(0, -4)+ "<br/>" + "Cases : "+radiusValue(d)+ "<br/>"+d.properties.cluster_sdoh_name)
// countyInfo.html("Date :"+ current_Date +"<br/>"+"Cases per 100,000 Population : "+radiusValue(d)+ "<br/>" +"Region : "+d.properties.cluster_sdoh_name)
.style("left", (d3.event.pageX - 350) + "px")
.style("top", (d3.event.pageY - 300) + "px");
})
.on('mouseout', function(d){d3.select(this).classed("selected", false).style("stroke-width", '0.2px').transition().duration(100);
countyInfo.remove();})

}
else if(FlagType==1)
{

    radiusValue= d => parseInt(d.properties[current_Date])
    current_cases =radiusValue;
    radiusScale.domain([0, d3.max(counties, radiusValue)])
    .range([0, 20]);

svgA_g.selectAll('circle')
  .data(counties)
  .enter()
  .append('circle')
  .attr('class', 'country-circle')
  .attr('cx', d => d.properties.projected[0])
  .attr('cy', d => d.properties.projected[1])
  .attr('r', d => radiusScale(radiusValue(d)))
  //.on('click', d => Generate_CovidGraph_R(d.properties.NAME, d.properties.FIPS, current_Date))
  .on('mouseover', function(d)
{
d3.select(this).classed("selected", true)
countyInfo = d3.select("#Covid_map").append("div").attr("class", "circle_content").style("opacity", 0); 
d3.select(this).style("stroke-width", 1).transition().duration(500);
countyInfo.style("opacity", 1.1);
countyInfo.html("Date :"+ current_Date +"<br/>"+"County : "+ (d.properties.Combined_Key).slice(0, -4)+ "<br/>"+"Deaths : "+radiusValue(d)+ "<br/>" +"Region : "+d.properties.cluster_inf_name)
.style("left", (d3.event.pageX - 350) + "px")
.style("top", (d3.event.pageY - 300) + "px");
})
.on('mouseout', function(d){d3.select(this).classed("selected", false).style("stroke-width", '0.2px').transition().duration(100);
countyInfo.remove();})
}
//svgA_g.selectAll(".country-circle").remove()

}

// function play() 
// {	
// 	if (d3.select("button").property("value") == "Play") {
// 		d3.select("button").text("Pause")
//         d3.select("button").property("value", "Pause")
//         playing = true
//         step()
// 	}
// 	else 
// 	{
// 		d3.select("button").text("Play")
//         d3.select("button").property("value", "Play")
//         playing = false
// 	}
// }

// function step() 
// {
//     slider_val = (slider_val < 30) ? slider_val + 1 : 0
    
// 	if(FlagType==0)
// 	{
//         svgA_g.selectAll(".country-circle").remove()
// 		Populate_cases(slider_val)
// 	}
// 	else if(Flag==1)
// 	{
//         svgA_g.selectAll(".country-circle").remove()
// 		Populate_deaths(slider_val)
// 	}
// }
//  function Populate_cases(slider_val)
//  {

//         var date = new Date("Feb 1,2020");
//         dat =new Date(date.setDate(date.getDate()));
//         dat2 =new Date(dat.setDate(date.getDate()+slider_val));
//         var day = dat2.getDate();
//         var month = dat2.getMonth()+1;
//         if(month<10)
//         {
//             var Month = "0"+month 
//         }
//         if(day<10)
//         {
//             var Day = "0"+day;
//         }
//         else
//         {
//             Day = day;
//         }
//         var year = dat2.getFullYear();
//         render_date = year +"-"+ Month +"-" +Day

//         // counties.forEach(d => {
//         //     d.properties.projected = projection(d3.geoCentroid(d));
//         // });
    
//         var WithCases = counties
//         .filter(d => d.properties[render_date])
//         .map(d => {
//           d.properties[render_date] = +d.properties[render_date];
//           return d;
//         });
//         radiusValue= d => d.properties[render_date]
//         current_cases =radiusValue;
//         radiusScale.domain([0, d3.max(counties, radiusValue)])
//         .range([0, 10]);

// svgA_g.selectAll('circle')
//       .data(WithCases)
//       .enter()
//       .append('circle')
//       .attr('class', 'country-circle')
//       .attr('cx', d => d.properties.projected[0])
//       .attr('cy', d => d.properties.projected[1])
//       .attr('r', d => radiusScale(radiusValue(d)))
//     //svgA_g.selectAll(".country-circle").remove()
//     document.getElementById('date').innerHTML =  render_date
//     if (playing)
//         setTimeout(step(), 100)
//  }


//  function Populate_deaths(slider_val)
//  {
//         var date = new Date("March 1,2020");
//         dat =new Date(date.setDate(date.getDate()));
//         dat2 =new Date(dat.setDate(date.getDate()+slider_val));
//         var day = dat2.getDate();
//         var month = dat2.getMonth()+1;
//         var year = dat2.getYear();
//         render_date = month +"/" +day+"/"+(year-100)
    
//         // counties.forEach(d => {
//         //     d.properties.projected = projection(d3.geoCentroid(d));
//         // });
    
//         var Withdeaths = counties
//         .filter(d => d.properties[render_date])
//         .map(d => {
//           d.properties[render_date] = +d.properties[render_date];
//           return d;
//         });
//         radiusValue= d => d.properties[render_date]
//         current_cases =radiusValue;
//         radiusScale.domain([0, d3.max(counties, radiusValue)])
//         .range([0, 10]);
    
//     svgA_g.selectAll('circle')
//       .data(Withdeaths)
//       .enter()
//       .append('circle')
//       .attr('class', 'country-circle')
//       .attr('cx', d => d.properties.projected[0])
//       .attr('cy', d => d.properties.projected[1])
//       .attr('r', d => radiusScale(radiusValue(d)))

//     document.getElementById('date').innerHTML =  render_date
//     if (playing)
//         setTimeout(step(), 100)
//  }