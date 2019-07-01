var baseApiUrl = "../api/analytics.json?";
var periods = "";
var periodType;
var years;
var periodFrom;
var periodTo;
var disease;

function dashboard(years, peType, peFrom, peTo, disease){
	
	periodType = peType;
	periodFrom = peFrom;
	periodTo = peTo;

	/*if(periodType == "y"){var count = Number(periodTo)-Number(periodFrom);for(var i = 0; i <= count; i++){
	var p = Number(periodFrom)+Number(i);periods += p+";";}periods = periods.substr(0,periods.length-1);}*/
	
	/*---------- Generate the periods to fetch data --------------*/
	if(periodType == "m"){
		var count = Number(periodTo)-Number(periodFrom);
		for(var i = 0; i <= count; i++){
			for(j = 0; j < years.length; j++){
				var p = Number(periodFrom)+Number(i);
				if(Number(p)<10){
					p = "0"+p;
				}
				periods += years[j]+p+";";
			}
		}
		periods = periods.substr(0,periods.length-1);
	}
	
	if(periodType == "w"){
		var count = Number(periodTo)-Number(periodFrom);
		for(var i = 0; i <= count; i++){
			for(j = 0; j < years.length; j++){
				var p = Number(periodFrom)+Number(i);
				periods += years[j]+"W"+p+";";
			}
		}
		periods = periods.substr(0,periods.length-1);
	}
	
	/*---------------------------------------------------------------*/
	//if(disease == "age"){
		// Set the data elements for all required outputs here 
		// Data Elements for Age and Sex Distribution table
		var ageCasesDataElements = "trsbCQGih8x.Czd6mc4biSD;trsbCQGih8x.aKAnRJwKODA;trsbCQGih8x.BgzVO4Xfcc3;trsbCQGih8x.V8tSVdl0OJH;trsbCQGih8x.B4v3aVQ7Q7H;trsbCQGih8x.gwjaNzfWPiR;trsbCQGih8x.npfX41XBhxD;trsbCQGih8x.BZpq2hkj9vp";
		ageCasesDataElements += ";trsbCQGih8x.ULv17SIiQd3;trsbCQGih8x.BOk5le33xTt;trsbCQGih8x.vpo3ZLxbSV3;trsbCQGih8x.DXogqx4UG2L;trsbCQGih8x.E4RuIWGqbXt;trsbCQGih8x.uvF562vulWB;trsbCQGih8x.SxA1xejAOXa;trsbCQGih8x.y4kEvLLM8ZF";
		var url = prepareApiUrl(ageCasesDataElements, "LEVEL-1");
		//alert(url)
		var jsonData = dataElementsToJson(url);
		var response = confirm("You are about to load the data, are you sure?");
		if (response){
			loadPivotUI(jsonData);
		}else{
			return false;
		}
		
		//prepareChart(jsonData);
		
		// Indicators for chart
		//var ageIndicators = "vS5Ho83XVlU;RcdW5UfrIP2;Twsbi9aN3bf;kzFWN0fv5IQ;W1thycu7ISX;RzohdGu4zER";
		//var url = prepareApiUrl(ageIndicators, "level-5");
	//}
}

function prepareApiUrl(dataElements, ouLevels){
	var apiUrl = "";
	apiUrl = baseApiUrl+"dimension=dx:"+dataElements;
	
	// Add the periods to the url
	apiUrl += "&dimension=pe:"+periods;
	
	// Add the organization units to the url
	apiUrl += "&filter=ou:"+ouLevels;
	
	// Add the properties to get
	apiUrl += "&displayProperty=NAME&outputIdScheme=NAME";

	// Return the complete URL
	return apiUrl;
}

function dataElementsToJson(apiUrl){
	var jsonObj = [];
	jQuery.getJSON(apiUrl, function(data) {
		
		var width = data.width;
		var height = data.height;
		var headers = data.headers;
		var rows = data.rows;
		
		var year;
		var period;
		var disease;
		
		for (var i = 0; i < height; i++) {
			var itemAgeGenderType = rows[i][0];
			// get the age group only	AGE 1-4 Years, Case, Female
			var temp = itemAgeGenderType.split(",");
			disease = temp[0].split(" ")[0];
			var ageGroup = temp[0].split(" ")[1]+" Years";
			var gender = temp[2];
			var type = temp[1];
			var itemPeriod = rows[i][1];
				
			// Get the year and Month
			if(periodType == "m"){
				year = itemPeriod.substr(itemPeriod.length-4,4);
				period = itemPeriod.substr(0, itemPeriod.length-5);
			}else if(periodType == "w"){
				year = itemPeriod.substr(0,4);
				period = "W"+itemPeriod.split("W")[1];
			}
			
			var itemValue = Number(rows[i][2]);
			var obj = { 
				Year: year,
				Period: period,
				Disease:disease,
				AgeGroup: ageGroup,
				Gender: gender,
				Type: type,
				Value : itemValue
			};
			jsonObj.push(obj);
		}
	});
	return jsonObj;
}

