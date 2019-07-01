$(document).ready(function(){
	// Get date and period from the report index page
	var date = dhis2.report.date; // date which the reporting period starts
	//alert(date);
	var pe = dhis2.report.periods;
	var periods = prepare2YearPeriods(pe); // 2 Years periods for comparative trend
	
	// Display the report period on the header of the report
	pe = String(pe);
	$("#period").html("Week "+pe.split("W")[1] + " of " + pe.split("W")[0]);
		
	// The report generated date, the date when the report is generated
	var reportDate = new Date().toISOString().slice(0, 10);
	$("#rdate").html(reportDate);
		
	// Selected organization unit details
	var ou = dhis2.report.organisationUnit;
	var ouid = ou.id;
	var ouname = ou.name;
	var oucode = ou.code;
	
	$("#report-title").html("EWARS Weekly Report - "+ouname);
	
	$( ".placeholder" ).html("<div class='loading'><i class='fa fa-cog fa-spin'></i> Loading...</div>");
	
	// Age and Sex wise distribution table => load dataset report
	var dsrurl = "../dhis-web-reporting/generateDataSetReport.action?ds=ufFaHV9gH37&pe="+pe+"&ou="+ouid;
	$( "#table1" ).load( dsrurl+" #ewars-aggregate", function() {
		// URL for cumulative cases and death
		var period = String(pe);
		var year = Number(pe.split("W")[0]);
		var week = Number(pe.split("W")[1]);
		
		// Generate all periods till date
		var periodsTillDate = "";
		for (var k=week; k > 0;k--){
			periodsTillDate += year+"W"+k+";";
		}
		periodsTillDate = periodsTillDate.substr(0,periods.length-1);
		
		// Prepare the url to fetch the data to calculate cumulative values
		var cumulativeUrl = "../api/analytics.json?";
		cumulativeUrl += "dimension=dx:W1thycu7ISX;RzohdGu4zER;UblfxYCBL09;X0l2insa3vP;c2VV260HbOP;mtWJlANSVM9;sE31ZNjuGN5;egqj9Xy62jd;Tu6FxkSYjIJ;Q6jqMqiBbhT;AP1GLMnC833;CIRfFbeXauZ;JlMzVtIDfuZ;OwSOmfeN5K7;t32RaSCVImC;nfRabfgu1H7";
		cumulativeUrl += "&dimension=pe:"+periodsTillDate;
		cumulativeUrl += "&filter=ou:"+ouid;
		cumulativeUrl += "&displayProperty=NAME&outputIdScheme=NAME";
		
		// Get data from DHIS and prepare cumulative values
		jQuery.getJSON(cumulativeUrl, function(data) {
			setCumulativeValues(data);
		});
	});
	
	// For sitewise case/death table
	var hfUrl = "../api/analytics.json?";
	hfUrl += "dimension=dx:W1thycu7ISX;RzohdGu4zER;JlMzVtIDfuZ;OwSOmfeN5K7;c2VV260HbOP;mtWJlANSVM9;sE31ZNjuGN5;egqj9Xy62jd;Tu6FxkSYjIJ;Q6jqMqiBbhT;AP1GLMnC833;CIRfFbeXauZ;UblfxYCBL09;X0l2insa3vP;t32RaSCVImC;nfRabfgu1H7";
	hfUrl += "&dimension=ou:"+ouid+";LEVEL-5";
	hfUrl += "&filter=pe:"+pe;
	hfUrl += "&displayProperty=NAME&outputIdScheme=NAME";
	
	jQuery.getJSON(hfUrl, function(data) {
		var tableHtml = prepareIndicatorTable(data);
		$("#hfcasedeath").html(tableHtml);
	});
	
	// For district wise cases reported
	var eventUrl = "../api/analytics/events/query/uoCswKjfyiM.json?stage=uTJBFFVYXqA";
	eventUrl += "&dimension=pe:"+pe;		//=> period
	eventUrl += "&dimension=ou:"+ouid;		//=> organisationUnit
	eventUrl += "&dimension=pC8BBR3B0XX";	//=> id for district data element
	eventUrl += "&dimension=eHZ62Y25h0e";	//=> id for disease data element
	eventUrl += "&dimension=cKzz4abGMmu";	//=> id for outcome data element
	eventUrl += "&displayProperty=NAME";	//=> display property = name

	jQuery.getJSON(eventUrl, function(data) {
		var tableHtml1 = prepareEventTable(data);
		$("#districtwise").html(tableHtml1);
	});
	
	/* Charts:
		param1 => dataelement Id
		param2 => period
		param3 => ouid
		param4 => Title of the chart
		param5 => Target HTML element (id)
	*/
	
	createChart("W1thycu7ISX", periods, ouid,"AGE Trend","AGE_chart"); 									// AGE (W1thycu7ISX)
	createChart("UblfxYCBL09", periods, ouid,"Cholera Trend","cholera_chart"); 							// Cholera (UblfxYCBL09)
	createChart("JlMzVtIDfuZ", periods, ouid,"SARI Trend","sari_chart");								// SARI (JlMzVtIDfuZ)
	createChart("sE31ZNjuGN5", periods, ouid,"Kala-azar Trend","kalaazar_chart");						// Kala-azar (sE31ZNjuGN5)
	createChart("c2VV260HbOP", periods, ouid,"Dengue Trend","dengue_chart");							// Dengue (c2VV260HbOP)	
	createChart("AP1GLMnC833", periods, ouid,"Malaria Vivax Trend","malaria_vivax_chart");				// Malaria Vivax (AP1GLMnC833)
	createChart("Tu6FxkSYjIJ", periods, ouid,"Malaria Falciparum Trend","malaria_falciparum_chart");	// Malaria Falciparum (Tu6FxkSYjIJ)
	
	// Load Maps
	$( "#age_this_week" ).attr( "src", "../api/maps/vS0SNXmHHv8/data?width=530&date=" + date );
	$( "#sari_last_year" ).attr( "src", "../api/maps/Lv6ocMp8Hq8/data?width=530&date=" + date );
	$( "#dengue_last_year" ).attr( "src", "../api/maps/NttpTEtmHSJ/data?width=530&date=" + date );
		
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