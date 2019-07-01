$(document).ready(function(){
	var today = new Date();
	var dates = lastWeek(today);
	var epiYear = new Date(dates[1]).getFullYear()
	var weekNumber = getWeekNumber(epiYear,dates[1]);
	$( "#dates" ).html(weekNumber+" ["+dates[0]+" to "+dates[1]+"]");
	
	var eventQueryUrl = "../api/analytics/events/query/uoCswKjfyiM.json?stage=uTJBFFVYXqA";
	eventQueryUrl += "&startDate="+dates[0];
	eventQueryUrl += "&endDate="+dates[1];
	eventQueryUrl += "&dimension=ou:cCTQiGkKcTk";
	eventQueryUrl += "&dimension=pC8BBR3B0XX&dimension=eHZ62Y25h0e&dimension=caMyqMax9y7&dimension=cKzz4abGMmu&dimension=wwT2BLUXNS3&dimension=FELaEBjk7li";
	eventQueryUrl += "&displayProperty=NAME";
		
	var json;
	jQuery.getJSON(eventQueryUrl, function(data){
		json = rowToJson(data.rows);
		var tableHtml = weeklyHighlight(json);
		$( "#weekly-highlight" ).html(tableHtml);
	});
	
	//html = "<table class='listTable gridTable' style='background:#fff;width:18%;position:relative;float:right;'><thead><tr><th>Reporting Status</th></tr></thead></table>";
	
	// Returns the HTML table of last week summary of each priority diseaseas
	function weeklyHighlight(json){
		if(json.length > 0){
			var alertDiseases = ['Malaria Falciparum','Kala azar','Dengue','Cholera'];
			var diseaseArray = ['AGE','SARI','Malaria Vivax','Malaria Falciparum','Kala azar','Dengue','Cholera'];
			/******************************************************
			$.each(json,function(key,jsonObj){
				var diseaseName = jsonObj.disease;
				if($.inArray(diseaseName, diseaseArray) == -1){
					diseaseArray.push(diseaseName);
				}
			});****************************************************/
			diseaseArray.sort();
			var html = "<table class='listTable gridTable' style='background:#fff;width:80%;position:relative;float:left;'><thead><tr><th>Disease</th>";
			$.each(diseaseArray,function(index,disease){
				html += "<th>"+disease+"</th>";
			});
			html += "</tr>";
			html += "<tbody><tr><td style='text-align:center;'>Total Cases</td>";
			
			$.each(diseaseArray,function(index,disease){
				var total_count = 0;
				$.each(json,function(key,jsonObj){
					var diseaseName = jsonObj.disease;
					if(diseaseName == disease){
						total_count++;
					}
				});
				if($.inArray(disease, alertDiseases) != -1 && total_count >0){
					html += "<td style='text-align:center;'>"+total_count+"<img style='margin:1px 0 0 5px;height:12px' src='../external-assets/dashboard_hack/alert.gif'/></td>";
				}else{
					html += "<td style='text-align:center;'>"+total_count+"</td>";
				}
			});
			html += "</tr></tbody></table>";
		}else{
			html = "No cases reported";
		}
		return html;
	}
	
	function rowToJson(jsonData){
		var json = [];
		$.each(jsonData,function(index,value){
			var age = value[10];
			var ageGroup;
			if(age < 1){
				ageGroup = "0 - 1 Years";
			}else if(age >= 1 && age < 5 ){
				ageGroup = "01 - 04 Years";
			}else if(age >= 5 && age < 15){
				ageGroup = "05 - 14 Years";
			}else if(age >= 15){
				ageGroup = "15+ Years";
			}
				
			var j = {
				date: value[2].substr(0,10),
				hf: value[5],
				district: value[8],
				disease: value[9],
				age: value[10],
				ageGroup:ageGroup,
				outcome: value[11],
				sex: value[12],
				diagnosis: value[13]
			}
			json.push(j);
		});
		return json;
	}

	// Returns the array of start date and end date of last epidemiological week
	function lastWeek(today){
		var dates = [];
		//var today = new Date();
		var day = today.getDay();
		var reportStart = new Date();
	
		reportStart.setDate(today.getDate()- (14+day));
		var reportEnd = new Date(reportStart);
		reportEnd.setDate(reportStart.getDate()+6);
	
		var startMonth = reportStart.getMonth()+1;
		if(startMonth < 10 )
			startMonth = "0"+startMonth;
		var endMonth = reportEnd.getMonth()+1;
		if(endMonth < 10 )
			endMonth = "0"+endMonth;

		var startDay = reportStart.getDate();
		var endDay = reportEnd.getDate();
	
		if(startDay < 10)
			startDay = "0"+startDay;
		if(endDay < 10)
			endDay = "0"+endDay;
	
		var sd = reportStart.getFullYear()+"-"+startMonth+"-"+startDay;
		var ed = reportEnd.getFullYear()+"-"+endMonth+"-"+endDay;
		dates.push(sd,ed);
		return dates;
	}

	// Returns the epidemiological week number which the given date falls
	function getWeekNumber(epiYear,endDate){
		var startDate = getFirstEpiWeekDate(epiYear);
		startDate = new Date(startDate);
		endDate = new Date(endDate);
		var timeDiff = Math.abs(endDate.getTime() - startDate.getTime());
		var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24))+1; 
		return endDate.getFullYear()+'W'+(Math.round(diffDays/7));
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
}); // End of Document Ready