/*function indicatorsToJson(apiUrl){
	var json = [];
	jQuery.getJSON(apiUrl, function(data) {
		var width = data.width;
		var height = data.height;
		var headers = data.headers;
		var rows = data.rows;
		
		var year;
		var period;		
		
		for (var i = 0; i < height; i++) {
			var itemAgeGenderType = rows[i][0];
			
			// get the age group only	AGE 1-4 Years, Case, Female
			var temp = itemAgeGenderType.split(",");
			var ageGroup = temp[0].split(" ")[1]+" Years";
			var gender = temp[2];
			var type = temp[1];
			var itemPeriod = rows[i][1];
				
			// Get the year and Month
			if(periodType == "m"){
				year = itemPeriod.substr(itemPeriod.length-4,4);
				period = itemPeriod.substr(0, itemPeriod.length-5);
			}else if(periodType == "w"){
				year = itemPeriod.substr(0,4);
				period = "W"+itemPeriod.split("W")[1];
			}
	
			var itemValue = Number(rows[i][2]);
			var obj = { 
				Year: year,
				Period: period,	// Month or Week
				AgeGroup: ageGroup,
				Gender: gender,
				Type: type,
				Value : itemValue
			};
			json.push(obj);
		}
	});
	return json;
}*/

function prepareAgeSexDistributionTable(json){
	$("#table1").show();
	var sum = $.pivotUtilities.aggregatorTemplates.sum;
    var numberFormat = $.pivotUtilities.numberFormat;
    var intFormat = numberFormat({digitsAfterDecimal: 0});
    $("#ageSexDist").pivot( json, {
        rows: ["Year","Period"],
        cols: ["AgeGroup","Type", "Gender"],
        aggregator: sum(intFormat)(["Value"])
    });
}

function loadPivotUI(json){
	$("#table1").show();	
	var sum = $.pivotUtilities.aggregatorTemplates.sum;
    var numberFormat = $.pivotUtilities.numberFormat;
    var intFormat = numberFormat({digitsAfterDecimal: 0});
    var renderers = $.extend($.pivotUtilities.renderers, $.pivotUtilities.c3_renderers);
    $("#ageSexDist").pivotUI(json, {
		renderers: renderers
	});
}

function prepareChart(json){
	var sampleData = [
        { Day: 'Monday', Running: 30, Swimming: 5, Cycling: 25, Riding: 10 },
        { Day: 'Tuesday', Running: 25, Swimming: 25, Cycling: 0, Riding: 15 },
        { Day: 'Wednesday', Running: 30, Swimming: 5, Cycling: 25, Riding: 25 },
        { Day: 'Thursday', Running: 35, Swimming: 25, Cycling: 45, Riding: 15 },
		{ Day: 'Friday', Running: 5, Swimming: 20, Cycling: 25, Riding: 5 },
        { Day: 'Saturday', Running: 30, Swimming: 0, Cycling: 30, Riding: 30 },
        { Day: 'Sunday', Running: 60, Swimming: 45, Cycling: 5, Riding: 20 }
    ];

	var label = {
        visible: true,
        padding: { left: 5, right: 5, top: 0, bottom: 0 }
    }
			
    // prepare jqxChart settings
    var settings = {
		title: "Top 5 most populated countries",
		description: "Statistics for 2011",
		showLegend: true,
		enableAnimations: true,
		padding: { left: 20, top: 5, right: 20, bottom: 5 },
		titlePadding: { left: 90, top: 0, right: 0, bottom: 10 },
		source: json,
		xAxis:{dataField: 'Period', gridLines: {visible: false}, flip: false},
		valueAxis:{flip: false, gridLines: {visible: false}, labels: {visible: true}},
		colorScheme: 'scheme06',
		seriesGroups:[{
			type: 'column',
			series: [
				{ dataField: 'Value', displayText: 'Value' },
				//{ dataField: 'Value', displayText: 'Percent' }
			],
			labels:label
		}]
	};

    // setup the chart
    $('#chartContainer').jqxChart(settings);
}