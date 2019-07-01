var thisWeek;
var thisYear;

function prepare2YearPeriods(pe){
	pe = String(pe);
	thisYear = Number(pe.split("W")[0]);
	thisWeek = Number(pe.split("W")[1]);
	var lastYear = thisYear-1;
	var futureWeeks = 53;
	var thisYearPeriods = [];
	var lastYearPeriods = [];
	var periods = "";
	for (var i=1;i<=futureWeeks;i++){
		periods += lastYear+"W"+i+";";
		if(i<=thisWeek){
			periods += thisYear+"W"+i+";";
		}
	}
	periods = periods.substr(0,periods.length-1);
	return periods;
}

function prepareUrl(dx,periods,ouid){
	var finalURL = "../api/analytics.json?";
	finalURL += "dimension=dx:"+dx;
	finalURL += "&dimension=pe:"+periods;
	finalURL += "&filter=ou:"+ouid;
	finalURL += "&displayProperty=NAME&outputIdScheme=NAME";
	return finalURL;
}
	
function prepareDataForGoogleChart(data){
	var arrayForChart = [];
	var width = data.width;
	var height = data.height;
	var rows = data.rows;
	var periodsCount = data.metaData.pe.length;
	var yearArray = [];
	var weekArray = [];
	var headerArray = [];
	headerArray.push("Week");
			
	// Prepare the arrays for weeks and years and prepare header array
	$.each(data.metaData.pe, function(i, value ) {
		var year = value.split("W")[0];
		if($.inArray(year, yearArray) == -1){
			yearArray.push(year);
			headerArray.push(year);
			headerArray.push({role:'annotation'});
		}
		var week = value.split("W")[1];
		if($.inArray(week, weekArray) == -1){
			weekArray.push(week);
		}
	});
	arrayForChart.push(headerArray);
	
	// Prepare the data
	$.each(weekArray, function(i, week ) {
		var valueToPush = 0;
		var rowArray = [];
		var valueFound = false;
		rowArray.push("W"+week);
		lastYear = thisYear-1;

		$.each(yearArray, function(j,year){
			var yearWeek = year+"W"+week;
			$.each(data.rows,function(k,data){
				if(data[1] == yearWeek){
					if(Number(year) == thisYear){
						if(Number(week) > thisWeek){
							valueToPush = null;
						}else{
							valueToPush = Number(data[2]);
						}
					}else{
						valueToPush = Number(data[2]);
					}
					return false;
				}else{
					valueToPush = 0;		
				}
			});
			rowArray.push(valueToPush,valueToPush);
		});
		arrayForChart.push(rowArray);
	});
	return arrayForChart;
}
	
function setGoogleChartOptions(title){
	var options = {
		title : title,
		vAxis: {title: 'Number of Cases',textStyle:{fontSize:9}},
		hAxis: {title: 'Weeks',slantedText:true, slantedTextAngle:30, textStyle:{fontSize:9}},
		pointSize: 5,
		pointShape: 'circle',
		legend: { position: 'top' },
		//crosshair: { trigger: 'both' },
		//width: '100%',
		//height: '100%',
		chartArea: {'width': '90%', 'height': '80%'},
		series: {1: {type: 'bars'}},
		annotations: {textStyle: {fontSize: 9}},
		displayAnnotations: true
	};
	return options;
}
	
function loadChartEditor(data,options,targetContainerId){
	var chartEditor = null;
		
	// Create the chart to edit.
	var wrapper = new google.visualization.ChartWrapper({
		chartType: 'AreaChart',
		dataTable: data,
		options: options,
		containerId: 'chart_editor'
	});
	wrapper.draw();

	chartEditor = new google.visualization.ChartEditor();
	google.visualization.events.addListener(chartEditor, 'ok', function(){
		chartEditor.getChartWrapper().draw(document.getElementById(targetContainerId));		
	});
	chartEditor.openDialog(wrapper, {});
}
		
function createChart(deId, periods, ouid,title,containerId){
	var dataUrl = prepareUrl(deId, periods, ouid);
	jQuery.getJSON(dataUrl, function(data) {
		var dataArray = prepareDataForGoogleChart(data);	
		var data = google.visualization.arrayToDataTable(dataArray);
		var options = setGoogleChartOptions(title);
			
		// Create the chart.
		var wrapper = new google.visualization.ChartWrapper({
			chartType: 'AreaChart',
			dataTable: data,
			options: options,
			containerId: containerId
		});
		wrapper.draw();
			
		$("#"+containerId).dblclick(function(){
			loadChartEditor(data,options,$(this).attr("id"));
		});
	});
}

