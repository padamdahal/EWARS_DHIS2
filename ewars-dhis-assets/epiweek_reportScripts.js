$(document).ready(function(){
	var thisWeek;
	var thisYear;
	var masterJson;

	// Get date and period from the report index page
	var date = dhis2.report.date; // date which the reporting period starts
	var pe = dhis2.report.periods;
	//var periods = prepare2YearPeriods(pe); // 2 Years periods for comparative trend
	
	// Display the report period on the header of the report
	pe = String(pe);
	year = Number(pe.split("W")[0]);
	week = Number(pe.split("W")[1]);
	if(week<10){
		week = '0'+week;
	}
	pe = year+"W"+week;
	
	// The report generated date, the date when the report is generated
	var reportDate = new Date();
	$("#rdate").html(reportDate.toISOString().slice(0, 10));
	
	var alertDiseases = ['Malaria Falciparum','Kala azar','Dengue','Cholera'];
	alertDiseases.sort();
	var diseaseArray = ['AGE','SARI','Malaria Vivax','Malaria Falciparum','Kala azar','Dengue','Cholera'];
	diseaseArray.sort();
	
	var dates = dateBand(year,week);
	var firstWeekStartDate = formatDate(new Date(getFirstEpiWeekDate(year)));
	var lastYear = year-1;
	
	var lastYearStartDate = formatDate(new Date(getFirstEpiWeekDate(lastYear)));
	$("#period").html("Week "+week+ " of " + year +" ["+dates[0]+" to "+dates[1]+"]");
	$( ".placeholder" ).html("<div class='loading'><i class='fa fa-cog fa-spin'></i> Loading...</div>");
	var orgUnitId = dhis2.report.organisationUnit.id;
	//alert(dhis2.report.organisationUnit.id);
	getData(lastYearStartDate,dates[1],orgUnitId);
	reportingStatus(dateBand(year,week));
	
	/*$("#AGE_chart").pivot(d, {
			filter: function(event){if(event["disease"] == "AGE") return true;},
            cols: ["week"],
			rows: ["year"],
			title:"AGE Trend",
            renderer: $.pivotUtilities.c3_renderers["Line Chart"]
    });*/
	
	/*$("#sari_chart").pivot(d, {
			filter: function(event){if(event["disease"] == "SARI") return true;},
            cols: ["week"],
			rows: ["year"],
			title:"SARI Trend",
            renderer: $.pivotUtilities.c3_renderers["Line Chart"]
        });*/
	
	/*$("#malaria_vivax_chart").pivot(d, {
			filter: function(event){if(event["disease"] == "Malaria Vivax") return true;},
            cols: ["week"],
			rows: ["year"],
			title:"Malaria Vivax Trend",
            renderer: $.pivotUtilities.c3_renderers["Line Chart"]
    });*/
	
	function getData(startDate,endDate,ouid){
		var output;
		// API Url for event analytics
		var qryUrl = "../api/analytics/events/query/uoCswKjfyiM.json?stage=uTJBFFVYXqA";
		qryUrl += "&startDate="+startDate;
		qryUrl += "&endDate="+endDate;
		qryUrl += "&dimension=ou:"+ouid;
		qryUrl += "&dimension=pC8BBR3B0XX";
		qryUrl += "&dimension=eHZ62Y25h0e";
		qryUrl += "&dimension=caMyqMax9y7";
		qryUrl += "&dimension=cKzz4abGMmu";
		qryUrl += "&dimension=wwT2BLUXNS3";
		qryUrl += "&dimension=FELaEBjk7li";
		qryUrl += "&dimension=hLXJqD7b9im";
		qryUrl += "&displayProperty=NAME";
		
		jQuery.getJSON(qryUrl, function(data){
			//console.log(data.rows);
			//processJson(data.rows);
			processJson(data);
		});
	}
	
	function processJson(jsonData){
		var json = [];
		$.each(jsonData.rows,function(index,value){
			var ageGroup;
			if(value[10] < 1){
				ageGroup = "0 - 1 Years";
			}else if(value[10] >= 1 && value[10] < 5 ){
				ageGroup = "01 - 04 Years";
			}else if(value[10] >= 5 && value[10] < 15){
				ageGroup = "05 - 14 Years";
			}else if(value[10] >= 15){
				ageGroup = "15+ Years";
			}

			var j = {
				date: value[2].substr(0,10),
				hf: value[5],
				district: getNameByCode(value[8],jsonData.metaData),
				municipality: getNameByCode(value[14],jsonData.metaData),
				disease: value[9],
				ageGroup:ageGroup,
				outcome: value[11],
				sex: value[12],
				diagnosis: value[13],
				week: getWeekNumber(value[2].substr(0,10)),
				month: value[2].substr(5,2),
				year: getEpiYear(value[2].substr(0,10)),
				isDeath:(value[11] == 'death')?'yes':'no'
			}
			json.push(j);
		});
		
		masterJson = json;
		console.log(JSON.stringify(json,2,2));
		generateReportTables(json);
		createJqx(json,"AGE","AGE","Trend of AGE cases","AGE_chart");
		createJqx(json,"SARI","Severe Acute Respiratory Infection","Trend of SARI cases","sari_chart");
		createJqx(json,"Malaria Vivax","malaria_vivax_chart-Trend","malaria_vivax_chartTrend","malaria_vivax_chart");
		createJqx(json,"Kala azar","Kala-Azar","Trend of KA cases","kalaazar_chart");
		createJqx(json,"Cholera","Cholera","Trend of cholera cases","cholera_chart");
		createJqx(json,"Dengue","Dengue","Trend of Dengue cases","dengue_chart");
		createJqx(json,"Malaria Falciparum","Malaria Falciparum","Trend of Malaria Falciparum cases","malaria_falciparum_chart");
		//$("#sari_last_year").attr('src','../api/maps/X3HDwecbeYb/data');
		return json;
	}
	
	function generateReportTables(d){
		var jsonTw = d.filter(function(row){if(row["year"] == year && row["week"] == 'W'+week) return true;});
		var jsonTd = d.filter(function(row){if(row["year"] == year) return true;});		// For cumulative values
		//console.log(d);
		$( "#table1" ).html(prepareAgeSexDistributionTable(jsonTw,diseaseArray));
		fillCumulativeCaseDeath(jsonTd,diseaseArray);	
		
		$("#hfcasedeath").html(prepareHfWiseTable(jsonTw,diseaseArray));
		$("#districtwise").html(prepareDistrictWiseTable(jsonTw,diseaseArray));
	}
	
	/*function generateReportTables(p){
		var year = p.split("W")[0];
		var week = p.split("W")[1];
		var dates = dateBand(year,week);
		
		var d1 = d.filter(function(event){if(event["year"] == 2016) return true;});
	
		
		$("#period").html("Week "+week+ " of " + year +" ["+dates[0]+" to "+dates[1]+"]");
		$( ".placeholder" ).html("<div class='loading'><i class='fa fa-cog fa-spin'></i> Loading...</div>");
		
		var meUrl = "../api/me.json";
		jQuery.getJSON(meUrl, function(data){
			var ouid = data.organisationUnits[0].id; 
			var ouName = data.organisationUnits[0].name
			$("#report-title").html("EWARS Weekly Report - "+ouName);
		
			// API Url for event analytics
			var eventQueryUrl = "../api/analytics/events/query/uoCswKjfyiM.json?stage=uTJBFFVYXqA";
			eventQueryUrl += "&startDate="+dates[0];
			eventQueryUrl += "&endDate="+dates[1];
			eventQueryUrl += "&dimension=ou:"+ouid;
			eventQueryUrl += "&dimension=pC8BBR3B0XX";
			eventQueryUrl += "&dimension=eHZ62Y25h0e";
			eventQueryUrl += "&dimension=caMyqMax9y7";
			eventQueryUrl += "&dimension=cKzz4abGMmu";
			eventQueryUrl += "&dimension=wwT2BLUXNS3";
			eventQueryUrl += "&dimension=FELaEBjk7li";
			eventQueryUrl += "&displayProperty=NAME";

			jQuery.getJSON(eventQueryUrl, function(data){
				var json = rowToJson(data.rows);
			
				var tableHtml = prepareAgeSexDistributionTable(json,diseaseArray);
				$( "#table1" ).html(tableHtml);
			
				var tableHtml2 = prepareHfWiseTable(json,diseaseArray);
				$("#hfcasedeath").html(tableHtml2);
				
				var tableHtml3 = prepareDistrictWiseTable(json,diseaseArray);
				$("#districtwise").html(tableHtml3);
			});
			
			var firstWeekStartDate = new Date(getFirstEpiWeekDate(year));
			
			// API Url for event analytics
			var qryUrl = "../api/analytics/events/query/uoCswKjfyiM.json?stage=uTJBFFVYXqA";
			qryUrl += "&startDate="+formatDate(firstWeekStartDate);
			qryUrl += "&endDate="+dates[1];
			qryUrl += "&dimension=ou:"+ouid;
			qryUrl += "&dimension=pC8BBR3B0XX";
			qryUrl += "&dimension=eHZ62Y25h0e";
			qryUrl += "&dimension=caMyqMax9y7";
			qryUrl += "&dimension=cKzz4abGMmu";
			qryUrl += "&dimension=wwT2BLUXNS3";
			qryUrl += "&dimension=FELaEBjk7li";
			qryUrl += "&displayProperty=NAME";
			
			jQuery.getJSON(qryUrl, function(data){
				var json = rowToJson(data.rows);
				fillCumulativeCaseDeath(json,diseaseArray);
			});
		});
	}*/
	
	function getWeekNumber(date){
		var thisDate = new Date(date.substr(0,10));
		var year = thisDate.getFullYear();
		var stdt = getFirstEpiWeekDate(year);
		var week = 0;
		
		if(thisDate < stdt){
			year -= 1;
			var stdt = getFirstEpiWeekDate(year);
		}

		for (var d = stdt; d <= thisDate; d.setDate(d.getDate()+7)) {
			week++;
		}
		if(week < 10){
			week = '0'+week;
		}
		return "W"+week;
	}
	
	function getEpiYear(date){
		var thisDate = new Date(date.substr(0,10));
		
		var year = thisDate.getFullYear();
		var stdt = getFirstEpiWeekDate(year);
		
		if(thisDate < stdt){
			year -= 1;
			//var stdt = getFirstEpiWeekDate(year);
		}
		return year;
	}
	
	// Returns the Start date of first epidemiological week of the year 
	function getFirstEpiWeekDate(epiYear){
		var startDate = new Date(epiYear, 0, 01);
		var day = startDate.getDay();
		if(day == 0){

		}else if(day > 0 && day <= 3 ){
			startDate.setDate(startDate.getDate()-day); 
		}else{
			startDate.setDate(startDate.getDate()+(7-day));  
		}
		return startDate;
	}

	function formatDate(date){
		var month = date.getMonth()+1;
		if(month <10) month = "0"+month;
		
		var day = date.getDate();
		if(day < 10){
			day = "0"+day;
		}
		return date.getFullYear()+"-"+month+"-"+day;
	}
	
	function weekStartDates(epiYear){
		var datesArray = [];
		startDate = getFirstEpiWeekDate(epiYear);
		datesArray.push(startDate);
		
		for(i = startYear; i <= endYear;i++){
			var startDate = new Date(epiYear, 0, 01);
			var day = startDate.getDay();
			if(day > 0 && day <= 6 ){
				startDate.setDate(startDate.getDate()+6-(day-1)); 
			}
			
			var incrementVal = 7;
			for(j = 0; j < 53; j++){
				var week = j+1;
				
				var endDate = new Date(startDate);
				endDate.setDate(startDate.getDate()+6);
				
				var startMonth = startDate.getMonth()+1;
				var endMonth = endDate.getMonth()+1
				var sd = startDate.getFullYear()+"-"+startMonth+"-"+startDate.getDate();
				var ed = endDate.getFullYear()+"-"+endMonth+"-"+endDate.getDate();
				
				if(week == 53 && startDate.getFullYear()== i+1){
					
				}else{
					epiWeeks.push(i+"W"+week);//+" ["+sd+" to "+ed+"]");
				}
				startDate.setDate(startDate.getDate()+7);
			}
		}
		
		return epiWeeks;	
	}
	
	function generateEpiWeeks(){
		var epiWeeks = [];
		var startYear = 2012;
		var endYear = new Date().getFullYear();
		//var week = 1;
		
		for(i = startYear; i <= endYear;i++){
			var startDate = new Date(i, 0, 01);
			var day = startDate.getDay();
			if(day > 0 && day <= 6 ){
				startDate.setDate(startDate.getDate()+6-(day-1)); 
			}
			
			var incrementVal = 7;
			for(j = 0; j < 53; j++){
				var week = j+1;
				
				var endDate = new Date(startDate);
				endDate.setDate(startDate.getDate()+6);
				
				var startMonth = startDate.getMonth()+1;
				var endMonth = endDate.getMonth()+1
				var sd = startDate.getFullYear()+"-"+startMonth+"-"+startDate.getDate();
				var ed = endDate.getFullYear()+"-"+endMonth+"-"+endDate.getDate();
				
				if(week == 53 && startDate.getFullYear()== i+1){
					
				}else{
					epiWeeks.push(i+"W"+week);//+" ["+sd+" to "+ed+"]");
				}
				startDate.setDate(startDate.getDate()+7);
			}
		}
		
		return epiWeeks;	
	}
	 
	function dateBand(year, weekNumber){
		var dates = [];
		var startDate = new Date(year, 0, 01);
		var day = startDate.getDay();
		
		if(day == 0){

		}else if(day > 0 && day <= 3 ){
			startDate.setDate(startDate.getDate()-day); 
		}else{
			startDate.setDate(startDate.getDate()+(7-day));  
		}
		
		if(weekNumber != 1){
			for(i=1;i<weekNumber;i++){
				startDate.setDate(startDate.getDate()+7)
			}
			if(startDate.getFullYear()!= year){
				alert('Invalid period');
				return false;
			}
		}
		
		var endDate = new Date(startDate);
		endDate.setDate(startDate.getDate()+6);
		
		var startMonth = startDate.getMonth()+1;
		if(startMonth <10) startMonth = "0"+startMonth;
		var endMonth = endDate.getMonth()+1
		if(endMonth < 10) endMonth = "0"+endMonth;
		
		var startDay = startDate.getDate();
		if(startDay < 10){
			startDay = "0"+startDay;
		}
		var endDay = endDate.getDate();
		if(endDay < 10){
			endDay = "0"+endDay;
		}
		
		dates.push(startDate.getFullYear()+"-"+startMonth+"-"+startDay);
		dates.push(endDate.getFullYear()+"-"+endMonth+"-"+endDay);
		
		return dates;
	}
	
	function dataForChart(json,diseaseName){
		var weeksArray = [];
		$.each(json,function(key,jsonObj){
			if($.inArray(jsonObj.week, weeksArray) == -1){
				weeksArray.push(jsonObj.week);
			}
		});
		weeksArray.sort();
		
		var outputJson = [];
		var series = [{
			ty:year,
			ly:year-1
		}];
		var data = [];
		$.each(weeksArray,function(key,week){
			var thisYear = 0;
			var prevYear = 0;
			$.each(json,function(i,jsonObj){
				if(jsonObj.disease == diseaseName && jsonObj.week == week){
					if(jsonObj.year == year){
						thisYear++;
					}else{
						prevYear++;
					}
				}
			});
			
			var j = {
					week: week,
					[year]: thisYear,
					[year-1]: prevYear
			};
			data.push(j);
		});
		outputJson = {
			series:series,
			data:data
		};
		//if(diseaseName == "Cholera"){
			//alert(JSON.stringify(outputJson.data));
		//}
		return outputJson;
	}
	
	function getNameByCode(code, metaData){
		var r;
		$.each(metaData.items,function(index,value){
			if(value.code != 'undefined' && value.code == code){
				r = value.name;
			}
		});
		return r;
	}
	/*function weeklyDiseaseCount(jsonData){
		var json = [];
		$.each(jsonData,function(index,value){
			var date = value[2].substr(0,10);
			var week = getWeekNumber(date);
			var yyyy = getEpiYear(date);
			
			var j = {
				Date: date,
				Disease: value[9],
				Week: week,
				Year: yyyy
			}
			json.push(j);
		});
		return json;
	}*/

	/*function prepare2YearPeriods(pe){
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
	}*/

	/*function prepareUrl(dx,periods,ouid){
		var finalURL = "../api/analytics.json?";
		finalURL += "dimension=dx:"+dx;
		finalURL += "&dimension=pe:"+periods;
		finalURL += "&filter=ou:"+ouid;
		finalURL += "&displayProperty=NAME&outputIdScheme=NAME";
		return finalURL;
	}*/
		
	/*function prepareDataForGoogleChart(data){
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

	*/
	
	function loadChartImage(svg){
		svg.toImage();
	}

	/*function DataTable(jsonData){
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
	}*/

	/*function prepareIndicatorTable(jsonData){
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
	}*/

	/*function setCumulativeValues(data){
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
	}*/

	function prepareAgeSexDistributionTable(json,diseaseArray){
		if(json.length > 0){
			var ageGroupArray = ["0 - 1 Years","01 - 04 Years","05 - 14 Years","15+ Years"];
			var genderArray = ["Male", "Female"];
			
			$.each(json,function(key,jsonObj){
				var ageGroup = jsonObj.ageGroup;
				if($.inArray(ageGroup, ageGroupArray) == -1){
					ageGroupArray.push(ageGroup);
				}
			});
			ageGroupArray.sort();
			
			var html = "<table class='listTable gridTable'><thead><tr><th rowspan='3'>Disease</th>";
			$.each(ageGroupArray,function(index,value){
				html += "<th colspan='4'>"+value+"</th>";
			});
			html += "<th colspan='4'>Total</th>";
			html += "<th colspan='2'>Total Cases</th><th colspan='2'>Total Deaths</th></tr>";
			html += "<tr><th colspan='2'>Cases</th><th colspan='2'>Deaths</th><th colspan='2'>Cases</th><th colspan='2'>Deaths</th><th colspan='2'>Cases</th><th colspan='2'>Deaths</th><th colspan='2'>Cases</th><th colspan='2'>Deaths</th><th colspan='2'>Cases</th><th colspan='2'>Deaths</th><th rowspan='2'>This Week</th><th rowspan='2'>Cumulative</th><th rowspan='2'>This Week</th><th rowspan='2'>Cumulative</th></tr>";
			html += "<tr><th>M</th><th>F</th><th>M</th><th>F</th><th>M</th><th>F</th><th>M</th><th>F</th><th>M</th><th>F</th><th>M</th><th>F</th><th>M</th><th>F</th><th>M</th><th>F</th><th>M</th><th>F</th><th>M</th><th>F</th></tr></thead><tbody>";
			$.each(diseaseArray,function(index,disease){
				var clessThanOneMaleTotal = 0;
				var clessThanOneFemaleTotal = 0;
				var coneToFourMaleTotal = 0;
				var coneToFourFemaleTotal = 0;
				var cfiveToFourteenMaleTotal = 0;
				var cfiveToFourteenFemaleTotal = 0;
				var cfifteenPlusMaleTotal = 0;
				var cfifteenPlusFemaleTotal = 0;
				var cmaleTotal = 0;
				var cfemaleTotal = 0;
				var dlessThanOneMaleTotal = 0;
				var dlessThanOneFemaleTotal = 0;
				var doneToFourMaleTotal = 0;
				var doneToFourFemaleTotal = 0;
				var dfiveToFourteenMaleTotal = 0;
				var dfiveToFourteenFemaleTotal = 0;
				var dfifteenPlusMaleTotal = 0;
				var dfifteenPlusFemaleTotal = 0;
				var dmaleTotal = 0;
				var dfemaleTotal = 0;
				var caseTotal = 0;
				var deathTotal = 0;
				
				$.each(json,function(key,jsonObj){
					var diseaseName = jsonObj.disease;
					var ageGroup = jsonObj.ageGroup;
					var sex = jsonObj.sex;
					var outcome = jsonObj.outcome;
					if(diseaseName == disease){
						if(ageGroup == "0 - 1 Years" && sex == "Male"){
							clessThanOneMaleTotal++;
						}
						if(ageGroup == "0 - 1 Years" && sex == "Female"){
							clessThanOneFemaleTotal++;
						}
						if(ageGroup == "01 - 04 Years" && sex=="Male"){
							coneToFourMaleTotal++;
						}
						if(ageGroup == "01 - 04 Years" && sex=="Female"){
							coneToFourFemaleTotal++;
						}
						
						if(ageGroup == "05 - 14 Years" && sex=="Male"){
							cfiveToFourteenMaleTotal++;
						}
						
						if(ageGroup == "05 - 14 Years" && sex == "Female"){
							cfiveToFourteenFemaleTotal++;
						}
						
						if(ageGroup == "15+ Years" && sex == "Male"){
							cfifteenPlusMaleTotal++;
						}
						
						if(ageGroup == "15+ Years" && sex=="Female"){
							cfifteenPlusFemaleTotal++;
						}
						cmaleTotal = clessThanOneMaleTotal+coneToFourMaleTotal+cfiveToFourteenMaleTotal+cfifteenPlusMaleTotal;
						cfemaleTotal = clessThanOneFemaleTotal+coneToFourFemaleTotal+cfiveToFourteenFemaleTotal+cfifteenPlusFemaleTotal;
						caseTotal = cmaleTotal+cfemaleTotal;
					}
					if(diseaseName == disease && outcome == "Death"){
						if(ageGroup  == "0 - 1 Years" && sex=="Male"){
							dlessThanOneMaleTotal++;
						}
						if(ageGroup == "0 - 1 Years" && sex=="Female"){
							dlessThanOneFemaleTotal++;
						}
						
						if(ageGroup  == "01 - 04 Years"  && sex=="Male"){
							doneToFourMaleTotal++;
						}
						
						if(ageGroup  == "01 - 04 Years"  && sex=="Female"){
							doneToFourFemaleTotal++;
						}
						
						if(ageGroup == "05 - 14 Years" && sex=="Male"){
							dfiveToFourteenMaleTotal++;
						}
						
						if(ageGroup == "05 - 14 Years" && sex=="Female"){
							dfiveToFourteenFemaleTotal++;
						}
						
						if(ageGroup == "15+ Years" && sex=="Male"){
							dfifteenPlusMaleTotal++;
						}
						
						if(ageGroup == "15+ Years" && sex=="Female"){
							dfifteenPlusFemaleTotal++;
						}
						dmaleTotal = dlessThanOneMaleTotal+doneToFourMaleTotal+dfiveToFourteenMaleTotal+dfifteenPlusMaleTotal;
						dfemaleTotal = dlessThanOneFemaleTotal+doneToFourFemaleTotal+dfiveToFourteenFemaleTotal+dfifteenPlusFemaleTotal;
						deathTotal = dmaleTotal+dfemaleTotal;
					}
				});
				var caseCumulative = 0;
				var deathCumulative = 0;
				html += "<tr><td>"+disease+"</td>";
				html += "<td>"+clessThanOneMaleTotal+"</td><td>"+clessThanOneFemaleTotal+"</td>"+"<td>"+dlessThanOneMaleTotal+"</td><td>"+dlessThanOneFemaleTotal+"</td>";
				html += "<td>"+coneToFourMaleTotal+"</td><td>"+coneToFourFemaleTotal+"</td>"+"<td>"+doneToFourMaleTotal+"</td><td>"+doneToFourFemaleTotal+"</td>";
				html += "<td>"+cfiveToFourteenMaleTotal+"</td><td>"+cfiveToFourteenFemaleTotal+"</td>"+"<td>"+dfiveToFourteenMaleTotal+"</td><td>"+dfiveToFourteenFemaleTotal+"</td>";;
				html += "<td>"+cfifteenPlusMaleTotal+"</td><td>"+cfifteenPlusFemaleTotal+"</td>"+"<td>"+dfifteenPlusMaleTotal+"</td><td>"+dfifteenPlusFemaleTotal+"</td>";
				html += "<td>"+cmaleTotal+"</td><td>"+cfemaleTotal+"</td>"+"<td>"+dmaleTotal+"</td><td>"+dfemaleTotal+"</td>";;
				html += "<td>"+caseTotal+"</td><td><span id='"+disease.replace(" ","-").toLowerCase()+"-case-cumulative'>"+caseCumulative+"</span></td><td>"+deathTotal+"</td><td><span id='"+disease.replace(" ","-").toLowerCase()+"-death-cumulative'>"+deathCumulative+"</span></td>";
				html += "</tr>";
			});
			html += "</tbody></table>";
		}else{
			html = "No cases reported";
		}
		return html;
	}

	function prepareHfWiseTable(json,diseaseArray){
		
		if(json.length > 0){
			var hfArray = [];
			var html = "<table class = 'listTable gridTable' cellpadding='4' style='border-radius:5px;'><thead><tr>";

			$.each(json, function(i, jsonObj ) {
				var hf = jsonObj.hf;
				var diseaseName =  jsonObj.disease;
				var outcome =  jsonObj.outcome;
				if($.inArray(hf, hfArray) == -1){
					hfArray.push(hf);
				}
			});
			
			// create the first row of header
			html += "<th rowspan='2' style='text-align:center;'>Sentinel Site</th>";
			$.each(diseaseArray, function(i, disease){
				html += "<th colspan='2' style='text-align:center;'>"+disease+"</th>";
			});
			html += "<tr>";
			$.each(diseaseArray, function(i, disease){
				html += "<th  style='text-align:center;'>Cases</th><th  style='text-align:center;'>Deaths</th>";
			});
			html += "</tr></thead><tbody>";
			
			// create the data rows
			var totals = [];
			var caseTotal = [];
			var deathTotal = [];
			var caseCount = 0;
			var deathCount = 0;
			$.each(hfArray, function(i, hf ) {
				var dataRow = "";
				var rowWithDeath = false;
				$.each(diseaseArray, function(j, disease ) {
					caseCount = 0;
					deathCount = 0;
					$.each(json, function(k, jsonObj ) {
						if(jsonObj.hf == hf && jsonObj.disease == disease){
							caseCount++;
							if(jsonObj.outcome == "Death"){
								deathCount++;
							}
							caseTotal[disease] += caseCount;
							deathTotal[disease] += deathCount;
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
			html += "</table>";
		}else{
			html = "There are no cases/deaths reported.";
		}
		return html;
	}

	function prepareDistrictWiseTable(json,diseaseArray){
		if(json.length > 0){
			var districtArray = [];
			var html = "<table class ='listTable gridTable' cellpadding='4' style='border-radius:5px;'><thead><tr>";

			$.each(json, function(i, jsonObj ) {
				var district = jsonObj.district;
				//var diseaseName =  jsonObj.disease;
				//var outcome =  jsonObj.outcome;
				if($.inArray(district, districtArray) == -1){
					districtArray.push(district);
				}
			});
			
			// create the first row of header
			html += "<th rowspan='2' style='text-align:center;'>Sentinel Site</th>";
			$.each(diseaseArray, function(i, disease){
				html += "<th colspan='2' style='text-align:center;'>"+disease+"</th>";
			});
			html += "<tr>";
			$.each(diseaseArray, function(i, disease){
				html += "<th  style='text-align:center;'>Cases</th><th  style='text-align:center;'>Deaths</th>";
			});
			html += "</tr></thead><tbody>";
			
			// create the data rows
			var totals = [];
			var caseTotal = [];
			var deathTotal = [];
			var caseCount = 0;
			var deathCount = 0;
			$.each(districtArray, function(i, district ) {
				var dataRow = "";
				var rowWithDeath = false;
				$.each(diseaseArray, function(j, disease ) {
					caseCount = 0;
					deathCount = 0;
					$.each(json, function(k, jsonObj ) {
						if(jsonObj.district == district && jsonObj.disease == disease){
							caseCount++;
							if(jsonObj.outcome == "Death"){
								deathCount++;
							}
							caseTotal[disease] += caseCount;
							deathTotal[disease] += deathCount;
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
		}else{
			html = "There are no cases/deaths reported.";
		}
		return html;
	}

	function fillCumulativeCaseDeath(json,diseaseArray){
		if(json.length > 0){
			$.each(diseaseArray,function(index,disease){
				var caseCount = 0;
				var deathCount = 0;
				$.each(json,function(key,jsonObj){
					var diseaseName = jsonObj.disease;
					var outcome = jsonObj.outcome;
					if(diseaseName == disease && outcome != ""){
						caseCount++;
					}
					if(diseaseName == disease && outcome == "Death"){
						deathCount++;
					}
					$("#"+disease.replace(" ","-").toLowerCase()+"-case-cumulative").html(caseCount);
					$("#"+disease.replace(" ","-").toLowerCase()+"-death-cumulative").html(deathCount);
				});		
			});
		}
	}

	function reportingStatus(dates){
		var url = "../api/analytics/events/query/uoCswKjfyiM.json?stage=uTJBFFVYXqA&dimension=ou:LEVEL-6";
		url += "&dimension=eHZ62Y25h0e&startDate="+dates[0];
		url += "&endDate="+dates[1];
		url += "&displayProperty=NAME";
			
		jQuery.getJSON(url, function(data){
			var siteArray = [];
			$.each(data.rows,function(index,value){
				if($.inArray(value[5],siteArray) == -1){
					siteArray.push(value[5]);
				}
			});
			var reported = siteArray.length;	
			
			//call for level 5 orgUnits
			url = "../api/organisationUnits.json?level=6&paging=false";
			jQuery.getJSON(url, function(data){
				var expected = 0;

				$.each(data.organisationUnits,function(index,value){
					jQuery.getJSON(value.href, function(data){
						if(data.openingDate <= dates[0] && data.openingDate > "2000-01-01"){
							expected++;
						}

						var width = Math.round(reported/expected*100);
						var expectedText;
						if(width > 85){
							expectedText = "";
						}else{
							expectedText = "Expected: "+expected;
						}
						if(orgUnitId == 'cCTQiGkKcTk'){
							var html = '<div style="height:20px;padding-top:5px;background:lightgreen;width:'+width+'%;position:relative;float:left;text-align:center;">Reported: '+reported+' ('+width+'%)</div>'
							html += '<div style="height:20px;padding-top:5px;background:orange;width: '+(100-width)+'%;position:relative;float:right;text-align:center;">'+expectedText+'</div>';
							$( "#reportingStatus" ).html(html);
						}
					});
				});
			});
		});
	}

	function createJqx(data,diseaseName,chartTitle,description,chartContainer){
		var d = dataForChart(data,diseaseName);
		var series = d.series;
		sampleData = d.data;        
		// prepare jqxChart settings
            var settings = {
                title: chartTitle,
                description: description,
                enableAnimations: true,
                showLegend: true,
                padding: { left: 5, top: 5, right: 5, bottom: 5 },
                titlePadding: { left: 90, top: 0, right: 0, bottom: 10 },
                source: sampleData,
                colorScheme: 'scheme02',
                borderLineColor: '',
                xAxis:{
                    dataField: 'week',
                    unitInterval: 2,
                    tickMarks: {visible: true,interval: 1,color: '#ececec'},
                    gridLines:{visible: false,interval: 1,color: '#ececec'},
                    axisSize: 'auto'
                },
                valueAxis:{
                    visible: true,
                    //unitInterval: 10,
                    //minValue: 0,
                    //maxValue: 100,
                    title: { text: 'Number of cases' },
                    tickMarks: {color: '#ececec'},
                    gridLines: {color: '#ececec'},
                    axisSize: 'auto'
                },

                seriesGroups:[{
                    type: 'spline',
                    series: [{
						dataField: series[0].ly,
						displayText: series[0].ly,
						symbolType: 'circle',
						opacity: 0.5,
						//labels:{visible: true,padding: { left: 5, right: 5, top: 0, bottom: 0 }}
					}]
                },{
					type: 'column',
                    columnsGapPercent: 50,
                    seriesGapPercent: 5,
					series: [{
						dataField: series[0].ty,
						displayText: series[0].ty,
						opacity: 0.7,
						//labels:{visible: true,padding: { left: 5, right: 5, top: 0, bottom: 0 }}
					}]
                }]
            };

            // setup the chart
            $('#'+chartContainer).jqxChart(settings);
	}
	
	
	/********************************************************************************
	 *	Jquery Functions for report interaction										*
	 ********************************************************************************/
	// Add or edit the text inside .editable div
	$('.editable').dblclick(function () {
		$("#text_editor").draggable();
		var id = $(this).attr("id");
		var oldText = $('#'+id).html();
		$("#text").val(oldText);
		$('#text_editor').show();
			
		// Update the text of target div
		$('#update_text').click(function () {
			var newText = $("#text").val();
			$('#'+id).html(newText);
			id = null;
			$('#text_editor').hide();
		});
				
		// Close the editor
		$('#close_editor').click(function () {
			id = null;
			$('#text_editor').hide();
		});
	});
		
	// Load the text editor for chart description
	$('.interpretation').click(function () {
		$("#text_editor").draggable();
		var id = $(this).attr("target");
		var oldText = $('#'+id).html();
		$("#text").val(oldText);
		$('#text_editor').show();
				
		$('#update_text').click(function () {
			var newText = $("#text").val();
			$('#'+id).html(newText);
			id = null;
			$('#text_editor').hide();
		});
				
		$('#close_editor').click(function () {
			id = null;
			$('#text_editor').hide();
		});
	});
			
	// Convert the selected chart to image
	$(".toImage").click(function(){
		var target = $(this).attr("target");
		var svg = $("#"+target).find("svg");
		loadChartImage(svg);
	});
		
	// Show/Hide chart action buttons
	$(".chart_container_sm").hover(
		function() {
			var actionDiv = $(this).find("div#chart_actions");
			actionDiv.fadeIn("slow");
		}, function() {
			var actionDiv = $(this).find("div#chart_actions");
			actionDiv.fadeOut("slow");
		}
	);
	
}); // End of Document Ready