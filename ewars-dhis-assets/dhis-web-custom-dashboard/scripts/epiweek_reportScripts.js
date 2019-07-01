$(document).ready(function(){
	// Get date and period from the report index page
	//var date = dhis2.report.date; // date which the reporting period starts
	//var pe = dhis2.report.periods;
	//var periods = prepare2YearPeriods(pe); // 2 Years periods for comparative trend
	
	// Display the report period on the header of the report
	//pe = String(pe);
	var epiWeeks = generateEpiWeeks();
	var options = "";
	for(i = 0;i < epiWeeks.length; i++){
		options += "<option value='"+epiWeeks[i]+"'>"+epiWeeks[i]+"</option>";
	}
	
	$("#reportingPeriod").append(options);
	
	$("#reportingPeriod").change(function(){
		var p = $(this).val();
		update(p);
	});
	
	update(null);
	
	// The report generated date, the date when the report is generated
	var reportDate = new Date();
	$("#rdate").html(reportDate.toISOString().slice(0, 10));
	$("#report-title").html("EWARS Weekly Report - Nepal");
	
	function update(p){
		var dates;
		if( p!= null){
			year = p.split("W")[0];
			week = p.split("W")[1];
			dates = dateBand(year,week);
		}else{
			var dates = myDates();
		}
		
		
		//$("#period").html("Week "+1+ " of " + year+" ["+dates[0]+" - "+dates[1]+"]");
		
		$( ".placeholder" ).html("<div class='loading'><i class='fa fa-cog fa-spin'></i> Loading...</div>");
	
		// Age and Sex wise distribution table
		var eventQueryUrl = "../api/analytics/events/query/uoCswKjfyiM.json?stage=uTJBFFVYXqA";
		eventQueryUrl += "&startDate="+dates[0];
		eventQueryUrl += "&endDate="+dates[1];
		eventQueryUrl += "&dimension=ou:cCTQiGkKcTk";//+ouid;
		eventQueryUrl += "&dimension=pC8BBR3B0XX&dimension=eHZ62Y25h0e&dimension=caMyqMax9y7&dimension=cKzz4abGMmu&dimension=wwT2BLUXNS3&dimension=FELaEBjk7li";
		eventQueryUrl += "&displayProperty=NAME";

		var json;
		jQuery.getJSON(eventQueryUrl, function(data){
			json = rowToJson(data.rows);
			var tableHtml = prepareAgeSexDistributionTable(json);
			$( "#table1" ).html(tableHtml);
			var tableHtml2 = prepareHfWiseTable(json);
			$("#hfcasedeath").html(tableHtml2);
			
			var tableHtml3 = prepareDistrictWiseTable(json);
			$("#districtwise").html(tableHtml3);
		});
	}	
	
			
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