function loadChartImage(svg){
	svg.toImage();
}

function DataTable(jsonData){
	var width = jsonData.width;
	var height = jsonData.height;
	var headers = jsonData.headers;
	var rows = jsonData.rows;
	var diseaseArray = [];
	var html = "<table class = 'listTable gridTable' cellpadding='4' style='border-radius:5px;'><thead><tr>";
	var ouCount = 0;
	
	// create the first row of header
	html += "<th rowspan='2'  style='text-align:center;'>Sentinel Site</th>";
	$.each(headers, function(i, value ) {
		if(value.meta == false){
			var diseaseName = value.name.split("(")[0];
			if($.inArray(diseaseName, diseaseArray) == -1){
				diseaseArray.push(diseaseName);
				html += "<th colspan='2'  style='text-align:center;'>"+diseaseName+"</th>";
			}
		}
	});
	html += "</tr>";
	// Create the 2nd row of the header
	html += "<tr>";
	$.each(diseaseArray, function(i, value ) {
		html += "<th  style='text-align:center;'>Cases</th><th  style='text-align:center;'>Deaths</th>";
	});
	html += "</tr></thead>";
	
	// create the data rows
	$.each(rows, function(i, valueArray ) {
		if((i % 2)>0){
			html += "<tr class='listAlternateRow'>";
		}else{
			html += "<tr>";
		}
		
		$.each(valueArray, function(j, value ) {
			// this is Sentinel Site Name
			if(j == 1){
				html += "<td>"+value+"</td>";
				ouCount++;
			}
			// This is the data value
			if(j > 6){
				if(j % 2 == 0){
					if(Math.round(value) > 0){
						html += "<td style='font-weight:bold;color:red'>"+Math.round(value)+"</td>";
					}else{
						html += "<td>"+Math.round(value)+"</td>";
					}
				}else{
					html += "<td>"+Math.round(value)+"</td>";
				}
			}
		});
		html += "</tr>";
	});
	
	html += "</table><div class='reporting-site-count'>Total Sites reported:"+ouCount+"</div>";
	if(rows.length == 0){
		html = "There are no cases/deaths reported.";
	}
	return html;
}

function prepareIndicatorTable(jsonData){
	var width = jsonData.width;
	var height = jsonData.height;
	var headers = jsonData.headers;
	var rows = jsonData.rows;
	var diseaseArray = [];
	var hfArray = [];
	var html = "<table class = 'listTable gridTable' cellpadding='4' style='border-radius:5px;'><thead><tr>";
	var ouCount = 0;
	
	$.each(rows, function(i, valueArray ) {
		var diseaseName = valueArray[0].split("(")[0];
		var hf = valueArray[1];
		if($.inArray(hf, hfArray) == -1){
			hfArray.push(hf);
		}
		if($.inArray(diseaseName, diseaseArray) == -1){
			diseaseArray.push(diseaseName);
		}
	});
	
	// create the first row of header
	html += "<th rowspan='2' style='text-align:center;'>Health Facility</th>";
	$.each(diseaseArray, function(i, disease){
		html += "<th colspan='2' style='text-align:center;'>"+disease+"</th>";
	});
	html += "<tr>";
	// create the 2nd row of the header
	$.each(diseaseArray, function(i, disease){
		html += "<th  style='text-align:center;'>Cases</th><th  style='text-align:center;'>Deaths</th>";
	});
	html += "</tr></thead><tbody>";
	
	// create the data rows
	$.each(hfArray, function(i, hf ) {
		ouCount++;
		var dataRow = "";
		var rowWithDeath = false;
		$.each(diseaseArray, function(j, disease ) {
			//["AGE (Total Cases)","Dhulikhel Hospital, Kavre","0.0"]
			var caseCount = 0;
			var deathCount = 0;
			$.each(rows, function(k, valueArray ) {
				var caseDeath = valueArray[0].split("(")[1];
				var rowDisease = valueArray[0].split("(")[0];
				if(valueArray[1] == hf && rowDisease == disease){
					if(caseDeath == "Total Cases)"){
						caseCount += Number(valueArray[2]);
					}else{
						deathCount += Number(valueArray[2]);
					}
				}
			});
			if(deathCount > 0){
				rowWithDeath = true;
				dataRow += "<td>"+caseCount+"</td><td style='font-weight:bold;color:red'>"+deathCount+"</td>";
			}else{
				//rowWithDeath = false;
				dataRow += "<td>"+caseCount+"</td><td>"+deathCount+"</td>";
			}
		});
		if(rowWithDeath){
			html += "<tr class='listAlternateRow rowWithDeath'><td>"+hf+"</td>"+dataRow;
		}else{
			if((i % 2)>0){
				html += "<tr class='listAlternateRow'><td>"+hf+"</td>"+dataRow;
			}else{
				html += "<tr><td>"+hf+"</td>"+dataRow;
			}
		}
		html += "</tr>";
	});
	html += "</table><div class='reporting-site-count'>Total Sites reported : "+ouCount+"</div>";
	if(rows.length == 0){
		html = "There are no cases/deaths reported.";
	}
	return html;
}

function prepareEventTable(jsonData){
	var width = jsonData.width;
	var height = jsonData.height;
	var headers = jsonData.headers;
	var rows = jsonData.rows;
	var diseaseArray = [];
	var districtArray = [];
	var html = "<table class = 'listTable gridTable' cellpadding='4' style='border-radius:5px;'><thead><tr>";

	$.each(rows, function(i, valueArray ) {
		var district = valueArray[8];
		var diseaseName = valueArray[9];
		var outcome = valueArray[10];
		if($.inArray(district, districtArray) == -1){
			districtArray.push(district);
		}
		if($.inArray(diseaseName, diseaseArray) == -1){
			diseaseArray.push(diseaseName);
		}
	});
	
	// create the first row of header
	html += "<th rowspan='2' style='text-align:center;'>District</th>";
	$.each(diseaseArray, function(i, disease){
		html += "<th colspan='2' style='text-align:center;'>"+disease+"</th>";
	});
	html += "<tr>";
	$.each(diseaseArray, function(i, disease){
		html += "<th  style='text-align:center;'>Cases</th><th  style='text-align:center;'>Deaths</th>";
	});
	html += "</tr></thead><tbody>";
	
	// create the data rows
	$.each(districtArray, function(i, district ) {
		var dataRow = "";
		var rowWithDeath = false;
		$.each(diseaseArray, function(j, disease ) {
			var caseCount = 0;
			var deathCount = 0;
			$.each(rows, function(k, valueArray ) {
				if(valueArray[8] == district && valueArray[9] == disease){
					caseCount++;
					if(valueArray[10] == "Death"){
						deathCount++;
					}
				}
			});
			if(deathCount > 0){
				rowWithDeath = true;
				dataRow += "<td>"+caseCount+"</td><td style='font-weight:bold;color:red'>"+deathCount+"</td>";
			}else{
				dataRow += "<td>"+caseCount+"</td><td>"+deathCount+"</td>";
			}
		});
		if(rowWithDeath){
			html += "<tr class='listAlternateRow rowWithDeath'><td>"+district+"</td>"+dataRow;
		}else{
			if((i % 2)>0){
				html += "<tr class='listAlternateRow'><td>"+district+"</td>"+dataRow;
			}else{
				html += "<tr><td>"+district+"</td>"+dataRow;
			}
		}
		html += "</tr>";
	});
	html += "</table>";
	
	if(rows.length == 0){
		html = "There are no cases/deaths reported.";
	}
	return html;
}

function setCumulativeValues(data){
	var width = data.width;
	var height = data.height;
	var headers = data.headers;
	var rows = data.rows;
			
	for (var i = 0; i <= height; i++) {
		var indicator = rows[i][0];
		indicator = indicator.replace(/ |[(]|[)]/g ,"")
		var value = 0;
		for(j = 0; j < height; j++){
			var tempIndicator = rows[j][0];
			tempIndicator = tempIndicator.replace(/ |[(]|[)]/g ,"")
			if(tempIndicator == indicator){
				value = value+Number(rows[j][2]); 
			}
		}
		var tableCellId = indicator.replace(/ |[(]|[)]/g ,"")+"_cumulative";
		$('#'+tableCellId).html(Math.round(value));
	}
}

function prepareAgeSexDistributionTable(jsonData){
	
	
}